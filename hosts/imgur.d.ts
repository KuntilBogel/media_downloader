interface ImageInfo {
    id: string;
    title: string | null;
    description: string | null;
    datetime: number;
    type: string;
    animated: boolean;
    width: number;
    height: number;
    size: number;
    views: number;
    link: string;
    mp4?: string;
    gifv?: string;
}
interface AlbumInfo {
    id: string;
    title: string | null;
    description: string | null;
    datetime: number;
    cover: string | null;
    images: ImageInfo[];
    imageCount: number;
    isAlbum: true;
}
type MediaInfo = ImageInfo | AlbumInfo;
interface DirectUrlsAndCount {
    urls: string[];
    count: number;
}
declare class ImgurDownloader {
    private readonly clientId;
    private readonly isProduction;
    constructor(isProduction?: boolean);
    getMediaInfo(url: string): Promise<MediaInfo | string[]>;
    private parseUrl;
    private fetchMediaInfo;
    private parseMediaInfo;
    private parseAlbumInfo;
    private parseSingleMediaInfo;
    private parseImageInfo;
    private getDirectUrls;
    private handleError;
    getDirectUrlsAndCount(url: string): Promise<DirectUrlsAndCount>;
}
export default ImgurDownloader;
