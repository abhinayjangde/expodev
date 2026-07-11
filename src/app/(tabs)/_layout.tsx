import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#2786bd",
        tabBarInactiveTintColor: "#8e8e93",
        tabBarStyle: {
          backgroundColor: "#fff",
          borderTopColor: "#e5e5ea",
        },
        headerStyle: {
          backgroundColor: "#2786bd",
        },
        headerTintColor: "#fff",
        headerTitleStyle: {
          fontWeight: "bold",
        },
      }}
    >
      <Tabs.Screen
        name="albums"
        options={{
          title: "Albums",
          headerTitle: "Albums",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="albums" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="photos"
        options={{
          title: "All Photos",
          headerTitle: "All Photos",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="images" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
