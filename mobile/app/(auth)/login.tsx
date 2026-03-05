import { useState } from "react";
import { View, Text, TextInput, Pressable, Alert, StyleSheet } from "react-native";
import { api } from "../../src/services/api";
import { useAuth } from "../../src/auth/AuthContext";
import { useRouter } from "expo-router";

export default function Login() {
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    try {
      setLoading(true);
      const res = await api.post("/auth/login", { identifier, password });
      const token = res.data.data; // backend returneaza string JWT
      if (!token) throw new Error("Token missing");
      await login(token);
      // redirect e facut automat de AuthGate
    } catch (e: any) {
      Alert.alert("Login failed", "Verifică user/pass.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={s.container}>
      <Text style={s.title}>MyHeroChild</Text>
      <Text style={s.subtitle}>Login</Text>

      <TextInput
        style={s.input}
        placeholder="Username or Email"
        value={identifier}
        onChangeText={setIdentifier}
        autoCapitalize="none"
      />
      <TextInput
        style={s.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <Pressable style={[s.btn, loading && { opacity: 0.6 }]} onPress={handleLogin} disabled={loading}>
        <Text style={s.btnText}>{loading ? "Logging in..." : "LOGIN"}</Text>
      </Pressable>

      <Pressable onPress={() => router.push("/(auth)/register")}>
        <Text style={s.link}>Create account</Text>
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20, gap: 10, backgroundColor: "#0b0b0f" },
  title: { color: "white", fontSize: 34, fontWeight: "800", textAlign: "center" },
  subtitle: { color: "white", fontSize: 18, textAlign: "center", marginBottom: 20, opacity: 0.85 },
  input: { backgroundColor: "white", borderRadius: 12, padding: 12, fontSize: 16 },
  btn: { backgroundColor: "#4f46e5", padding: 14, borderRadius: 12, alignItems: "center" },
  btnText: { color: "white", fontSize: 16, fontWeight: "700" },
  link: { color: "#c7d2fe", textAlign: "center", marginTop: 8 },
});