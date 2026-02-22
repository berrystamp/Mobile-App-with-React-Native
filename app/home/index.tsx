import { AuthContext } from "@/context/AuthContext";
import { useContext } from "react";
import { StyleSheet, Text, TouchableOpacity, useColorScheme, View } from "react-native";

 export default function HomeScreen() {
  const { user, logout } = useContext(AuthContext);
    const colorScheme = useColorScheme();
    const isDark = colorScheme === "dark";
    
    return (
        <View style={[styles.container, { backgroundColor: isDark ? "#121212" : "#F3F3F3" }]}>
            <Text style={styles.title}>Welcome, {user?.name}!</Text>
            <TouchableOpacity style={styles.button} onPress={logout}>
                <Text style={styles.buttonText}>Logout</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: "600",
        marginBottom: 20,
        color: "#333",
    },
    button: {
        paddingVertical: 12,
        paddingHorizontal: 30,
        backgroundColor: "#007AFF",
        borderRadius: 25,
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
});