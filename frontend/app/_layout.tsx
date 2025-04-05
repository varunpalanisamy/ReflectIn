import { Tabs } from 'expo-router';

export default function Layout() {
  return (
    <Tabs>
      <Tabs.Screen name="index" options={{ title: 'Chat' }} />
      <Tabs.Screen name="mood" options={{ title: 'Mood' }} />
      <Tabs.Screen name="info" options={{ title: 'Info' }} />
    </Tabs>
  );
}
