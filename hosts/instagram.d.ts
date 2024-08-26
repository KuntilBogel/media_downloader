interface MediaInfo {
    results_number: number;
    url_list: string[];
}
declare class InstagramDownloader {
    private readonly BASE_URL;
    private readonly headers;
    constructor();
    private executeJavaScript;
    private parseHtml;
    getMediaInfo(url: string): Promise<MediaInfo>;
    getDirectUrlsAndCount(url: string): Promise<{
        urls: string[];
        count: number;
    }>;
}
export default InstagramDownloader;
