import { Stack } from "expo-router";

export default function ChildRewardsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="_screens/reward-shop" />
      <Stack.Screen name="_screens/my-rewards" />
      <Stack.Screen name="_screens/wishlist" />
    </Stack>
  );
}
