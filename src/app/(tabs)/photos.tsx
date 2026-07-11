import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { getAllPhotos, requestPermissions } from "../../lib/media";
import { GalleryPhoto } from "../../lib/types";

const { width } = Dimensions.get("window");
const COLUMN_COUNT = 3;
const PHOTO_SIZE = width / COLUMN_COUNT;

export default function AllPhotosScreen() {
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(true);
  const endCursorRef = useRef<string>("");
  const router = useRouter();

  const loadPhotos = useCallback(async (loadMore = false) => {
    try {
      if (loadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      const granted = await requestPermissions();
      setHasPermission(granted);

      if (granted) {
        const result = await getAllPhotos(
          50,
          loadMore ? endCursorRef.current : undefined
        );

        if (loadMore) {
          setPhotos((prev) => [...prev, ...result.photos]);
        } else {
          setPhotos(result.photos);
        }

        setHasNextPage(result.hasNextPage);
        endCursorRef.current = result.endCursor;
      }
    } catch (error) {
      console.error("Error loading photos:", error);
      Alert.alert("Error", "Failed to load photos. Please try again.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    loadPhotos();
  }, [loadPhotos]);

  if (!hasPermission) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-6">
        <Ionicons name="lock-closed" size={64} color="#8e8e93" />
        <Text className="text-xl font-semibold text-gray-800 mt-4">
          Permission Required
        </Text>
        <Text className="text-gray-500 text-center mt-2">
          This app needs access to your photo library to display photos.
        </Text>
        <TouchableOpacity
          className="bg-blue-500 px-6 py-3 rounded-full mt-6"
          onPress={() => loadPhotos()}
        >
          <Text className="text-white font-semibold">Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#2786bd" />
        <Text className="text-gray-500 mt-4">Loading photos...</Text>
      </View>
    );
  }

  const renderPhoto = ({ item, index }: { item: GalleryPhoto; index: number }) => (
    <TouchableOpacity
      onPress={() =>
        router.push({
          pathname: "/photo/[id]",
          params: { id: item.id, index: index.toString() },
        })
      }
    >
      <Image
        source={{ uri: item.uri }}
        style={{ width: PHOTO_SIZE - 2, height: PHOTO_SIZE - 2 }}
        className="m-0.5 rounded"
        contentFit="cover"
        transition={300}
      />
      {item.mediaType === "video" && (
        <View className="absolute bottom-1 right-1 bg-black/60 px-1.5 py-0.5 rounded">
          <Text className="text-white text-xs font-medium">
            {item.duration ? `${Math.round(item.duration)}s` : "Video"}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-white">
      <FlatList
        data={photos}
        keyExtractor={(item) => item.id}
        renderItem={renderPhoto}
        numColumns={COLUMN_COUNT}
        contentContainerStyle={{ paddingBottom: 20 }}
        onEndReached={() => {
          if (hasNextPage && !loadingMore) {
            loadPhotos(true);
          }
        }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loadingMore ? (
            <View className="py-4">
              <ActivityIndicator size="small" color="#2786bd" />
            </View>
          ) : null
        }
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center py-20">
            <Ionicons name="images-outline" size={64} color="#c7c7cc" />
            <Text className="text-gray-500 mt-4">No photos found</Text>
          </View>
        }
      />
    </View>
  );
}
