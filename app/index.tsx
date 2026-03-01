import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect } from "react";
import { useRouter } from "expo-router";
import {
    Image,
    StatusBar,
    StyleSheet,
    useColorScheme,
    View,
} from "react-native";

const SplashScreen = () => {
	const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

useEffect(() => {

    const timer = setTimeout(async () => {

        router.replace("/login");
      
    }, 2500);
return () => {
      clearTimeout(timer);
    };
  },);

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

      <Image
        source={
          isDark
            ? require("../assets/splash-dark.png")
            : require("../assets/splash-light.png")
        }
        style={styles.image}
        resizeMode="contain"
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