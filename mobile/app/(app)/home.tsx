import { View, Text, Pressable, StyleSheet } from "react-native";
import { useAuth } from "../../src/auth/AuthContext";

export default function Home() {
  const { role, logout } = useAuth();

  return (
    <View style={s.container}>
      <Text style={s.title}>Home</Text>
      <Text style={s.text}>Role: {role ?? "unknown"}</Text>

      <Pressable style={s.btn} onPress={logout}>
        <Text style={s.btnText}>Logout</Text>
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", gap: 12, backgroundColor: "#0b0b0f" },
  title: { color: "white", fontSize: 28, fontWeight: "800" },
  text: { color: "white", opacity: 0.8 },
  btn: { backgroundColor: "#ef4444", paddingHorizontal: 18, paddingVertical: 12, borderRadius: 12 },
  btnText: { color: "white", fontWeight: "700" },
});