import { AccountCard } from "@/components/AccountCard";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { useRouter } from "expo-router";
import {
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  Pressable,
} from "react-native";

const ChooseAccountScreen = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
const router = useRouter();
  const theme = {
    background: isDark ? "#121212" : "#F3F3F3",
    card: isDark ? "#1E1E1E" : "#FFFFFF",
    border: "#D6D0F5",
    textPrimary: isDark ? "#FFFFFF" : "#1A1A1A",
    textSecondary: "#7A7A7A",
    purple: "#4B3A99",
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <Text style={[styles.title, { color: theme.textPrimary }]}>
        Welcome To <Text style={{ color: theme.purple }}>Berrystamp</Text>
      </Text>
      <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
        Please choose the type of account you want to create with us
      </Text>

        {/* Customer */}
      <Pressable onPress={() => router.push("/signup")}>
        <AccountCard
          icon={<Ionicons name="cart-outline" size={24} color={theme.purple} />}
          title="Customer"
          description="Get 10% off your first order as you signed up"
          theme={theme}
        />
      </Pressable>

      {/* Designer */}
      <Pressable onPress={() => router.push("/(tabs)/cart")}>
        <AccountCard
          icon={
            <MaterialCommunityIcons
              name="palette-outline"
              size={24}
              color={theme.purple}
            />
          }
          title="Designer"
          description="Set up your shop, sell your designs and earn with ease"
          theme={theme}
        />
      </Pressable>

      {/* Printer */}
      <Pressable onPress={() => router.push("/signup")}>
        <AccountCard
          icon={
            <MaterialCommunityIcons
              name="brush-outline"
              size={24}
              color={theme.purple}
            />
          }
          title="Printer"
          description="Sign up and get linked up with customers around you"
          theme={theme}
        />
      </Pressable>
    </View>
  );
};

export default ChooseAccountScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  title: {
    fontSize: 22,
    fontWeight: "600",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    marginTop: 10,
    marginBottom: 30,
    lineHeight: 20,
  },
  card: {
    flexDirection: "row",
    padding: 18,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 20,
    boxShadow: "0px 4px 20px rgba(0,0,0,0.1)",
    elevation: 2,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#EFEAFE",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
});