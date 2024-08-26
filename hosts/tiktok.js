"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const cheerio_1 = __importDefault(require("cheerio"));
class TiktokDownloaderError extends Error {
    constructor(message) {
        super(message);
        this.name = 'TiktokDownloaderError';
    }
}
class TiktokDownloader {
    constructor() {
        this.AXIOS_TIMEOUT = 10000;
        this.MAX_RETRIES = 3;
        this.BASE_URL = 'https://musicaldown.com';
        this.API_URL = `${this.BASE_URL}/download`;
        this.MUSIC_API_URL = `${this.BASE_URL}/mp3/download`;
    }
    async axiosWithRetry(config, retries = 0) {
        try {
            return await (0, axios_1.default)({ ...config, timeout: this.AXIOS_TIMEOUT });
        }
        catch (error) {
            if (retries < this.MAX_RETRIES) {
                const delay = Math.pow(2, retries) * 1000;
                await new Promise(resolve => setTimeout(resolve, delay));
                return this.axiosWithRetry(config, retries + 1);
            }
            throw error;
        }
    }
    async getDirectUrlsAndCount(url, options = {}) {
        try {
            const mediaInfo = await this.getMediaInfo(url);
            const media = mediaInfo.media;
            const urlArray = media.map(item => item.url);
            const result = {
                urls: urlArray,
                count: urlArray.length,
            };
            if (options.buffer) {
                result.buffers = await Promise.all(media.map(async (item) => {
                    try {
                        const response = await this.axiosWithRetry({
                            method: 'get',
                            url: item.url,
                            responseType: 'arraybuffer',
                        });
                        return Buffer.from(response.data);
                    }
                    catch (error) {
                        console.warn('Error getting buffer:', error);
                        return undefined;
                    }
                }));
            }
            if (options.text) {
                result.text = mediaInfo.text;
            }
            return result;
        }
        catch (error) {
            throw new TiktokDownloaderError(`Failed to process TikTok URL: ${error.message}`);
        }
    }
    async getMediaInfo(url) {
        try {
            const request = await this.getRequest(url);
            if (request.status !== 'success' || !request.request || !request.cookie) {
                throw new TiktokDownloaderError(request.message || 'Failed to get request data');
            }
            const response = await this.axiosWithRetry({
                method: 'post',
                url: this.API_URL,
                data: new URLSearchParams(Object.entries(request.request)),
                headers: {
                    cookie: request.cookie,
                    'Content-Type': 'application/x-www-form-urlencoded',
                    Origin: 'https://musicaldown.com',
                    Referer: 'https://musicaldown.com/en',
                    'Upgrade-Insecure-Requests': '1',
                    'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:127.0) Gecko/20100101 Firefox/127.0',
                },
            });
            const $ = cheerio_1.default.load(response.data);
            const images = [];
            $("div.row > div[class='col s12 m3']").each((_, el) => {
                const src = $(el).find('img').attr('src');
                if (src)
                    images.push(src);
            });
            const videos = {};
            $("div[class='col s12 l8'] > a").each((i, el) => {
                const href = $(el).attr('href');
                if (href && href !== '#modal2') {
                    let text = $(el)
                        .text()
                        .trim()
                        .replace(/\s/, ' ')
                        .replace('arrow_downward', '')
                        .toLowerCase();
                    let key = text.includes('hd')
                        ? 'videoHD'
                        : text.includes('watermark')
                            ? 'videoWatermark'
                            : `video${i + 1}`;
                    videos[key] = href;
                }
            });
            const music = await this.getMusic(request.cookie);
            return {
                text: this.sanitizeHtml($('div.row > div > div > h2').eq(1).text()),
                media: images.length > 0
                    ? images.map(url => ({ url, type: 'image' }))
                    : Object.values(videos).map(url => ({
                        url,
                        type: 'video',
                    })),
                author: {
                    avatar: $('div.img-area > img').attr('src'),
                    nickname: this.sanitizeHtml($('div.row > div > div > h2').eq(0).text()),
                },
                music: music.result,
            };
        }
        catch (error) {
            throw new TiktokDownloaderError(`Error fetching TikTok data: ${error.message}`);
        }
    }
    sanitizeHtml(input) {
        return input.replace(/[&<>"']/g, char => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;',
        })[char] || char);
    }
    async getRequest(url) {
        var _a, _b;
        try {
            const response = await this.axiosWithRetry({
                method: 'get',
                url: this.BASE_URL,
                headers: {
                    Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                    'Update-Insecure-Requests': '1',
                    'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:127.0) Gecko/20100101 Firefox/127.0',
                },
            });
            const cookie = (_b = (_a = response.headers['set-cookie']) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.split(';')[0];
            if (!cookie) {
                throw new TiktokDownloaderError('Cookie not found in response headers');
            }
            const $ = cheerio_1.default.load(response.data);
            const input = $('div > input');
            const request = {
                [input.eq(0).attr('name') || '']: url,
                [input.eq(1).attr('name') || '']: input.eq(1).attr('value') || '',
                [input.eq(2).attr('name') || '']: input.eq(2).attr('value') || '',
            };
            return { status: 'success', request, cookie };
        }
        catch (error) {
            return { status: 'error', message: 'Failed to get the request form!' };
        }
    }
    async getMusic(cookie) {
        try {
            const response = await this.axiosWithRetry({
                method: 'get',
                url: this.MUSIC_API_URL,
                headers: {
                    cookie: cookie,
                    'Upgrade-Insecure-Requests': '1',
                    'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:127.0) Gecko/20100101 Firefox/127.0',
                },
            });
            const $ = cheerio_1.default.load(response.data);
            const music = $('audio > source').attr('src');
            return { status: 'success', result: music };
        }
        catch (error) {
            return { status: 'error' };
        }
    }
}
exports.default = TiktokDownloader;
