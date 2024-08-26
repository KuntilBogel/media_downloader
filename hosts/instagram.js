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
const cheerio = __importStar(require("cheerio"));
const qs_1 = __importDefault(require("qs"));
const node_vm_1 = __importDefault(require("node:vm"));
class InstagramDownloader {
    constructor() {
        this.BASE_URL = 'https://v3.savevid.net/api/ajaxSearch';
        this.headers = {
            accept: '*/*',
            'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
            Referer: 'https://savevid.net/',
            'Referrer-Policy': 'strict-origin-when-cross-origin',
        };
    }
    executeJavaScript(code) {
        const sandbox = {
            result: '',
            document: {
                write: (html) => {
                    sandbox.result += html;
                },
                getElementById: (id) => ({
                    set innerHTML(content) {
                        if (id === 'download-result') {
                            sandbox.result = content;
                        }
                    },
                }),
            },
            window: {
                location: {
                    hostname: 'savevid.net',
                },
            },
            console: {
                log: (message) => {
                    console.log('Sandbox log:', message);
                },
                error: (message) => {
                    console.error('Sandbox error:', message);
                },
            },
        };
        try {
            const script = new node_vm_1.default.Script(code);
            const context = node_vm_1.default.createContext(sandbox);
            script.runInContext(context);
        }
        catch (error) {
            console.error('Error executing script:', error);
            console.error('Problematic code:', code);
        }
        return sandbox.result;
    }
    parseHtml(html) {
        const $ = cheerio.load(html);
        const result = [];
        $('.download-items').each((_, element) => {
            const videoDownloadLink = $(element)
                .find('.download-items__btn:not(.dl-thumb) > a')
                .attr('href');
            if (videoDownloadLink) {
                result.push(videoDownloadLink);
            }
            else {
                const highestQualityOption = $(element)
                    .find('.photo-option select option')
                    .first()
                    .attr('value');
                const imageDownloadLink = $(element)
                    .find('.download-items__btn > a')
                    .attr('href');
                if (highestQualityOption) {
                    result.push(highestQualityOption);
                }
                else if (imageDownloadLink) {
                    result.push(imageDownloadLink);
                }
            }
        });
        if (result.length === 0) {
            const shareLink = $('a[onclick="showShare()"]').attr('href');
            if (shareLink) {
                result.push(shareLink);
            }
        }
        return {
            results_number: result.length,
            url_list: result,
        };
    }
    async getMediaInfo(url) {
        try {
            const params = {
                q: url,
                t: 'media',
                lang: 'en',
                v: 'v2',
            };
            const response = await axios_1.default.post(this.BASE_URL, qs_1.default.stringify(params), {
                headers: this.headers,
            });
            const responseData = response.data.data;
            if (!responseData) {
                return { results_number: 0, url_list: [] };
            }
            let htmlContent;
            if (responseData.trim().startsWith('var')) {
                htmlContent = this.executeJavaScript(responseData);
            }
            else if (responseData.trim().startsWith('<ul class="download-box">')) {
                htmlContent = responseData;
            }
            else {
                console.error('Unexpected response format');
                return { results_number: 0, url_list: [] };
            }
            return this.parseHtml(htmlContent);
        }
        catch (error) {
            console.error('Error fetching Instagram data:', error);
            throw error;
        }
    }
    async getDirectUrlsAndCount(url) {
        const result = await this.getMediaInfo(url);
        return {
            urls: result.url_list,
            count: result.results_number,
        };
    }
}
exports.default = InstagramDownloader;
