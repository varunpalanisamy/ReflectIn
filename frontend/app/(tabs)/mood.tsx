// app/(tabs)/mood.tsx
import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  withSpring,
  useAnimatedStyle,
  withSequence,
  withTiming,
  useSharedValue,
} from 'react-native-reanimated';
import { colors } from '@/constants/colors';

// We'll simulate a month with 31 days (each cell represents one day)
const NUM_DAYS = 31;

// Define moods with associated colors.
const moods = [
  { id: 1, emoji: '😊', label: 'Happy', color: '#4ade80' },   // Green
  { id: 2, emoji: '😔', label: 'Sad', color: '#60a5fa' },     // Blue
  { id: 3, emoji: '😌', label: 'Calm', color: '#fbbf24' },    // Yellow
  { id: 4, emoji: '😤', label: 'Angry', color: '#ef4444' },   // Red
  { id: 5, emoji: '😰', label: 'Anxious', color: '#fb923c' }, // Orange
  { id: 6, emoji: '🤗', label: 'Grateful', color: '#a855f7' }, // Purple
];

// Generate simulated mood data for previous days.
const generateMockData = (): number[] => {
  return Array.from({ length: NUM_DAYS }, () => {
    // Random mood id between 1 and 6.
    return Math.floor(Math.random() * 6) + 1;
  });
};

export default function MoodScreen() {
  // The currently selected mood (for button highlight).
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  // Our grid representing the month. Prepopulate with simulated data.
  const [monthPixels, setMonthPixels] = useState<number[]>(generateMockData());
  // Shared value for animating today's pixel.
  const highlightScale = useSharedValue(1);

  // Assume today's pixel is the last cell in our month.
  const todayIndex = NUM_DAYS - 1;

  const handleMoodSelect = (moodId: number) => {
    setSelectedMood(moodId);
    // Update the today cell.
    setMonthPixels((prev) => {
      const updated = [...prev];
      updated[todayIndex] = moodId;
      return updated;
    });
    // Animate the today cell: scale up then back to normal.
    highlightScale.value = withSequence(
      withSpring(1.2),
      withTiming(1, { duration: 300 })
    );
  };

  // Animated style for today's pixel.
  const todayAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: highlightScale.value }],
  }));

  // Render a single row of pixels representing the month.
  const renderPixelGrid = useCallback(() => {
    return (
      <View style={styles.gridRow}>
        {monthPixels.map((moodId, index) => {
          const moodColor =
            moodId && moods.find((m) => m.id === moodId)?.color || '#f3f4f6';
          const isToday = index === todayIndex;
          return (
            <Animated.View
              key={index}
              style={[
                styles.pixel,
                { backgroundColor: moodColor },
                isToday && todayAnimatedStyle,
              ]}
            />
          );
        })}
      </View>
    );
  }, [monthPixels, todayIndex, todayAnimatedStyle]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Title */}
        <Text style={styles.title}>How are you feeling?</Text>
        {/* Mood selection buttons */}
        <View style={styles.moodButtonsContainer}>
          {moods.map((mood) => (
            <TouchableOpacity
              key={mood.id}
              style={[
                styles.moodButton,
                selectedMood === mood.id && { backgroundColor: mood.color },
              ]}
              onPress={() => handleMoodSelect(mood.id)}
            >
              <Text style={styles.moodEmoji}>{mood.emoji}</Text>
              <Text style={styles.moodLabel}>{mood.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {/* Month-in-Pixels grid */}
        <View style={styles.gridContainer}>
          <Text style={styles.gridTitle}>Your Month in Pixels</Text>
          {renderPixelGrid()}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF1DE", // Milky white background
  },
  content: {
    flexGrow: 1,
    padding: 20,
  },
  title: {
    fontWeight: "bold",
    fontSize: 32,
    color: "#1A1A1A",
    marginBottom: 120,
    textAlign: "center",
  },
  moodButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  moodButton: {
    width: '48%',
    aspectRatio: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  moodEmoji: {
    fontSize: 40,
    marginBottom: 10,
  },
  moodLabel: {
    fontFamily: 'InterSemiBold',
    fontSize: 16,
    color: "#1A1A1A",
  },
  gridContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    marginTop: 20,
  },
  gridTitle: {
    fontFamily: 'PlayfairBold',
    fontSize: 24,
    color: "#1A1A1A",
    marginBottom: 20,
    textAlign: "center",
  },
  gridRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  pixel: {
    width: 30,
    height: 30,
    margin: 2,
    borderRadius: 4,
    backgroundColor: '#f3f4f6',
  },
});
