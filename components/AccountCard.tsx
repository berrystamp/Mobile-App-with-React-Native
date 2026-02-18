import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type AccountCardProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
  theme: any;
};

export const AccountCard = ({
  icon,
  title,
  description,
  theme,
}: AccountCardProps) => {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      style={[
        styles.card,
        {
          backgroundColor: theme.card,
          borderColor: theme.border,
        },
      ]}
    >
      <View style={styles.iconWrapper}>{icon}</View>

      <View style={{ flex: 1 }}>
        <Text style={[styles.cardTitle, { color: theme.purple }]}>
          {title}
        </Text>

        <Text style={[styles.cardDescription, { color: theme.textSecondary }]}>
          {description}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

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