// app/(tabs)/_layout.tsx
import { Tabs } from "expo-router";
import { StyleSheet } from "react-native";
import { Home, MessageSquare, BarChart2, User } from "lucide-react-native";
import { UserPrefsProvider } from "../UserPrefsContext";  // adjust path if needed

export default function TabLayout() {
  return (
    <UserPrefsProvider>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: "#FFF1DE",
            borderTopWidth: 0,
            height: 0,
            paddingBottom: 90,
          },
          tabBarItemStyle: {
            width: 600,
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
            tabBarIcon: ({ size }) => <Home size={size * 1.3} color="#1A1A1A" />,
          }}
        />

        {/* 2) Chat Screen (index) */}
        <Tabs.Screen
          name="index"
          options={{
            title: "",
            tabBarIcon: ({ size }) => (
              <MessageSquare size={size * 1.3} color="#1A1A1A" />
            ),
          }}
        />

        {/* 3) Quiz (Mood) Screen */}
        <Tabs.Screen
          name="quiz"
          options={{
            title: "",
            tabBarIcon: ({ size }) => (
              <BarChart2 size={size * 1.3} color="#1A1A1A" />
            ),
          }}
        />

        {/* 4) Info Screen */}
        <Tabs.Screen
          name="info"
          options={{
            title: "",
            tabBarIcon: ({ size }) => <User size={size * 1.3} color="#1A1A1A" />,
          }}
        />
      </Tabs>
    </UserPrefsProvider>
  );
}


const styles = StyleSheet.create({
  // If you want to define custom styles for the tab bar, do so here
});
