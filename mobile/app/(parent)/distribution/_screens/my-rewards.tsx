import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../../src/context/ThemeContext";

export default function DistributionMyRewardsScreen() {
  const router = useRouter();
  const theme = useTheme();

  return (
    <View style={[s.screen, { backgroundColor: theme.colors.background }]}>
      <View style={[s.topBar, { backgroundColor: theme.colors.surface }]}>
        <Pressable onPress={() => router.back()} style={s.backButton}>
          <Ionicons name="arrow-back" size={22} color={theme.colors.text} />
        </Pressable>

        <Text style={[s.topBarTitle, { color: theme.colors.text }]}>My Rewards</Text>
      </View>

      <View style={s.content}>
        <Text style={[s.message, { color: theme.colors.textMuted }]}>
          This section is reserved for custom parent rewards and will be populated later.
        </Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  screen: {
    flex: 1,
  },
  topBar: {
    paddingTop: 56,
    paddingBottom: 18,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  topBarTitle: {
    flex: 1,
    fontSize: 24,
    fontWeight: "800",
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  message: {
    textAlign: "center",
    lineHeight: 22,
    fontSize: 16,
  },
});
