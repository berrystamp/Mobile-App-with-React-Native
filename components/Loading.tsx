import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
    Image,
    StatusBar,
    StyleSheet,
    useColorScheme,
    View,
} from "react-native";

const SplashScreen = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";


  return (
    <View style={styles.container}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={isDark ? "#3E2F8A" : "#FfffFF"}
      />

      <LinearGradient
        colors={
          isDark
            ? ["#3E2F8A", "#3E2F8A", "rgba(0, 0, 0, 0.06)"]
            : ["#FFFFFF", "#FFFFFF", "rgba(0, 0, 0, 0.06)"]
        }
        locations={[0, 0.5, 1]} // makes that sharp-ish transition
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

    </View>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "65%",
    height: "65%",
  },
});