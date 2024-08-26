interface DirectUrlsAndCount {
    urls: string[];
    count: number;
}
type Quality = 'sd' | 'hd';
declare class FacebookDownloader {
    private readonly BASE_URL;
    constructor();
    getDirectUrlsAndCount(url: string, quality?: Quality): Promise<DirectUrlsAndCount>;
    private getMediaInfo;
    private makeRequest;
    private parseResponse;
    private handleError;
    private getErrorMessage;
}
export default FacebookDownloader;
