import * as MediaLibrary from "expo-media-library";
import { GalleryAlbum, GalleryPhoto } from "./types";

export async function requestPermissions(): Promise<boolean> {
  const { status, canAskAgain } = await MediaLibrary.requestPermissionsAsync();
  if (status === "granted") return true;
  if (!canAskAgain) return false;
  return false;
}

export async function getAlbums(): Promise<GalleryAlbum[]> {
  const albums = await MediaLibrary.getAlbumsAsync({
    includeSmartAlbums: true,
  });

  const albumsWithCover = await Promise.all(
    albums.map(async (album) => {
      try {
        const assets = await MediaLibrary.getAssetsAsync({
          album: album.id,
          first: 1,
          mediaType: MediaLibrary.MediaType.photo,
        });

        const coverPhoto =
          assets.assets.length > 0
            ? {
                uri: assets.assets[0].uri,
                width: assets.assets[0].width,
                height: assets.assets[0].height,
              }
            : undefined;

        return {
          id: album.id,
          title: album.title,
          assetCount: album.assetCount,
          coverPhoto,
        };
      } catch {
        return {
          id: album.id,
          title: album.title,
          assetCount: album.assetCount,
          coverPhoto: undefined,
        };
      }
    })
  );

  return albumsWithCover.filter(
    (album) => album.assetCount > 0 && album.coverPhoto
  );
}

export async function getAlbumPhotos(
  albumId: string,
  first: number = 50,
  after?: string
): Promise<{ photos: GalleryPhoto[]; hasNextPage: boolean; endCursor: string }> {
  const result = await MediaLibrary.getAssetsAsync({
    album: albumId,
    first,
    after,
    mediaType: [MediaLibrary.MediaType.photo, MediaLibrary.MediaType.video],
    sortBy: MediaLibrary.SortBy.creationTime,
  });

  return {
    photos: result.assets.map((asset) => ({
      id: asset.id,
      uri: asset.uri,
      width: asset.width,
      height: asset.height,
      creationTime: asset.creationTime,
      mediaType: asset.mediaType === "video" ? "video" : "photo",
      duration: asset.duration,
      filename: asset.filename,
    })),
    hasNextPage: result.hasNextPage,
    endCursor: result.endCursor,
  };
}

export async function getAllPhotos(
  first: number = 50,
  after?: string
): Promise<{ photos: GalleryPhoto[]; hasNextPage: boolean; endCursor: string }> {
  const result = await MediaLibrary.getAssetsAsync({
    first,
    after,
    mediaType: [MediaLibrary.MediaType.photo, MediaLibrary.MediaType.video],
    sortBy: MediaLibrary.SortBy.creationTime,
  });

  return {
    photos: result.assets.map((asset) => ({
      id: asset.id,
      uri: asset.uri,
      width: asset.width,
      height: asset.height,
      creationTime: asset.creationTime,
      mediaType: asset.mediaType === "video" ? "video" : "photo",
      duration: asset.duration,
      filename: asset.filename,
    })),
    hasNextPage: result.hasNextPage,
    endCursor: result.endCursor,
  };
}

export async function deletePhotos(
  photos: GalleryPhoto[]
): Promise<boolean> {
  try {
    const assetIds = photos.map((photo) => photo.id);
    const result = await MediaLibrary.deleteAssetsAsync(assetIds);
    return result;
  } catch (error) {
    console.error("Error deleting photos:", error);
    return false;
  }
}

export function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  if (days < 365) return `${Math.floor(days / 30)} months ago`;
  return date.toLocaleDateString();
}
