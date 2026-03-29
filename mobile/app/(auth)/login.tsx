import { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { api } from "../../src/services/api";
import { useAuth } from "../../src/auth/AuthContext";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { getRoleFromToken } from "../../src/auth/jwt";

export default function Login() {
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [loginError, setLoginError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const toastAnim = useRef(new Animated.Value(-120)).current;
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"error" | "success" | "warning">("error");

  const showToast = (message: string, type: "error" | "success" | "warning" = "error") => {
    setToastMessage(message);
    setToastType(type);

    Animated.timing(toastAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();

    setTimeout(() => {
      Animated.timing(toastAnim, {
        toValue: -120,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setToastMessage(null));
    }, 4000);
  };

  const handleLogin = async () => {

    setLoginError(false);

    try {
      setLoading(true);
      const res = await api.post("/auth/login", { identifier, password });
      const token = res.data.data;

      if (!token) throw new Error("Token missing");

      await login(token);

      const role = getRoleFromToken(token);

      if (role === "ADMIN") {
        router.replace("/(admin)/home");
      }

      if (role === "PARENT") {
        router.replace("/(parent)/home");
      }

      if (role === "CHILD") {
        router.replace("/(child)/home");
      }
    } catch (e: any) {
      setLoginError(true);
      showToast("Login failed. Check username or password.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={["#7AA9FF", "#6C63FF"]} style={{ flex: 1 }}>

      {toastMessage && (
        <Animated.View
          style={[
            s.toast,
            s[`toast_${toastType}`],
            { transform: [{ translateY: toastAnim }] }
          ]}
        >
          <Ionicons
            name="close-circle"
            size={36}
            color="#7F1D1D"
            style={s.toastIcon}
          />
          <Text style={s.toastText}>{toastMessage}</Text>
        </Animated.View>
      )}

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={s.container}>

          <View style={s.blobTopLeft} />
          <View style={s.blobTopRight} />
          <View style={s.blobBottom} />

          <View style={s.header}>
            <Text style={s.title}>MyHeroChild</Text>
            <Text style={s.subtitle}>Welcome back</Text>
          </View>

          <View style={s.card}>

            <TextInput
              style={[
                s.input,
                loginError && s.inputError
              ]}
              placeholder="Username or Email"
              placeholderTextColor="#7b8794"
              value={identifier}
              onChangeText={setIdentifier}
              autoCapitalize="none"
            />

            <View style={s.passwordContainer}>
              <TextInput
                style={[
                  s.input,
                  loginError && s.inputError,
                  { flex: 1 }
                ]}
                placeholder="Password"
                placeholderTextColor="#7b8794"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />

              <Pressable
                style={s.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={22}
                  color="#6C63FF"
                />
              </Pressable>
            </View>

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

  inputError: {
    borderWidth: 2,
    borderColor: "#F87171",
  },

  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
  },

  eyeButton: {
    position: "absolute",
    right: 14,
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

  toast: {
    position: "absolute",
    top: 60,
    left: 20,
    right: 20,
    padding: 16,
    borderRadius: 14,
    borderWidth: 2,
    zIndex: 999,
    elevation: 10,
    alignItems: "center",
  },

  toast_error: {
    backgroundColor: "#FECACA",
    borderColor: "#F87171",
  },

  toast_success: {
    backgroundColor: "#BBF7D0",
    borderColor: "#4ADE80",
  },

  toast_warning: {
    backgroundColor: "#F3C979",
    borderColor: "#E2AE4A",
  },

  toastIcon: {
    marginBottom: 6,
  },

  toastText: {
    color: "#7F1D1D",
    fontWeight: "600",
    textAlign: "center",
  },

});