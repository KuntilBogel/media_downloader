"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
class ImgurDownloader {
    constructor(isProduction = false) {
        this.clientId = '546c25a59c58ad7';
        this.isProduction = isProduction;
    }
    async getMediaInfo(url) {
        const { type, id } = this.parseUrl(url);
        try {
            const response = await this.fetchMediaInfo(type, id);
            const parsedData = this.parseMediaInfo(response.data);
            return this.isProduction ? this.getDirectUrls(parsedData) : parsedData;
        }
        catch (error) {
            const errorMessage = this.handleError(error, url);
            throw new Error(errorMessage);
        }
    }
    parseUrl(url) {
        var _a, _b, _c, _d, _e, _f;
        const urlObj = new URL(url);
        const pathParts = urlObj.pathname.split('/').filter(Boolean);
        if (urlObj.hostname === 'i.imgur.com') {
            return { type: 'image', id: (_b = (_a = pathParts[0]) === null || _a === void 0 ? void 0 : _a.split('.')[0]) !== null && _b !== void 0 ? _b : '' };
        }
        else if (pathParts.includes('gallery') || pathParts.includes('a')) {
            const id = (_d = (_c = pathParts[pathParts.length - 1]) === null || _c === void 0 ? void 0 : _c.split('.')[0]) !== null && _d !== void 0 ? _d : '';
            const finalId = id.includes('-') ? ((_e = id.split('-').pop()) !== null && _e !== void 0 ? _e : '') : id;
            return { type: 'album', id: finalId };
        }
        else {
            return { type: 'image', id: (_f = pathParts[pathParts.length - 1]) !== null && _f !== void 0 ? _f : '' };
        }
    }
    async fetchMediaInfo(type, id) {
        const endpoint = `https://api.imgur.com/3/${type}/${id}?client_id=${this.clientId}&include=media`;
        return await axios_1.default.get(endpoint);
    }
    parseMediaInfo(data) {
        if (data.data.is_album) {
            return this.parseAlbumInfo(data.data);
        }
        else {
            return this.parseSingleMediaInfo(data.data);
        }
    }
    parseAlbumInfo(albumData) {
        return {
            id: albumData.id,
            title: albumData.title || null,
            description: albumData.description || null,
            datetime: albumData.datetime,
            cover: albumData.cover
                ? `https://i.imgur.com/${albumData.cover}.${albumData.cover_ext}`
                : null,
            images: albumData.images.map((img) => this.parseImageInfo(img)),
            imageCount: albumData.images_count,
            isAlbum: true,
        };
    }
    parseSingleMediaInfo(mediaData) {
        return this.parseImageInfo(mediaData);
    }
    parseImageInfo(imageData) {
        return {
            id: imageData.id,
            title: imageData.title || null,
            description: imageData.description || null,
            datetime: imageData.datetime,
            type: imageData.type,
            animated: imageData.animated,
            width: imageData.width,
            height: imageData.height,
            size: imageData.size,
            views: imageData.views,
            link: imageData.link,
            mp4: imageData.mp4,
            gifv: imageData.gifv,
        };
    }
    getDirectUrls(parsedData) {
        if ('isAlbum' in parsedData) {
            return parsedData.images.map(img => img.link);
        }
        else {
            return [parsedData.link];
        }
    }
    handleError(error, url) {
        let errorMessage = `Failed to fetch media info for ${url}: `;
        if (axios_1.default.isAxiosError(error) && error.response) {
            errorMessage += `Status ${error.response.status}`;
            if (error.response.data &&
                error.response.data.data &&
                error.response.data.data.error) {
                errorMessage += ` - ${error.response.data.data.error}`;
            }
        }
        else if (axios_1.default.isAxiosError(error) && error.request) {
            errorMessage += 'No response received from server';
        }
        else {
            errorMessage += error instanceof Error ? error.message : String(error);
        }
        return errorMessage;
    }
    async getDirectUrlsAndCount(url) {
        try {
            const result = await this.getMediaInfo(url);
            let urls;
            if (Array.isArray(result)) {
                urls = result;
            }
            else if ('isAlbum' in result) {
                urls = result.images.map(img => img.link);
            }
            else {
                urls = [result.link];
            }
            return {
                urls: urls,
                count: urls.length,
            };
        }
        catch (error) {
            throw error;
        }
    }
}
exports.default = ImgurDownloader;
