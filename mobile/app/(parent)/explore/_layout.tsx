import { Stack } from "expo-router";

export default function ExploreLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="_screens/category" />
      <Stack.Screen name="_screens/package-detail" />
    </Stack>
  );
}
