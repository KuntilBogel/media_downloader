"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
class TwitterDownloader {
    constructor() {
        this.BASE_URL = 'https://api.vxtwitter.com';
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
                        const response = await axios_1.default.get(item.url, {
                            responseType: 'arraybuffer',
                            timeout: 10000,
                        });
                        return Buffer.from(response.data);
                    }
                    catch (error) {
                        console.warn('Error getting buffer:', error);
                        return null;
                    }
                }));
            }
            if (options.text) {
                result.text = mediaInfo.text;
            }
            return result;
        }
        catch (error) {
            console.error('Error in getDirectUrlsAndCount:', error);
            throw new Error(`Failed to process Twitter URL: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async getMediaInfo(url) {
        try {
            if (!/twitter\.com|x\.com/.test(url)) {
                throw new Error('Invalid Twitter URL');
            }
            const apiURL = `${this.BASE_URL}${new URL(url).pathname}`;
            const response = await axios_1.default.get(apiURL, {
                timeout: 10000,
            });
            const data = response.data;
            if (!data || !data.media_extended) {
                throw new Error('No media found');
            }
            return {
                text: data.text,
                media: data.media_extended.map(mediaItem => ({
                    url: mediaItem.url,
                    type: mediaItem.type,
                })),
            };
        }
        catch (error) {
            console.error('Error in getMediaInfo:', error);
            if (axios_1.default.isAxiosError(error) && error.response) {
                console.error('Response status:', error.response.status);
                console.error('Response data:', error.response.data);
            }
            throw new Error(`Error fetching Twitter data: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
}
exports.default = TwitterDownloader;
