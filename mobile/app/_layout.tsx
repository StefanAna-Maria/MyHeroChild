import { Stack } from "expo-router";
import { AuthProvider } from "../src/auth/AuthContext";
import { UserProvider } from "../src/context/UserContext";
import { ThemeProvider } from "../src/context/ThemeContext";

export default function RootLayout() {

  return (
    <AuthProvider>
      <UserProvider>
        <ThemeProvider>

          <Stack screenOptions={{ headerShown: false }} />

        </ThemeProvider>
      </UserProvider>
    </AuthProvider>
  );
}