"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const imgur_1 = __importDefault(require("./hosts/imgur"));
const reddit_1 = __importDefault(require("./hosts/reddit"));
const instagram_1 = __importDefault(require("./hosts/instagram"));
const facebook_1 = __importDefault(require("./hosts/facebook"));
const twitter_1 = __importDefault(require("./hosts/twitter"));
const pinterest_1 = __importDefault(require("./hosts/pinterest"));
const tiktok_1 = __importDefault(require("./hosts/tiktok"));
const youtube_1 = __importDefault(require("./hosts/youtube"));
const downloaders = {
    imgur: new imgur_1.default(),
    reddit: new reddit_1.default(),
    instagram: new instagram_1.default(),
    facebook: new facebook_1.default(),
    twitter: new twitter_1.default(),
    pinterest: new pinterest_1.default(),
    tiktok: new tiktok_1.default(),
    youtube: new youtube_1.default(),
};
const allowedHosts = {
    imgur: ['imgur.com', 'i.imgur.com'],
    reddit: ['reddit.com', 'www.reddit.com'],
    instagram: ['instagram.com', 'www.instagram.com'],
    facebook: ['facebook.com', 'www.facebook.com', 'fb.watch'],
    twitter: ['twitter.com', 'www.twitter.com', 'x.com', 'www.x.com'],
    pinterest: ['pinterest.com', 'www.pinterest.com', 'pin.it'],
    tiktok: ['tiktok.com', 'www.tiktok.com'],
    youtube: ['youtube.com', 'www.youtube.com', 'youtu.be'],
};
function isAllowedHost(hostname, service) {
    return allowedHosts[service].some(domain => hostname === domain ||
        (hostname.endsWith(`.${domain}`) &&
            hostname.lastIndexOf('.', hostname.length - domain.length - 2) === -1));
}
function sanitizeUrl(url) {
    return url.trim().slice(0, 2000);
}
async function MediaDownloader(url, specificHost) {
    try {
        const sanitizedUrl = sanitizeUrl(url);
        const urlObj = new URL(sanitizedUrl);
        if (!['http:', 'https:'].includes(urlObj.protocol)) {
            throw new Error('Unsupported protocol');
        }
        if (specificHost) {
            return await processSpecificHost(sanitizedUrl, specificHost);
        }
        const hostname = urlObj.hostname.toLowerCase();
        for (const host of Object.keys(allowedHosts)) {
            if (isAllowedHost(hostname, host)) {
                return await downloaders[host].getDirectUrlsAndCount(sanitizedUrl);
            }
        }
        throw new Error('Unsupported URL');
    }
    catch (error) {
        console.error(`Failed to process URL: ${error.message}`);
        return { urls: [], count: 0 };
    }
}
async function processSpecificHost(url, host) {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    if (isAllowedHost(hostname, host)) {
        return await downloaders[host].getDirectUrlsAndCount(url);
    }
    throw new Error('Unsupported host or URL');
}
exports.default = MediaDownloader;
