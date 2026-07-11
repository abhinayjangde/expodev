import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  deletePhotos,
  getAlbumPhotos,
  requestPermissions,
} from "../../lib/media";
import { GalleryPhoto } from "../../lib/types";

const { width } = Dimensions.get("window");
const COLUMN_COUNT = 3;
const GAP = 2;
const PHOTO_SIZE = (width - GAP * (COLUMN_COUNT + 1)) / COLUMN_COUNT;

export default function AlbumDetailScreen() {
  const { id, title } = useLocalSearchParams<{ id: string; title: string }>();
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState(false);
  const router = useRouter();

  const loadPhotos = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const granted = await requestPermissions();
      setHasPermission(granted);
      if (granted) {
        const result = await getAlbumPhotos(id);
        setPhotos(result.photos);
      }
    } catch (error) {
      console.error("Error loading album photos:", error);
      Alert.alert("Error", "Failed to load album photos. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadPhotos();
  }, [loadPhotos]);

  const handleDelete = async (photo: GalleryPhoto) => {
    Alert.alert(
      "Delete Photo",
      "Are you sure you want to delete this photo? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const success = await deletePhotos([photo]);
            if (success) {
              setPhotos((prev) => prev.filter((p) => p.id !== photo.id));
            } else {
              Alert.alert(
                "Error",
                "Failed to delete photo. Please try again."
              );
            }
          },
        },
      ]
    );
  };

  if (!hasPermission) {
    return (
      <View className="flex-1 items-center justify-center bg-[#0a0a0a] px-8">
        <Stack.Screen options={{ headerShown: false }} />
        <View className="w-20 h-20 rounded-full bg-[#1c1c1e] items-center justify-center mb-6">
          <Ionicons name="lock-closed-outline" size={32} color="#636366" />
        </View>
        <Text className="text-[22px] font-semibold text-white mb-2 text-center">
          Access Required
        </Text>
        <Text className="text-[15px] text-[#8e8e93] text-center leading-6 mb-8 max-w-70">
          Grant photo library access to view this album.
        </Text>
        <TouchableOpacity
          onPress={loadPhotos}
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
        <Stack.Screen options={{ headerShown: false }} />
        <View className="w-12 h-12 rounded-full bg-[#1c1c1e] items-center justify-center mb-4">
          <Ionicons name="images-outline" size={24} color="#636366" />
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
      onLongPress={() => handleDelete(item)}
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
      <Stack.Screen
        options={{
          headerTitle: title || "Album",
          headerStyle: { backgroundColor: "#0a0a0a" },
          headerTintColor: "#fff",
          headerTitleStyle: { fontWeight: "600" },
        }}
      />
      <View className="px-5 pb-3">
        <Text className="text-[13px] text-[#636366]">
          {photos.length.toLocaleString()} items
          {photos.length > 0 && "  ·  Long press to delete"}
        </Text>
      </View>
      <FlatList
        data={photos}
        keyExtractor={(item) => item.id}
        renderItem={renderPhoto}
        numColumns={COLUMN_COUNT}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        columnWrapperStyle={{ paddingHorizontal: GAP / 2 }}
        ListEmptyComponent={
          <View className="items-center justify-center py-32">
            <View className="w-16 h-16 rounded-full bg-[#1c1c1e] items-center justify-center mb-4">
              <Ionicons name="images-outline" size={28} color="#636366" />
            </View>
            <Text className="text-[17px] text-[#636366] font-medium">
              No Photos
            </Text>
            <Text className="text-[13px] text-[#48484a] mt-1">
              This album is empty
            </Text>
          </View>
        }
      />
    </View>
  );
}
