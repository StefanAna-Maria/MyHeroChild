import { Pressable, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../src/auth/AuthContext";
import { useTheme } from "../src/context/ThemeContext";

export default function LogoutButton() {
  const { logout } = useAuth();
  const router = useRouter();
  const theme = useTheme();

  const handleLogout = async () => {
    await logout();
    router.replace("/(auth)/login");
  };

  return (
    <Pressable
      style={[
        s.button,
        { backgroundColor: theme.colors.error }
      ]}
      onPress={handleLogout}
    >
      <Text style={s.text}>Logout</Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignSelf: "center",
    marginTop: 20
  },

  text: {
    color: "white",
    fontWeight: "700",
    fontSize: 16
  }
});