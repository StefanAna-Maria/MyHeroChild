import { useState } from "react";
import { View, TextInput, Button, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "../../src/services/api";
import { useRouter } from "expo-router";

export default function Login() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  const router = useRouter();

  const handleLogin = async () => {
    try {
      const response = await api.post("/auth/login", {
        identifier,
        password,
      });

      const token = response.data;
      await AsyncStorage.setItem("token", token);

      router.replace("/(app)/home");

    } catch (error: any) {
      Alert.alert("Error", "Login failed");
    }
  };

  return (
    <View style={{ padding: 20, marginTop: 100 }}>
      <TextInput
        placeholder="Username or Email"
        value={identifier}
        onChangeText={setIdentifier}
        style={{ borderWidth: 1, marginBottom: 10, padding: 10 }}
      />
      <TextInput
        placeholder="Password"
        value={password}
        secureTextEntry
        onChangeText={setPassword}
        style={{ borderWidth: 1, marginBottom: 10, padding: 10 }}
      />
      <Button title="Login" onPress={handleLogin} />
    </View>
  );
}