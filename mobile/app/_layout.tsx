import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { AuthProvider, useAuth } from "../src/auth/AuthContext";

function AuthGate() {
  const { isReady, token } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!isReady) return;

    const inAuthGroup = segments[0] === "(auth)";
    if (!token && !inAuthGroup) {
      router.replace("/(auth)/login");
    }
    if (token && inAuthGroup) {
      router.replace("/(app)/home");
    }
  }, [isReady, token, segments]);

  return (
    <Stack screenOptions={{ headerShown: false }} />
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  );
}