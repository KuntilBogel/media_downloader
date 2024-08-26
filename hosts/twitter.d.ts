interface GetDirectUrlsAndCountOptions {
    buffer?: boolean;
    text?: boolean;
}
interface GetDirectUrlsAndCountResult {
    urls: string[];
    count: number;
    buffers?: (Buffer | null)[];
    text?: string;
}
declare class TwitterDownloader {
    private readonly BASE_URL;
    constructor();
    getDirectUrlsAndCount(url: string, options?: GetDirectUrlsAndCountOptions): Promise<GetDirectUrlsAndCountResult>;
    private getMediaInfo;
}
export default TwitterDownloader;
