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
  SafeAreaView,
} from "react-native";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeIn,
  FadeOut,
} from "react-native-reanimated";
import {
  Gesture,
  GestureDetector,
} from "react-native-gesture-handler";
import { getAllPhotos, deletePhotos, requestPermissions } from "@/lib/media";
import { GalleryPhoto } from "@/lib/types";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } =
  Dimensions.get("window");

export default function PhotoViewerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState(false);
  const [showControls, setShowControls] = useState(true);

  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);

  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

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
      "This photo will be deleted from your library.",
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
        const newIndex = viewableItems[0].index ?? 0;
        setCurrentIndex(newIndex);
        scale.value = withSpring(1);
        savedScale.value = 1;
        translateX.value = 0;
        translateY.value = 0;
      }
    },
    [scale, savedScale, translateX, translateY]
  );

  const toggleControls = () => {
    setShowControls((prev) => !prev);
  };

  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = Math.max(0.5, Math.min(savedScale.value * e.scale, 3));
    })
    .onEnd(() => {
      if (scale.value < 1) {
        scale.value = withSpring(1);
      } else if (scale.value > 2.5) {
        scale.value = withSpring(2.5);
      }
      savedScale.value = scale.value;
    });

  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      if (scale.value > 1) {
        scale.value = withSpring(1);
        savedScale.value = 1;
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      } else {
        scale.value = withSpring(2);
        savedScale.value = 2;
      }
    });

  const composed = Gesture.Simultaneous(pinchGesture, doubleTapGesture);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

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
          Grant photo library access to view your photos.
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
        <ActivityIndicator size="large" color="#636366" />
        <Text className="text-[15px] text-[#636366] mt-4">Loading...</Text>
      </View>
    );
  }

  if (photos.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-[#0a0a0a]">
        <View className="w-16 h-16 rounded-full bg-[#1c1c1e] items-center justify-center mb-4">
          <Ionicons name="images-outline" size={28} color="#636366" />
        </View>
        <Text className="text-[17px] text-[#636366] font-medium">
          No Photos
        </Text>
      </View>
    );
  }

  const currentPhoto = photos[currentIndex];

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
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
        getItemLayout={(_, index) => ({
          length: SCREEN_WIDTH,
          offset: SCREEN_WIDTH * index,
          index,
        })}
        renderItem={({ item }) => (
          <View
            style={{
              width: SCREEN_WIDTH,
              height: SCREEN_HEIGHT,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "#000",
            }}
          >
            <GestureDetector gesture={composed}>
              <Animated.View
                style={[styles.imageContainer, animatedStyle]}
              >
                <Image
                  source={{ uri: item.uri }}
                  style={styles.image}
                  contentFit="contain"
                  transition={200}
                />
              </Animated.View>
            </GestureDetector>
          </View>
        )}
      />

      {showControls && (
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(200)}
          style={styles.topOverlay}
        >
          <SafeAreaView>
            <View style={styles.topBar}>
              <TouchableOpacity
                onPress={() => router.back()}
                style={styles.controlButton}
                activeOpacity={0.7}
              >
                <Ionicons name="chevron-back" size={28} color="white" />
              </TouchableOpacity>

              <View style={styles.counterBadge}>
                <Text style={styles.counterText}>
                  {currentIndex + 1} / {photos.length}
                </Text>
              </View>

              <TouchableOpacity
                onPress={handleDelete}
                style={styles.controlButton}
                activeOpacity={0.7}
              >
                <Ionicons name="trash-outline" size={22} color="#ff453a" />
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </Animated.View>
      )}

      {showControls && currentPhoto?.mediaType === "video" && (
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(200)}
          style={styles.videoBadge}
        >
          <Ionicons name="play-circle" size={16} color="white" />
          <Text style={styles.videoText}>
            {currentPhoto.duration
              ? `${Math.floor(currentPhoto.duration / 60)}:${String(
                  Math.floor(currentPhoto.duration % 60)
                ).padStart(2, "0")}`
              : "Video"}
          </Text>
        </Animated.View>
      )}

      <TouchableOpacity
        style={{
          position: "absolute",
          top: SCREEN_HEIGHT * 0.2,
          left: 0,
          right: 0,
          bottom: SCREEN_HEIGHT * 0.2,
        }}
        onPress={toggleControls}
        activeOpacity={1}
      />

      {showControls && (
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(200)}
          style={styles.bottomOverlay}
        >
          <SafeAreaView>
            <View style={styles.bottomBar}>
              <TouchableOpacity
                style={styles.actionButton}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="share-outline"
                  size={22}
                  color="white"
                />
                <Text style={styles.actionLabel}>Share</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="heart-outline"
                  size={22}
                  color="white"
                />
                <Text style={styles.actionLabel}>Favorite</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleDelete}
                style={styles.actionButton}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="trash-outline"
                  size={22}
                  color="#ff453a"
                />
                <Text style={[styles.actionLabel, { color: "#ff453a" }]}>
                  Delete
                </Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </Animated.View>
      )}
    </View>
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
  topOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingBottom: 12,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    paddingTop: 8,
  },
  controlButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  counterBadge: {
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
  },
  counterText: {
    color: "white",
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  videoBadge: {
    position: "absolute",
    bottom: 120,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  videoText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  bottomOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: 12,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  bottomBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 24,
    paddingBottom: 8,
  },
  actionButton: {
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    padding: 12,
  },
  actionLabel: {
    color: "white",
    fontSize: 11,
    fontWeight: "500",
  },
});
