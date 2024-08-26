"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const querystring = __importStar(require("querystring"));
const https = __importStar(require("https"));
const agent = new https.Agent();
class FacebookDownloader {
    constructor() {
        this.BASE_URL = 'https://172.67.222.44/api/ajaxSearch/facebook';
    }
    async getDirectUrlsAndCount(url, quality = 'sd') {
        try {
            const mediaInfo = await this.getMediaInfo(url);
            const selectedUrls = quality === 'hd' ? mediaInfo.links.hd : mediaInfo.links.sd;
            const urlArray = Array.isArray(selectedUrls) ? selectedUrls : [selectedUrls];
            return {
                urls: urlArray,
                count: urlArray.length,
            };
        }
        catch (error) {
            this.handleError('getDirectUrlsAndCount', error);
            throw new Error(`Failed to process Facebook URL: ${this.getErrorMessage(error)}`);
        }
    }
    async getMediaInfo(url) {
        try {
            const encodedUrl = querystring.escape(url);
            const response = await this.makeRequest(encodedUrl);
            return this.parseResponse(response.data);
        }
        catch (error) {
            this.handleError('getMediaInfo', error);
            throw new Error(`Error fetching Facebook data: ${this.getErrorMessage(error)}`);
        }
    }
    async makeRequest(encodedUrl, retries = 3) {
        try {
            return await (0, axios_1.default)({
                method: 'post',
                url: this.BASE_URL,
                headers: {
                    Host: 'x2download.app',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36 Edg/129.0.0.0',
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                },
                data: `q=${encodedUrl}`,
                httpsAgent: agent,
                timeout: 10000,
            });
        }
        catch (error) {
            if (retries > 0) {
                console.warn(`Request failed, retrying... (${retries} attempts left)`);
                return this.makeRequest(encodedUrl, retries - 1);
            }
            throw error;
        }
    }
    parseResponse(data) {
        if (!data || !data.links || (!data.links.hd && !data.links.sd)) {
            throw new Error('Invalid response from server');
        }
        return {
            title: data.title,
            duration: data.duration,
            thumbnail: data.thumbnail,
            links: {
                hd: data.links.hd,
                sd: data.links.sd,
            },
        };
    }
    handleError(methodName, error) {
        var _a;
        console.error(`Error in ${methodName}:`, error);
        if (axios_1.default.isAxiosError(error)) {
            console.error(`Axios error details: ${JSON.stringify((_a = error.response) === null || _a === void 0 ? void 0 : _a.data)}`);
        }
    }
    getErrorMessage(error) {
        if (error instanceof Error)
            return error.message;
        return String(error);
    }
}
exports.default = FacebookDownloader;
