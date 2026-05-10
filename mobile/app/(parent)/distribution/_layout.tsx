import { Stack } from "expo-router";

export default function DistributionLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="_screens/assign-items" />
      <Stack.Screen name="_screens/child-items" />
    </Stack>
  );
}
