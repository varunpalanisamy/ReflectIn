import React, { useRef, useEffect } from "react";
import { View, Animated, StyleSheet, Text, ScrollView, Dimensions } from "react-native";
import { useFocusEffect } from "@react-navigation/native";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function HomeScreen() {
  const fadeAnim     = useRef(new Animated.Value(0)).current;
  const scaleAnim    = useRef(new Animated.Value(2)).current;
  const moveAnim     = useRef(new Animated.Value(150)).current;
  const textFadeAnim = useRef(new Animated.Value(0)).current;

  const runIntroAnimation = () => {
    fadeAnim.setValue(0);
    moveAnim.setValue(0);
    textFadeAnim.setValue(0);

    Animated.sequence([
      
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(moveAnim, { toValue: 120, duration: 3000, useNativeDriver: true }),
        Animated.timing(textFadeAnim, { toValue: 1, duration: 3000, useNativeDriver: true }),
      ]),
      
    ]).start();
  };

  useEffect(() => {
    runIntroAnimation();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      runIntroAnimation();
    }, [])
  );

  return (
    <View style={styles.container}>
      <Animated.Image
        source={require("../../assets/images/notification_icon.png")}
        style={[
          styles.logo,
          { opacity: fadeAnim, transform: [{ translateY: moveAnim }, { scale: scaleAnim }] },
        ]}
        resizeMode="contain"
      />

      <Animated.View style={[styles.textWrapper, { opacity: textFadeAnim }]}>
        <ScrollView contentContainerStyle={styles.textContainer}>
          <Text style={styles.title}>VENTY</Text>
          <Text style={styles.tagline}>Your safe space to vent, reflect, and grow.</Text>
          <Text style={styles.bodyText}>
            At Venty, we believe every emotion matters. Whether you’re wrestling with stress, celebrating a win, or simply need to get something off your chest, our AI guide listens without judgment. Then, at just the right moment, Venty gently nudges you to pause and reflect—helping you uncover insights, track your emotional journey, and build the resilience to face tomorrow. Start your path to greater self‑understanding today.
          </Text>
        </ScrollView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF1DE",
    // justifyContent: "center",  // center logo vertically
    alignItems: "center",
  },
  logo: {
    width: 150,
    height: 150,
  },
  textWrapper: {
    flex: 1,
    width: "100%",
    marginTop: 150,            // space under logo
  },
  textContainer: {
    paddingHorizontal: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#1A1A1A",
  },
  tagline: {
    fontSize: 18,
    color: "#1A1A1A",
    marginTop: 8,
    textAlign: "center",
  },
  bodyText: {
    fontSize: 16,
    color: "#1A1A1A",
    marginTop: 20,
    lineHeight: 24,
    textAlign: "center",
    paddingBottom: 40,
  },
});
