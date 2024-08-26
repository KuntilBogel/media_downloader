interface MediaItem {
    url: string;
    type: 'image' | 'video';
}
interface Author {
    avatar: string | undefined;
    nickname: string;
}
interface MediaInfo {
    text: string;
    media: MediaItem[];
    author: Author;
    music: string | undefined;
}
interface GetDirectUrlsAndCountOptions {
    buffer?: boolean;
    text?: boolean;
}
interface GetDirectUrlsAndCountResult {
    urls: string[];
    count: number;
    buffers?: (Buffer | undefined)[];
    text?: string;
}
interface RequestResult {
    status: 'success' | 'error';
    request?: Record<string, string>;
    cookie?: string;
    message?: string;
}
interface MusicResult {
    status: 'success' | 'error';
    result?: string;
}
declare class TiktokDownloader {
    private readonly BASE_URL;
    private readonly API_URL;
    private readonly MUSIC_API_URL;
    private readonly AXIOS_TIMEOUT;
    private readonly MAX_RETRIES;
    constructor();
    private axiosWithRetry;
    getDirectUrlsAndCount(url: string, options?: GetDirectUrlsAndCountOptions): Promise<GetDirectUrlsAndCountResult>;
    getMediaInfo(url: string): Promise<MediaInfo>;
    private sanitizeHtml;
    getRequest(url: string): Promise<RequestResult>;
    getMusic(cookie: string): Promise<MusicResult>;
}
export default TiktokDownloader;
