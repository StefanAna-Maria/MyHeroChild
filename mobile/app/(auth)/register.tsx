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
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

type Role = "PARENT" | "CHILD" | "ADMIN";

export default function Register() {
  const router = useRouter();

  const [role, setRole] = useState<Role>("PARENT");
  const slideAnim = useRef(new Animated.Value(0)).current;

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [parentCode, setParentCode] = useState("");
  const [adminCode, setAdminCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  /* ---------------- TOAST ---------------- */

  const toastAnim = useRef(new Animated.Value(-120)).current;
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"warning" | "success" | "error">("warning");

  const showToast = (message: string, type: "warning" | "success" | "error" = "warning") => {
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

  /* ---------------- REGISTER ---------------- */

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      showToast("Passwords do not match", "warning");
      return;
    }

    try {
      const res = await api.post("/auth/register", {
        username,
        email: email || null,
        password,
        confirmPassword,
        role,
        parentCode: role === "CHILD" ? parentCode : null,
        adminCode: role === "ADMIN" ? adminCode : null,
      });

      const generatedParentCode = res.data.data?.parentCode;

      if (generatedParentCode) {
        showToast(
          `Your parent code is: ${generatedParentCode}. Your child will need it to register.`, "success"
        );
      } else {
        showToast("Account created successfully", "success");
      }

      setTimeout(() => {
        router.replace("/(auth)/login");
      }, 2000);

    } catch (error: any) {
      showToast(
        error.response?.data?.message || "Registration failed", "error"
      );
    }
  };

  /* ---------------- ROLE SELECTOR ---------------- */

  const handleRoleChange = (newRole: Role) => {
    const index = ["PARENT", "CHILD", "ADMIN"].indexOf(newRole);

    Animated.spring(slideAnim, {
      toValue: index,
      useNativeDriver: false,
    }).start();

    setRole(newRole);
  };

  return (
    <LinearGradient colors={["#7AA9FF", "#6C63FF"]} style={{ flex: 1 }}>

      {/* TOAST */}
      {toastMessage && (
          <Animated.View
            style={[
              s.toast,
              s[`toast_${toastType}`],
              { transform: [{ translateY: toastAnim }] }
            ]}
          >

          <Ionicons
            name={
              toastType === "success"
                ? "checkmark-circle"
                : toastType === "error"
                ? "close-circle"
                : "warning-outline"
            }
            size={36}
            color={
              toastType === "success"
                ? "#14532D"
                : toastType === "error"
                ? "#7F1D1D"
                : "#5A3E00"
            }
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

          {/* blobs */}
          <View style={s.blobTopLeft} />
          <View style={s.blobTopRight} />
          <View style={s.blobBottom} />

          <View style={s.header}>
            <Text style={s.title}>Create Account</Text>
          </View>

          <View style={s.card}>

            {/* Role selector */}
            <View style={s.segmentedContainer}>

              <Animated.View
                style={[
                  s.segmentedHighlight,
                  {
                    transform: [
                      {
                        translateX: slideAnim.interpolate({
                          inputRange: [0, 1, 2],
                          outputRange: ["0%", "100%", "200%"],
                        }),
                      },
                    ],
                  },
                ]}
              />

              {["PARENT", "CHILD", "ADMIN"].map((r) => (
                <Pressable
                  key={r}
                  style={s.segmentButton}
                  onPress={() => handleRoleChange(r as Role)}
                >
                  <Text
                    style={[
                      s.segmentText,
                      role === r && s.segmentTextActive,
                    ]}
                  >
                    {r}
                  </Text>
                </Pressable>
              ))}
            </View>

            <TextInput
              style={[
                s.input,
                focusedInput === "username" && s.inputFocused
              ]}
              placeholder="Username"
              value={username}
              onChangeText={setUsername}
              onFocus={() => setFocusedInput("username")}
              onBlur={() => setFocusedInput(null)}
            />

            <TextInput
              style={[
                s.input,
                focusedInput === "email" && s.inputFocused
              ]}
              placeholder={role === "CHILD" ? "Email (optional)" : "Email"}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              onFocus={() => setFocusedInput("email")}
              onBlur={() => setFocusedInput(null)}
            />

            {role === "CHILD" && (
              <TextInput
                style={[
                  s.input,
                  focusedInput === "parent_code" && s.inputFocused
                ]}
                placeholder="Parent Code"
                value={parentCode}
                onChangeText={setParentCode}
                onFocus={() => setFocusedInput("parent_code")}
                onBlur={() => setFocusedInput(null)}
              />
            )}

            {role === "ADMIN" && (
              <TextInput
                style={[
                  s.input,
                  focusedInput === "admin_code" && s.inputFocused
                ]}
                placeholder="Admin Code"
                value={adminCode}
                onChangeText={setAdminCode}
                onFocus={() => setFocusedInput("admin_code")}
                onBlur={() => setFocusedInput(null)}
              />
            )}

            <TextInput
              style={[
                s.input,
                focusedInput === "password" && s.inputFocused
              ]}
              placeholder="Password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              onFocus={() => setFocusedInput("password")}
              onBlur={() => setFocusedInput(null)}
            />

            <TextInput
              style={[
                s.input,
                focusedInput === "confirmPassword" && s.inputFocused
              ]}
              placeholder="Confirm Password"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              onFocus={() => setFocusedInput("confirmPassword")}
              onBlur={() => setFocusedInput(null)}
            />

            <Pressable style={s.btn} onPress={handleRegister}>
              <Text style={s.btnText}>REGISTER</Text>
            </Pressable>

            <Pressable onPress={() => router.replace("/(auth)/login")}>
              <Text style={s.link}>Back to Login</Text>
            </Pressable>

          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const s = StyleSheet.create({

  /* -------- TOAST -------- */

  toast: {
    position: "absolute",
    top: 60,
    left: 20,
    right: 20,
    //backgroundColor: "#ffcd71e5",
    //borderColor: "#cca864f1",
    borderWidth: 3,
    padding: 14,
    borderRadius: 12,
    zIndex: 999,
    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    alignItems: "center",
  },

  toastIcon: {
    //alignSelf: "center",
    marginBottom: 6,
    //color: "#5A3E00",
  },

  toastText: {
    color: "#4B3400",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },

  toast_warning: {
    backgroundColor: "#ffcd71e5",
    borderColor: "#cca864f1",
  },

  toast_success: {
    backgroundColor: "#BBF7D0",
    borderColor: "#4ADE80",
  },

  toast_error: {
    backgroundColor: "#FECACA",
    borderColor: "#f38181",
  },

  /* -------- EXISTING UI -------- */

  container: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
  },

  header: {
    alignItems: "center",
    marginBottom: 30,
  },

  title: {
    color: "#FFF8FF",
    fontSize: 36,
    fontWeight: "900",
    letterSpacing: 1,
    textShadowColor: "rgba(0,0,0,0.25)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },

  card: {
    backgroundColor: "#F3EEFF",
    borderRadius: 26,
    padding: 24,
    gap: 12,
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
    borderWidth: 2,
    borderColor: "transparent",
  },

  inputFocused: {
    borderColor: "#8580dd",
    shadowColor: "#8580dd",
    backgroundColor: "#d3d1ee",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
    transform: [{ scale: 1.02 }]
  },

  btn: {
    backgroundColor: "#6C63FF",
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 4,
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
    width: 290,
    height: 290,
    borderRadius: 160,
    backgroundColor: "rgba(255,255,255,0.25)",
    top: -140,
    left: -60,
  },

  blobTopRight: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: "rgba(255,200,255,0.25)",
    top: -100,
    right: -80,
  },

  blobBottom: {
    position: "absolute",
    width: 340,
    height: 340,
    borderRadius: 170,
    backgroundColor: "rgba(255,255,255,0.18)",
    bottom: -180,
    right: 150,
  },

  segmentedContainer: {
    flexDirection: "row",
    backgroundColor: "#E6E2FF",
    borderRadius: 14,
    marginBottom: 14,
    overflow: "hidden",
  },

  segmentedHighlight: {
    position: "absolute",
    width: "33.333%",
    height: "100%",
    backgroundColor: "#6C63FF",
    borderRadius: 14,
  },

  segmentButton: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 12,
  },

  segmentText: {
    color: "#444",
    fontWeight: "600",
    fontSize: 15,
  },

  segmentTextActive: {
    color: "white",
    fontWeight: "700",
  },

});