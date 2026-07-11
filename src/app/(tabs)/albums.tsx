import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
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
      <View className="flex-1 items-center justify-center bg-white px-6">
        <Ionicons name="lock-closed" size={64} color="#8e8e93" />
        <Text className="text-xl font-semibold text-gray-800 mt-4">
          Permission Required
        </Text>
        <Text className="text-gray-500 text-center mt-2">
          This app needs access to your photo library to display albums.
        </Text>
        <TouchableOpacity
          className="bg-blue-500 px-6 py-3 rounded-full mt-6"
          onPress={loadAlbums}
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
        <Text className="text-gray-500 mt-4">Loading albums...</Text>
      </View>
    );
  }

  const renderAlbum = ({ item }: { item: GalleryAlbum }) => (
    <TouchableOpacity
      className="flex-row items-center p-3 bg-white border-b border-gray-100"
      onPress={() =>
        router.push({
          pathname: "/album/[id]",
          params: { id: item.id, title: item.title },
        })
      }
    >
      <View className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100">
        {item.coverPhoto && (
          <Image
            source={{ uri: item.coverPhoto.uri }}
            className="w-full h-full"
            contentFit="cover"
          />
        )}
      </View>
      <View className="flex-1 ml-4">
        <Text className="text-lg font-semibold text-gray-800">{item.title}</Text>
        <Text className="text-gray-500">
          {item.assetCount} {item.assetCount === 1 ? "photo" : "photos"}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#c7c7cc" />
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-white">
      <FlatList
        data={albums}
        keyExtractor={(item) => item.id}
        renderItem={renderAlbum}
        contentContainerStyle={{ paddingBottom: 20 }}
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center py-20">
            <Ionicons name="albums-outline" size={64} color="#c7c7cc" />
            <Text className="text-gray-500 mt-4">No albums found</Text>
          </View>
        }
      />
    </View>
  );
}
