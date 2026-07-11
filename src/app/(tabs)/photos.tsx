import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Platform,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { getAllPhotos, requestPermissions } from "../../lib/media";
import { GalleryPhoto } from "../../lib/types";

const { width } = Dimensions.get("window");
const COLUMN_COUNT = 3;
const GAP = 2;
const PHOTO_SIZE = (width - GAP * (COLUMN_COUNT + 1)) / COLUMN_COUNT;

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
      if (loadMore) setLoadingMore(true);
      else setLoading(true);

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
      <View className="flex-1 items-center justify-center bg-[#0a0a0a] px-8">
        <View className="w-20 h-20 rounded-full bg-[#1c1c1e] items-center justify-center mb-6">
          <Ionicons name="lock-closed-outline" size={32} color="#636366" />
        </View>
        <Text className="text-[22px] font-semibold text-white mb-2 text-center">
          Access Required
        </Text>
        <Text className="text-[15px] text-[#8e8e93] text-center leading-6 mb-8 max-w-[280px]">
          Grant photo library access to view your entire collection.
        </Text>
        <TouchableOpacity
          onPress={() => loadPhotos()}
          activeOpacity={0.8}
          className="bg-[#0a84ff] rounded-full overflow-hidden"
          style={{ paddingHorizontal: 32, paddingVertical: 14 }}
        >
          <Text className="text-white font-semibold text-[16px]">
            Allow Access
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-[#0a0a0a]">
        <View className="w-12 h-12 rounded-full bg-[#1c1c1e] items-center justify-center mb-4">
          <Ionicons name="grid-outline" size={24} color="#636366" />
        </View>
        <Text className="text-[15px] text-[#636366]">Loading photos...</Text>
      </View>
    );
  }

  const renderPhoto = ({ item }: { item: GalleryPhoto }) => (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() =>
        router.push({
          pathname: "/photo/[id]",
          params: { id: item.id },
        })
      }
      style={{
        width: PHOTO_SIZE,
        height: PHOTO_SIZE,
        margin: GAP / 2,
        borderRadius: 6,
        overflow: "hidden",
      }}
    >
      <Image
        source={{ uri: item.uri }}
        style={{ width: "100%", height: "100%" }}
        contentFit="cover"
        transition={300}
      />
      {item.mediaType === "video" && (
        <View
          className="absolute bottom-1.5 right-1.5 flex-row items-center rounded-md"
          style={{
            backgroundColor: "rgba(0,0,0,0.65)",
            paddingHorizontal: 6,
            paddingVertical: 3,
            gap: 3,
          }}
        >
          <Ionicons name="play" size={10} color="white" />
          <Text className="text-white text-[10px] font-semibold">
            {item.duration ? `${Math.round(item.duration)}s` : ""}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-[#0a0a0a]">
      <View
        className="px-5 pt-2 pb-3"
        style={{ paddingTop: Platform.OS === "ios" ? 60 : (StatusBar.currentHeight ?? 24) + 16 }}
      >
        <Text className="text-[34px] font-bold text-white">Photos</Text>
        {photos.length > 0 && (
          <Text className="text-[13px] text-[#636366] mt-1">
            {photos.length.toLocaleString()} items
          </Text>
        )}
      </View>
      <FlatList
        data={photos}
        keyExtractor={(item) => item.id}
        renderItem={renderPhoto}
        numColumns={COLUMN_COUNT}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        columnWrapperStyle={{ paddingHorizontal: GAP / 2 }}
        onEndReached={() => {
          if (hasNextPage && !loadingMore) {
            loadPhotos(true);
          }
        }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loadingMore ? (
            <View className="py-6 items-center">
              <ActivityIndicator size="small" color="#636366" />
            </View>
          ) : null
        }
        ListEmptyComponent={
          <View className="items-center justify-center py-32">
            <View className="w-16 h-16 rounded-full bg-[#1c1c1e] items-center justify-center mb-4">
              <Ionicons name="images-outline" size={28} color="#636366" />
            </View>
            <Text className="text-[17px] text-[#636366] font-medium">
              No Photos Found
            </Text>
            <Text className="text-[13px] text-[#48484a] mt-1">
              Your photos will appear here
            </Text>
          </View>
        }
      />
    </View>
  );
}
