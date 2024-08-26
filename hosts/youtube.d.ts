interface DownloaderResult {
    urls: string[];
    count: number;
}
declare class YouTubeDownloader {
    private readonly SUPPORTED_SERVERS;
    private readonly DEFAULT_TIMEOUT;
    getDirectUrlsAndCount(url: string): Promise<DownloaderResult>;
    private getDownloadUrls;
    private convertMedia;
    private fetchCookies;
    private isValidYoutubeUrl;
    private extractVideoId;
    private makeHttpRequest;
}
export default YouTubeDownloader;
