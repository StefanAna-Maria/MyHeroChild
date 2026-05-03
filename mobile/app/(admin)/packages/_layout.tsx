import { Stack } from "expo-router";

export default function PackagesLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="_screens/package-create" />
      <Stack.Screen name="_screens/package-detail" />
    </Stack>
  );
}