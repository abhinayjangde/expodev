import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShadowVisible: false,
          contentStyle: { backgroundColor: "#0a0a0a" },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="album/[id]"
          options={{
            headerStyle: { backgroundColor: "#0a0a0a" },
            headerTintColor: "#fff",
            headerTitleStyle: { fontWeight: "600", fontSize: 17 },
            headerBackTitle: "Back",
          }}
        />
        <Stack.Screen
          name="photo/[id]"
          options={{
            headerShown: false,
            presentation: "fullScreenModal",
            animation: "fade",
          }}
        />
      </Stack>
    </GestureHandlerRootView>
  );
}
