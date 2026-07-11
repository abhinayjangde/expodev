import { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
  StyleSheet,
  FlatList,
} from "react-native";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import { getAllPhotos, deletePhotos, requestPermissions } from "@/lib/media";
import { GalleryPhoto } from "@/lib/types";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function PhotoViewerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const router = useRouter();
  const flatListRef = useRef<any>(null);

  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);

  const loadPhotos = useCallback(async () => {
    try {
      setLoading(true);
      const granted = await requestPermissions();
      setHasPermission(granted);

      if (granted) {
        const result = await getAllPhotos(100);
        setPhotos(result.photos);

        const initialIndex = result.photos.findIndex((p) => p.id === id);
        if (initialIndex !== -1) {
          setCurrentIndex(initialIndex);
        }
      }
    } catch (error) {
      console.error("Error loading photos:", error);
      Alert.alert("Error", "Failed to load photos. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadPhotos();
  }, [loadPhotos]);

  const handleDelete = async () => {
    if (photos.length === 0) return;

    Alert.alert(
      "Delete Photo",
      "Are you sure you want to delete this photo? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const photoToDelete = photos[currentIndex];
            const success = await deletePhotos([photoToDelete]);

            if (success) {
              const newPhotos = photos.filter(
                (p) => p.id !== photoToDelete.id
              );
              setPhotos(newPhotos);

              if (newPhotos.length === 0) {
                router.back();
              } else if (currentIndex >= newPhotos.length) {
                setCurrentIndex(newPhotos.length - 1);
              }
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

  const handleViewableItemsChanged = useCallback(
    ({ viewableItems }: any) => {
      if (viewableItems.length > 0) {
        setCurrentIndex(viewableItems[0].index || 0);
      }
    },
    []
  );

  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = Math.max(0.5, Math.min(savedScale.value * e.scale, 3));
    })
    .onEnd(() => {
      if (scale.value < 1) {
        scale.value = withSpring(1);
      } else if (scale.value > 2) {
        scale.value = withSpring(2);
      }
      savedScale.value = scale.value;
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  if (!hasPermission) {
    return (
      <View className="flex-1 items-center justify-center bg-black px-6">
        <Ionicons name="lock-closed" size={64} color="#8e8e93" />
        <Text className="text-xl font-semibold text-white mt-4">
          Permission Required
        </Text>
        <Text className="text-gray-400 text-center mt-2">
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
      <View className="flex-1 items-center justify-center bg-black">
        <ActivityIndicator size="large" color="#fff" />
        <Text className="text-gray-400 mt-4">Loading photos...</Text>
      </View>
    );
  }

  if (photos.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-black">
        <Ionicons name="images-outline" size={64} color="#8e8e93" />
        <Text className="text-gray-400 mt-4">No photos to display</Text>
      </View>
    );
  }

  const currentPhoto = photos[currentIndex];

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: "black" }}>
      <View style={{ flex: 1, backgroundColor: "black" }}>
        {showControls && (
          <View className="absolute top-0 left-0 right-0 z-10 pt-12 px-4 pb-4 bg-black/50">
            <View className="flex-row items-center justify-between">
              <TouchableOpacity
                onPress={() => router.back()}
                className="p-2"
              >
                <Ionicons name="arrow-back" size={28} color="white" />
              </TouchableOpacity>

              <Text className="text-white font-medium">
                {currentIndex + 1} / {photos.length}
              </Text>

              <TouchableOpacity onPress={handleDelete} className="p-2">
                <Ionicons name="trash" size={24} color="#ff3b30" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        <FlatList
          ref={flatListRef}
          data={photos}
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          initialScrollIndex={currentIndex}
          onViewableItemsChanged={handleViewableItemsChanged}
          viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
          renderItem={({ item }) => (
            <View
              style={{
                width: SCREEN_WIDTH,
                height: SCREEN_HEIGHT,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <GestureDetector gesture={pinchGesture}>
                <Animated.View style={[styles.imageContainer, animatedStyle]}>
                  <Image
                    source={{ uri: item.uri }}
                    style={styles.image}
                    contentFit="contain"
                    transition={300}
                  />
                </Animated.View>
              </GestureDetector>
            </View>
          )}
        />

        {currentPhoto?.mediaType === "video" && (
          <View className="absolute bottom-20 left-0 right-0 items-center">
            <View className="bg-black/60 px-4 py-2 rounded-full">
              <Text className="text-white font-medium">
                Video •{" "}
                {currentPhoto.duration
                  ? `${Math.round(currentPhoto.duration)}s`
                  : "Unknown duration"}
              </Text>
            </View>
          </View>
        )}

        <TouchableOpacity
          className="absolute bottom-0 left-0 right-0 h-20"
          onPress={() => setShowControls(!showControls)}
          activeOpacity={1}
        />
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  imageContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
});
