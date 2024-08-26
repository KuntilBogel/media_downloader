"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
class RedditDownloader {
    constructor() { }
    async getDirectUrlsAndCount(redditUrl) {
        try {
            const urls = await this.getMediaInfo(redditUrl);
            return {
                urls: urls,
                count: urls.length,
            };
        }
        catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to process URL: ${error.message}`);
            }
            else {
                throw new Error('An unknown error occurred');
            }
        }
    }
    async getMediaInfo(redditUrl) {
        var _a, _b, _c;
        const url = redditUrl.endsWith('.json') ? redditUrl : `${redditUrl}.json`;
        try {
            const response = await axios_1.default.get(url);
            if ((_c = (_b = (_a = response.data) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.data) === null || _c === void 0 ? void 0 : _c.children) {
                const posts = response.data[0].data.children;
                const mediaUrls = [];
                for (const post of posts) {
                    const urls = this.processRedditPost(post.data);
                    mediaUrls.push(...urls);
                }
                return mediaUrls;
            }
            else {
                throw new Error('Unexpected response structure');
            }
        }
        catch (error) {
            if (error instanceof Error) {
                throw new Error(`Error fetching Reddit data: ${error.message}`);
            }
            else {
                throw new Error('An unknown error occurred while fetching Reddit data');
            }
        }
    }
    processRedditPost(postData) {
        var _a, _b, _c, _d, _e;
        const mediaUrls = [];
        if (postData.is_gallery && ((_a = postData.gallery_data) === null || _a === void 0 ? void 0 : _a.items)) {
            mediaUrls.push(...postData.gallery_data.items.map(item => `https://i.redd.it/${item.media_id}.jpg`));
        }
        else if (postData.is_video && ((_c = (_b = postData.media) === null || _b === void 0 ? void 0 : _b.reddit_video) === null || _c === void 0 ? void 0 : _c.fallback_url)) {
            mediaUrls.push(postData.media.reddit_video.fallback_url);
        }
        else if ((_e = (_d = postData.secure_media) === null || _d === void 0 ? void 0 : _d.oembed) === null || _e === void 0 ? void 0 : _e.thumbnail_url) {
            mediaUrls.push(postData.secure_media.oembed.thumbnail_url);
        }
        else if (postData.url) {
            mediaUrls.push(postData.url);
        }
        return mediaUrls;
    }
}
exports.default = RedditDownloader;
