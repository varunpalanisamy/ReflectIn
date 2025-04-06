// app/(tabs)/_layout.tsx
import { Tabs } from "expo-router";
import { StyleSheet } from "react-native";
import { Home, MessageSquare, BarChart2, User } from "lucide-react-native";
import { colors } from "@/constants/colors";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#FFF1DE",
          borderTopWidth: 0,
          height: 0,
          paddingBottom: 90, // Move icons up
        },
        tabBarItemStyle: {
          width: 600, // Set each tab's width here
        },
        tabBarActiveTintColor: "#1A1A1A",
        tabBarInactiveTintColor: "#999",
      }}
    >
      {/* 1) Home Screen */}
      <Tabs.Screen
        name="home"
        options={{
          title: "",
          tabBarIcon: ({ color, size }) => (
            <Home size={size * 1.3} color="#1A1A1A" />
          ),
        }}
      />

      {/* 2) Chat Screen */}
      <Tabs.Screen
        name="index"
        options={{
          title: "",
          tabBarIcon: ({ color, size }) => (
            <MessageSquare size={size * 1.3} color="#1A1A1A" />
          ),
        }}
      />

      {/* 3) Mood Screen */}
      <Tabs.Screen
        name="mood"
        options={{
          title: "",
          tabBarIcon: ({ color, size }) => (
            <BarChart2 size={size * 1.3} color="#1A1A1A" />
          ),
        }}
      />

      {/* 4) Info Screen */}
      <Tabs.Screen
        name="info"
        options={{
          title: "",
          tabBarIcon: ({ color, size }) => (
            <User size={size * 1.3} color="#1A1A1A" />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  // If you want to define custom styles for the tab bar, do so here
});
