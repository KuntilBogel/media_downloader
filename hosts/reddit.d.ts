interface UrlResult {
    urls: string[];
    count: number;
}
declare class RedditDownloader {
    constructor();
    getDirectUrlsAndCount(redditUrl: string): Promise<UrlResult>;
    private getMediaInfo;
    private processRedditPost;
}
export default RedditDownloader;
