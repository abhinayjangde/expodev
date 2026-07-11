import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="album/[id]"
        options={{
          headerStyle: {
            backgroundColor: "#2786bd",
          },
          headerTintColor: "#fff",
          headerTitleStyle: {
            fontWeight: "bold",
          },
        }}
      />
      <Stack.Screen
        name="photo/[id]"
        options={{
          headerShown: false,
          presentation: "modal",
        }}
      />
    </Stack>
  );
}
