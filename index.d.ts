interface DownloaderResult {
    urls: string[];
    count: number;
}
type HostType = 'imgur' | 'reddit' | 'instagram' | 'facebook' | 'twitter' | 'pinterest' | 'tiktok' | 'youtube';
declare function MediaDownloader(url: string, specificHost?: HostType | null): Promise<DownloaderResult>;
export default MediaDownloader;
