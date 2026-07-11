import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { deletePhotos, getAlbumPhotos, requestPermissions } from "../../lib/media";
import { GalleryPhoto } from "../../lib/types";

const { width } = Dimensions.get("window");
const COLUMN_COUNT = 3;
const PHOTO_SIZE = width / COLUMN_COUNT;

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
              Alert.alert("Error", "Failed to delete photo. Please try again.");
            }
          },
        },
      ]
    );
  };

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
          onPress={loadPhotos}
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
      onLongPress={() => handleDelete(item)}
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
      <Stack.Screen options={{ headerTitle: title || "Album" }} />
      <FlatList
        data={photos}
        keyExtractor={(item) => item.id}
        renderItem={renderPhoto}
        numColumns={COLUMN_COUNT}
        contentContainerStyle={{ paddingBottom: 20 }}
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center py-20">
            <Ionicons name="images-outline" size={64} color="#c7c7cc" />
            <Text className="text-gray-500 mt-4">No photos in this album</Text>
          </View>
        }
      />
    </View>
  );
}
