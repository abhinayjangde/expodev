export interface GalleryAlbum {
  id: string;
  title: string;
  assetCount: number;
  coverPhoto?: {
    uri: string;
    width: number;
    height: number;
  };
}

export interface GalleryPhoto {
  id: string;
  uri: string;
  width: number;
  height: number;
  creationTime: number;
  mediaType: "photo" | "video";
  duration?: number;
  filename: string;
}
