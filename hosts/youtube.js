"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_https_1 = __importDefault(require("node:https"));
const querystring_1 = __importDefault(require("querystring"));
class YouTubeDownloader {
    constructor() {
        this.SUPPORTED_SERVERS = ['en', 'id', 'es'];
        this.DEFAULT_TIMEOUT = 10000;
    }
    async getDirectUrlsAndCount(url) {
        try {
            if (!this.isValidYoutubeUrl(url)) {
                throw new Error('Invalid YouTube URL');
            }
            const cookies = await this.fetchCookies();
            const videoId = this.extractVideoId(url);
            const downloadUrls = await this.getDownloadUrls(videoId, cookies);
            return {
                urls: downloadUrls,
                count: downloadUrls.length,
            };
        }
        catch (error) {
            console.error('YouTube Downloader error:', error instanceof Error ? error.message : 'Unknown error');
            return { urls: [], count: 0 };
        }
    }
    async getDownloadUrls(videoId, cookies) {
        const postData = querystring_1.default.stringify({
            vid: videoId,
            k_query: `https://www.youtube.com/watch?v=${videoId}`,
            k_page: 'home',
            hl: this.SUPPORTED_SERVERS[0],
            q_auto: 0,
        });
        const response = await this.makeHttpRequest('www.y2mate.com', '/mates/analyzeV2/ajax', 'POST', postData, cookies);
        const downloadUrls = [];
        for (const format of ['mp4', 'mp3']) {
            for (const key in response.links[format]) {
                const item = response.links[format][key];
                if (item.f === format) {
                    const convertResponse = await this.convertMedia(videoId, item.k, cookies);
                    if (convertResponse.dlink) {
                        downloadUrls.push(convertResponse.dlink);
                    }
                }
            }
        }
        return downloadUrls;
    }
    async convertMedia(videoId, key, cookies) {
        const postData = querystring_1.default.stringify({ vid: videoId, k: key });
        return this.makeHttpRequest('www.y2mate.com', '/mates/convertV2/index', 'POST', postData, cookies);
    }
    async fetchCookies() {
        return new Promise((resolve, reject) => {
            const req = node_https_1.default.get('https://www.y2mate.com/en872', res => {
                const cookiesArray = res.headers['set-cookie'];
                resolve(cookiesArray || [
                    '_gid=GA1.2.2055666962.1683248123',
                    '_ga=GA1.1.1570308475.1683248122',
                    '_ga_K8CD7CY0TZ=GS1.1.1683248122.1.1.1683248164.0.0.0',
                    'prefetchAd_3381349=true',
                ]);
            });
            req.on('error', e => reject(new Error(`Failed to fetch cookies: ${e.message}`)));
            req.setTimeout(this.DEFAULT_TIMEOUT, () => {
                req.destroy();
                reject(new Error('Request to fetch cookies timed out'));
            });
        });
    }
    isValidYoutubeUrl(url) {
        const youtubeUrlRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
        return youtubeUrlRegex.test(url);
    }
    extractVideoId(url) {
        const urlObj = new URL(url);
        if (urlObj.hostname === 'youtu.be') {
            return urlObj.pathname.slice(1);
        }
        return urlObj.searchParams.get('v') || '';
    }
    makeHttpRequest(hostname, path, method, postData, cookies) {
        return new Promise((resolve, reject) => {
            const options = {
                hostname: hostname,
                path: path,
                method: method,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    Cookie: cookies.join('; '),
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36',
                },
                timeout: this.DEFAULT_TIMEOUT,
            };
            const req = node_https_1.default.request(options, res => {
                let data = '';
                res.on('data', chunk => {
                    data += chunk;
                });
                res.on('end', () => {
                    try {
                        resolve(JSON.parse(data));
                    }
                    catch (error) {
                        reject(new Error('Failed to parse API response'));
                    }
                });
            });
            req.on('error', e => reject(new Error(`HTTP request failed: ${e.message}`)));
            req.on('timeout', () => {
                req.destroy();
                reject(new Error('HTTP request timed out'));
            });
            if (postData) {
                req.write(postData);
            }
            req.end();
        });
    }
}
exports.default = YouTubeDownloader;
