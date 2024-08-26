interface DownloadResult {
    urls: string[];
    count: number;
}
declare class PinterestDownloader {
    private readonly BASE_URL;
    private readonly COOKIE_URL;
    getDirectUrlsAndCount(url: string): Promise<DownloadResult>;
    private getMediaInfo;
    private getCookies;
    private generateSecureToken;
}
export default PinterestDownloader;
