import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Alert,
  StyleSheet,
} from "react-native";
import { api } from "../../src/services/api";
import { useRouter } from "expo-router";

type Role = "PARENT" | "CHILD" | "ADMIN";

export default function Register() {
  const router = useRouter();

  const [role, setRole] = useState<Role>("PARENT");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [parentCode, setParentCode] = useState("");
  const [adminCode, setAdminCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    try {
      await api.post("/auth/register", {
        username,
        email: email || null,
        password,
        confirmPassword,
        role,
        parentCode: role === "CHILD" ? parentCode : null,
        adminCode: role === "ADMIN" ? adminCode : null,
      });

      Alert.alert("Success", "Account created");
      router.replace("/(auth)/login");
    } catch (error: any) {
      Alert.alert("Error", "Registration failed");
    }
  };

  return (
    <View style={s.container}>
      <Text style={s.title}>Create Account</Text>

      {/* Role selector */}
      <View style={s.roleContainer}>
        {["PARENT", "CHILD", "ADMIN"].map((r) => (
          <Pressable
            key={r}
            style={[
              s.roleButton,
              role === r && s.roleButtonActive,
            ]}
            onPress={() => setRole(r as Role)}
          >
            <Text
              style={[
                s.roleText,
                role === r && s.roleTextActive,
              ]}
            >
              {r}
            </Text>
          </Pressable>
        ))}
      </View>

      <TextInput
        style={s.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
      />

      {role !== "CHILD" && (
        <TextInput
          style={s.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
        />
      )}

      {role === "CHILD" && (
        <TextInput
          style={s.input}
          placeholder="Parent Code"
          value={parentCode}
          onChangeText={setParentCode}
        />
      )}

      {role === "ADMIN" && (
        <TextInput
          style={s.input}
          placeholder="Admin Code"
          value={adminCode}
          onChangeText={setAdminCode}
        />
      )}

      <TextInput
        style={s.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TextInput
        style={s.input}
        placeholder="Confirm Password"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />

      <Pressable style={s.btn} onPress={handleRegister}>
        <Text style={s.btnText}>REGISTER</Text>
      </Pressable>

      <Pressable onPress={() => router.replace("/(auth)/login")}>
        <Text style={s.link}>Back to Login</Text>
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#0b0b0f",
    justifyContent: "center",
  },
  title: {
    fontSize: 28,
    color: "white",
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 20,
  },
  roleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  roleButton: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: "#555",
    marginHorizontal: 4,
    borderRadius: 8,
    alignItems: "center",
  },
  roleButtonActive: {
    backgroundColor: "#4f46e5",
  },
  roleText: {
    color: "white",
  },
  roleTextActive: {
    fontWeight: "700",
  },
  input: {
    backgroundColor: "white",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  btn: {
    backgroundColor: "#4f46e5",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },
  btnText: {
    color: "white",
    fontWeight: "700",
  },
  link: {
    color: "#c7d2fe",
    textAlign: "center",
    marginTop: 12,
  },
});