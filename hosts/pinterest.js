"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const node_crypto_1 = __importDefault(require("node:crypto"));
class PinterestDownloader {
    constructor() {
        this.BASE_URL = 'https://getindevice.com/wp-json/aio-dl/video-data/';
        this.COOKIE_URL = 'https://getindevice.com/pinterest-video-downloader/';
    }
    async getDirectUrlsAndCount(url) {
        try {
            const mediaInfo = await this.getMediaInfo(url);
            const videoMedia = mediaInfo.medias.find(media => media.videoAvailable);
            const imageMedia = mediaInfo.medias.find(media => !media.videoAvailable);
            const urlArray = [];
            if (videoMedia) {
                urlArray.push(videoMedia.url);
            }
            else if (imageMedia) {
                urlArray.push(imageMedia.url);
            }
            return {
                urls: urlArray,
                count: urlArray.length,
            };
        }
        catch (error) {
            console.error('Error in getDirectUrlsAndCount:', error);
            throw new Error(`Failed to process Pinterest URL: ${error.message}`);
        }
    }
    async getMediaInfo(url) {
        try {
            if (!/pinterest\.com|pin\.it/i.test(url)) {
                throw new Error('Invalid Pinterest URL');
            }
            const cookies = await this.getCookies();
            const response = await axios_1.default.post(this.BASE_URL, new URLSearchParams({
                url: url,
                token: this.generateSecureToken(),
            }), {
                headers: {
                    'sec-ch-ua': '"Not)A;Brand";v="24", "Chromium";v="116"',
                    'sec-ch-ua-platform': '"Android"',
                    Referer: 'https://getindevice.com/pinterest-video-downloader/',
                    'sec-ch-ua-mobile': '?1',
                    'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36',
                    Cookie: cookies.join('; '),
                },
                timeout: 10000,
                validateStatus: (status) => status >= 200 && status < 300,
            });
            const data = response.data;
            if (!data) {
                throw new Error('Invalid response from server');
            }
            return data;
        }
        catch (error) {
            console.error('Error in getMediaInfo:', error);
            if (axios_1.default.isAxiosError(error) && error.response) {
                console.error('Response status:', error.response.status);
                console.error('Response data:', error.response.data);
            }
            if (axios_1.default.isAxiosError(error) && error.code === 'ECONNABORTED') {
                throw new Error('Request timed out. Please try again later.');
            }
            throw new Error(`Error fetching Pinterest data: ${error.message}`);
        }
    }
    async getCookies() {
        try {
            const response = await axios_1.default.get(this.COOKIE_URL);
            return response.headers['set-cookie'] || [];
        }
        catch (error) {
            console.error('Error getting cookies:', error);
            throw new Error('Failed to retrieve necessary cookies. Please try again later.');
        }
    }
    generateSecureToken() {
        return node_crypto_1.default.randomBytes(16).toString('base64');
    }
}
exports.default = PinterestDownloader;
