import { Tabs } from 'expo-router';

export default function Layout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: {
          backgroundColor: '#222021', // Dark gray header
        },
        headerTintColor: '#fff',   // White header text
        tabBarStyle: {
          backgroundColor: '#222021', // Dark gray tab bar
        },
        tabBarActiveTintColor: '#D3C7FF',  // Active tab tint (light lavender)
        tabBarInactiveTintColor: '#fff',   // Inactive tab tint (white)
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Chat' }} />
      <Tabs.Screen name="mood" options={{ title: 'Mood' }} />
      <Tabs.Screen name="info" options={{ title: 'Info' }} />
    </Tabs>
  );
}
