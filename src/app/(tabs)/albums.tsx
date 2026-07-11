import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Platform,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { getAlbums, requestPermissions } from "../../lib/media";
import { GalleryAlbum } from "../../lib/types";

export default function AlbumsScreen() {
  const [albums, setAlbums] = useState<GalleryAlbum[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState(false);
  const router = useRouter();

  const loadAlbums = useCallback(async () => {
    try {
      setLoading(true);
      const granted = await requestPermissions();
      setHasPermission(granted);
      if (granted) {
        const fetchedAlbums = await getAlbums();
        setAlbums(fetchedAlbums);
      }
    } catch (error) {
      console.error("Error loading albums:", error);
      Alert.alert("Error", "Failed to load albums. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAlbums();
  }, [loadAlbums]);

  if (!hasPermission) {
    return (
      <View className="flex-1 items-center justify-center bg-[#0a0a0a] px-8">
        <View className="w-20 h-20 rounded-full bg-[#1c1c1e] items-center justify-center mb-6">
          <Ionicons name="lock-closed-outline" size={32} color="#636366" />
        </View>
        <Text className="text-[22px] font-semibold text-white mb-2 text-center">
          Access Required
        </Text>
        <Text className="text-[15px] text-[#8e8e93] text-center leading-6 mb-8 max-w-70">
          Grant photo library access to view your albums and memories.
        </Text>
        <TouchableOpacity
          onPress={loadAlbums}
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
          <Ionicons name="albums-outline" size={24} color="#636366" />
        </View>
        <Text className="text-[15px] text-[#636366]">Loading albums...</Text>
      </View>
    );
  }

  const renderAlbum = ({ item, index }: { item: GalleryAlbum; index: number }) => (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() =>
        router.push({
          pathname: "/album/[id]",
          params: { id: item.id, title: item.title },
        })
      }
      style={{ marginBottom: 20, marginHorizontal: 16 }}
    >
      <View className="rounded-2xl overflow-hidden bg-[#1c1c1e]">
        <View className="w-full" style={{ height: 220 }}>
          {item.coverPhoto && (
            <Image
              source={{ uri: item.coverPhoto.uri }}
              style={{ width: "100%", height: "100%" }}
              contentFit="cover"
              transition={500}
            />
          )}
          <View
            className="absolute bottom-0 left-0 right-0"
            style={{
              height: 100,
            }}
          />
          <View className="absolute bottom-0 left-0 right-0 px-5 pb-4 pt-6">
            <View className="flex-row items-end justify-between">
              <View>
                <Text className="text-white text-[20px] font-bold">
                  {item.title}
                </Text>
                <Text className="text-white/70 text-[13px] mt-0.5">
                  {item.assetCount} {item.assetCount === 1 ? "item" : "items"}
                </Text>
              </View>
              <View className="w-9 h-9 rounded-full bg-white/15 items-center justify-center backdrop-blur-sm">
                <Ionicons name="chevron-forward" size={18} color="white" />
              </View>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-[#0a0a0a]">
      <View
        className="px-5 pt-2 pb-4"
        style={{ paddingTop: Platform.OS === "ios" ? 60 : (StatusBar.currentHeight ?? 24) + 16 }}
      >
        <Text className="text-[34px] font-bold text-white">Albums</Text>
      </View>
      <FlatList
        data={albums}
        keyExtractor={(item) => item.id}
        renderItem={renderAlbum}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        ListEmptyComponent={
          <View className="items-center justify-center py-32">
            <View className="w-16 h-16 rounded-full bg-[#1c1c1e] items-center justify-center mb-4">
              <Ionicons name="albums-outline" size={28} color="#636366" />
            </View>
            <Text className="text-[17px] text-[#636366] font-medium">
              No Albums Found
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
