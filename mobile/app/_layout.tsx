import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { AuthProvider, useAuth } from "../src/auth/AuthContext";
import { UserProvider } from "../src/context/UserContext";
import { ThemeProvider } from "../src/context/ThemeContext";

function RoleRouteGuard() {
  const { isReady, token, role } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (!isReady) {
      return;
    }

    const topSegment = segments[0];

    if (!token) {
      if (topSegment !== "(auth)") {
        router.replace("/(auth)/login");
      }
      return;
    }

    const targetRoot =
      role === "ADMIN"
        ? "/(admin)/home"
        : role === "CHILD"
          ? "/(child)/home"
          : "/(parent)/home";

    const allowedSegment =
      role === "ADMIN" ? "(admin)" : role === "CHILD" ? "(child)" : "(parent)";

    if (topSegment !== allowedSegment) {
      router.replace(targetRoot);
    }
  }, [isReady, role, router, segments, token]);

  return null;
}

export default function RootLayout() {

  return (
    <AuthProvider>
      <UserProvider>
        <ThemeProvider>
          <RoleRouteGuard />

          <Stack screenOptions={{ headerShown: false }} />

        </ThemeProvider>
      </UserProvider>
    </AuthProvider>
  );
}
