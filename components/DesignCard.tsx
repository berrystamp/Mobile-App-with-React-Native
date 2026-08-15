import { formatNaira } from "@/lib/currency";
import { Design } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

interface DesignCardProps {
  design: Design;
  onPress?: () => void;
  onFavoriteToggle?: (designId: number) => void | Promise<void>;
  width?: number;
  showPrice?: boolean;
}

const { width: screenWidth } = Dimensions.get("window");

export const DesignCard: React.FC<DesignCardProps> = ({
  design,
  onPress,
  onFavoriteToggle,
  width = (screenWidth - 60) / 2,
  showPrice = true,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [isFavorite, setIsFavorite] = useState(design.liked);

  const theme = {
    card: isDark ? "#1E1E1E" : "#FFFFFF",
    text: isDark ? "#FFFFFF" : "#1A1A1A",
    subtext: isDark ? "#A0A0A0" : "#7A7A7A",
    border: isDark ? "#2A2A2A" : "#F0F0F0",
  };

  useEffect(() => {
    setIsFavorite(design.liked);
  }, [design.liked]);

  const handleFavorite = () => {
    setIsFavorite((prev) => !prev);
    onFavoriteToggle?.(design.id);
  };

  const getImageUrl = () => {
    if (design.imagePath) {
      // If it's a full URL, use it directly
      if (design.imagePath.startsWith("http")) {
        return design.imagePath;
      }
      // Otherwise, construct the full URL
      return `https://berrystamp-backend.onrender.app/${design.imagePath}`;
    }
    return null;
  };

  const imageUrl = getImageUrl();
  const artistName = `${design.profile.firstName} ${design.profile.lastName}`;

  // Get the lowest price from mocks
  const getLowestPrice = () => {
    if (design.mocks && design.mocks.length > 0) {
      const prices = design.mocks.map((mock) => mock.price);
      return Math.min(...prices);
    }
    return 0;
  };

  const lowestPrice = getLowestPrice();

  return (
    <TouchableOpacity
      style={[styles.container, { width, backgroundColor: theme.card }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.imageContainer}>
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.image, { backgroundColor: theme.border }]}>
            <Ionicons name="image-outline" size={48} color={theme.subtext} />
          </View>
        )}
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={handleFavorite}
          activeOpacity={0.8}
        >
          <Ionicons
            name={isFavorite ? "heart" : "heart-outline"}
            size={20}
            color={isFavorite ? "#FF4458" : "#FFFFFF"}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.text }]} numberOfLines={2}>
          {design.title}
        </Text>
        <Text
          style={[styles.artist, { color: theme.subtext }]}
          numberOfLines={1}
        >
          By {artistName}
        </Text>
        {showPrice && lowestPrice > 0 && (
          <Text style={[styles.price, { color: theme.text }]}>
            {formatNaira(lowestPrice)}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  imageContainer: {
    width: "100%",
    height: 160,
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  favoriteButton: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    padding: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
    lineHeight: 18,
  },
  artist: {
    fontSize: 12,
    marginBottom: 6,
  },
  price: {
    fontSize: 15,
    fontWeight: "700",
  },
});
