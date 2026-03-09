import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
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
      const token = res.data.data;

      if (!token) throw new Error("Token missing");

      await login(token);
    } catch (e: any) {
      Alert.alert("Login failed", "Verifică user/pass.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={["#7AA9FF", "#6C63FF"]} style={{ flex: 1 }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={s.container}>

          {/* Top blobs */}
          <View style={s.blobTopLeft} />
          <View style={s.blobTopRight} />

          {/* Bottom blob */}
          <View style={s.blobBottom} />

          <View style={s.header}>
            <Text style={s.title}>MyHeroChild</Text>
            <Text style={s.subtitle}>Welcome back</Text>
          </View>

          <View style={s.card}>

            <TextInput
              style={s.input}
              placeholder="Username or Email"
              placeholderTextColor="#7b8794"
              value={identifier}
              onChangeText={setIdentifier}
              autoCapitalize="none"
            />

            <TextInput
              style={s.input}
              placeholder="Password"
              placeholderTextColor="#7b8794"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <Pressable
              style={[s.btn, loading && { opacity: 0.7 }]}
              onPress={handleLogin}
              disabled={loading}
            >
              <Text style={s.btnText}>
                {loading ? "Logging in..." : "LOGIN"}
              </Text>
            </Pressable>

            <Pressable onPress={() => router.push("/(auth)/register")}>
              <Text style={s.link}>Create account</Text>
            </Pressable>

          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const s = StyleSheet.create({

  container: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
  },

  header: {
    alignItems: "center",
    marginBottom: 40,
  },

  title: {
    color: "#FFF8FF",
    fontSize: 40,
    fontWeight: "900",
    letterSpacing: 1,
    textShadowColor: "rgba(0,0,0,0.25)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },

  subtitle: {
    color: "#eef2ff",
    fontSize: 16,
    marginTop: 6,
  },

  card: {
    backgroundColor: "#F3EEFF",
    borderRadius: 26,
    padding: 24,
    gap: 14,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },

  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    fontSize: 16,
  },

  btn: {
    backgroundColor: "#6C63FF",
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
  },

  btnText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },

  link: {
    color: "#6C63FF",
    textAlign: "center",
    marginTop: 6,
  },

  blobTopLeft: {
    position: "absolute",
    width: 280,
    height: 280,
    borderRadius: 360,
    backgroundColor: "rgba(255,255,255,0.25)",
    top: -120,
    left: -60,
  },

  blobTopRight: {
    position: "absolute",
    width: 310,
    height: 310,
    borderRadius: 360,
    backgroundColor: "rgba(255,200,255,0.25)",
    top: -90,
    right: -80,
  },

  blobBottom: {
    position: "absolute",
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: "rgba(255,255,255,0.18)",
    bottom: -160,
    right: 150,
  },

});