// app/(tabs)/home.tsx
import React from "react";
import { View, Image, StyleSheet } from "react-native";

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      {/* Replace this with your actual logo or icon */}
      <Image
        source={require("../../assets/images/notification_icon.png")}
        style={styles.logo}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF1DE",
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 325,
    height: 325,
    marginTop: 60,
  },
});
