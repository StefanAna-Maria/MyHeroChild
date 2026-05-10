import { Stack } from "expo-router";

export default function HomeLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="_screens/packages-age-groups" />
      <Stack.Screen name="_screens/package-category" />
      <Stack.Screen name="_screens/package-detail" />
      <Stack.Screen name="_screens/my-tasks" />
      <Stack.Screen name="_screens/my-rewards" />
    </Stack>
  );
}
