import { useCallback, useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import AppHeader from "../../../components/AppHeader";
import CurvedScreenBody from "../../../components/CurvedScreenBody";
import { api } from "../../../src/services/api";
import { useTheme } from "../../../src/context/ThemeContext";

const catalogueCards = [
  {
    key: "packages",
    title: "Packages",
    subtitle: "Browse saved admin packages by age group",
    image: require("../../../assets/rewards/family.png"),
  },
  {
    key: "my-tasks",
    title: "My Tasks",
    subtitle: "Open your custom parent tasks catalogue",
    image: require("../../../assets/rewards/default.png"),
  },
  {
    key: "my-rewards",
    title: "My Rewards",
    subtitle: "Open your custom parent rewards catalogue",
    image: require("../../../assets/rewards/mystery.png"),
  },
] as const;

export default function ParentHomeIndex() {
  const router = useRouter();
  const theme = useTheme();
  const [packageCount, setPackageCount] = useState(0);
  const [taskCount, setTaskCount] = useState(0);
  const [rewardCount, setRewardCount] = useState(0);

  const fetchCatalogueCount = useCallback(async () => {
    const [packagesRes, tasksRes, rewardsRes] = await Promise.all([
      api.get("/parent/catalog/packages"),
      api.get("/parent/catalog/tasks"),
      api.get("/parent/catalog/rewards"),
    ]);

    setPackageCount(packagesRes.data.data.length);
    setTaskCount(tasksRes.data.data.length);
    setRewardCount(rewardsRes.data.data.length);
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchCatalogueCount();
    }, [fetchCatalogueCount])
  );

  const handlePress = (key: string) => {
    if (key === "packages") {
      router.push("/(parent)/home/_screens/packages-age-groups");
      return;
    }

    if (key === "my-tasks") {
      router.push("/(parent)/home/_screens/my-tasks");
      return;
    }

    router.push("/(parent)/home/_screens/my-rewards");
  };

  return (
    <View style={[s.screen, { backgroundColor: theme.colors.background }]}>
      <AppHeader />

      <CurvedScreenBody>
      <ScrollView contentContainerStyle={s.content}>
        <Text style={[s.pageTitle, { color: theme.colors.text }]}>My Catalogue</Text>
        <Text style={[s.pageSubtitle, { color: theme.colors.textMuted }]}>
          Open one of your catalogue sections to manage and review what can be distributed.
        </Text>

        {catalogueCards.map((card) => {
          const count =
            card.key === "packages"
              ? packageCount
              : card.key === "my-tasks"
                ? taskCount
                : rewardCount;

          return (
            <Pressable
              key={card.key}
              style={[
                s.card,
                {
                  backgroundColor: theme.colors.primary,
                  borderColor: theme.colors.border,
                },
              ]}
              onPress={() => handlePress(card.key)}
            >
              <Image source={card.image} style={s.cardImage} />

              <View style={s.cardTextWrap}>
                <Text style={[s.cardTitle, { color: theme.colors.text }]}>{card.title}</Text>
                <Text style={{ color: theme.colors.textMuted }}>{card.subtitle}</Text>
              </View>

              <View
                style={[
                  s.countBadge,
                  {
                    backgroundColor: theme.colors.tabIconActive,
                  },
                ]}
              >
                <Text style={s.countText}>{count}</Text>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
      </CurvedScreenBody>
    </View>
  );
}

const s = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingTop: 18,
    paddingBottom: 32,
    gap: 14,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: "800",
  },
  pageSubtitle: {
    marginTop: 8,
    marginBottom: 10,
    lineHeight: 20,
  },
  card: {
    borderRadius: 22,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderWidth: 1,
    shadowColor: "#8F7AD8",
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  cardImage: {
    width: 72,
    height: 72,
    resizeMode: "contain",
    borderRadius: 24,
  },
  cardTextWrap: {
    flex: 1,
    gap: 4,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "800",
  },
  countBadge: {
    minWidth: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  countText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 16,
  },
});
