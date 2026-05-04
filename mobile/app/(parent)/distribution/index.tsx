import { useCallback, useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import AppHeader from "../../../components/AppHeader";
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
    subtitle: "Your custom parent tasks will live here",
    image: require("../../../assets/rewards/default.png"),
  },
  {
    key: "my-rewards",
    title: "My Rewards",
    subtitle: "Your custom parent rewards will live here",
    image: require("../../../assets/rewards/mystery.png"),
  },
] as const;

export default function DistributionIndex() {
  const router = useRouter();
  const theme = useTheme();
  const [packageCount, setPackageCount] = useState(0);

  const fetchCatalogueCount = useCallback(async () => {
    const res = await api.get("/parent/catalog/packages");
    setPackageCount(res.data.data.length);
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchCatalogueCount();
    }, [fetchCatalogueCount])
  );

  const handlePress = (key: string) => {
    if (key === "packages") {
      router.push("/(parent)/distribution/_screens/packages-age-groups");
      return;
    }

    if (key === "my-tasks") {
      router.push("/(parent)/distribution/_screens/my-tasks");
      return;
    }

    router.push("/(parent)/distribution/_screens/my-rewards");
  };

  return (
    <View style={[s.screen, { backgroundColor: theme.colors.background }]}>
      <AppHeader />

      <ScrollView contentContainerStyle={s.content}>
        <Text style={[s.pageTitle, { color: theme.colors.text }]}>My Catalogue</Text>
        <Text style={[s.pageSubtitle, { color: theme.colors.textMuted }]}>
          Open one of the catalogue sections to continue browsing.
        </Text>

        {catalogueCards.map((card) => {
          const count =
            card.key === "packages"
              ? packageCount
              : 0;

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
                <Text style={[s.cardTitle, { color: theme.colors.text }]}>
                  {card.title}
                </Text>
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
    </View>
  );
}

const s = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    padding: 16,
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
