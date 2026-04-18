import { Artist } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

interface ArtistCardProps {
  artist: Artist;
  onPress?: () => void;
}

export const ArtistCard: React.FC<ArtistCardProps> = ({ artist, onPress }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const theme = {
    text: isDark ? "#FFFFFF" : "#1A1A1A",
    subtext: isDark ? "#A0A0A0" : "#7A7A7A",
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Ionicons key={`star-${i}`} name="star" size={12} color="#FFB800" />,
      );
    }

    if (hasHalfStar) {
      stars.push(
        <Ionicons key="star-half" name="star-half" size={12} color="#FFB800" />,
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Ionicons
          key={`empty-${i}`}
          name="star-outline"
          size={12}
          color="#FFB800"
        />,
      );
    }

    return stars;
  };

  const getAvatarUrl = () => {
    if (artist.profilePicturePath) {
      // If it's a full URL, use it directly
      if (artist.profilePicturePath.startsWith("http")) {
        return artist.profilePicturePath;
      }

      return `https://backend-prod-api.berrystamp.com/${artist.profilePicturePath}`;
    }
    return null;
  };
  console.log(artist);
  const avatarUrl = getAvatarUrl();
  // Prefer shop/brand name over personal real name
  const fullName =
    (artist as any).shopName ||
    (artist as any).brandName ||
    (artist as any).name ||
    artist.username ||
    `${artist.firstName || ""} ${artist.lastName || ""}`.trim() ||
    "Unknown Artist";

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.avatarContainer}>
        {avatarUrl ? (
          <Image source={{ uri: avatarUrl }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <Ionicons name="person" size={32} color="#FFFFFF" />
          </View>
        )}
      </View>

      <View style={styles.starsContainer}>
        {renderStars(artist.rating || 0)}
      </View>

      <Text style={[styles.name, { color: theme.text }]} numberOfLines={1}>
        {fullName}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginRight: 16,
    width: 90,
  },
  avatarContainer: {
    marginBottom: 8,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  avatarPlaceholder: {
    backgroundColor: "#4B3A99",
    justifyContent: "center",
    alignItems: "center",
  },
  starsContainer: {
    flexDirection: "row",
    marginBottom: 6,
    gap: 2,
  },
  name: {
    fontSize: 13,
    fontWeight: "500",
    textAlign: "center",
  },
});
