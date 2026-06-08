import { useCallback, useMemo, useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import AppHeader from "../../../components/AppHeader";
import CurvedScreenBody from "../../../components/CurvedScreenBody";
import { api } from "../../../src/services/api";
import { useTheme } from "../../../src/context/ThemeContext";
import {
  AGE_CATEGORIES,
  PackageItem,
  resolveAgeGroup,
} from "../../../constants/parentCatalogue";

export default function ExploreIndex() {
  const router = useRouter();
  const theme = useTheme();
  const [packages, setPackages] = useState<PackageItem[]>([]);

  const fetchPackages = useCallback(async () => {
    const res = await api.get("/packages");
    setPackages(res.data.data);
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchPackages();
    }, [fetchPackages])
  );

  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>();

    for (const category of AGE_CATEGORIES) {
      counts.set(category.key, 0);
    }

    for (const pkg of packages) {
      const key = resolveAgeGroup(pkg.ageGroup);
      if (counts.has(key)) {
        counts.set(key, (counts.get(key) ?? 0) + 1);
      }
    }

    return counts;
  }, [packages]);

  return (
    <View style={[s.screen, { backgroundColor: theme.colors.background }]}>
      <AppHeader />

      <CurvedScreenBody>
      <ScrollView contentContainerStyle={s.content}>
        <Text style={[s.pageTitle, { color: theme.colors.text }]}>Explore by Age</Text>
        <Text style={[s.pageSubtitle, { color: theme.colors.textMuted }]}>
          Pick an age category to browse the packages created by admin.
        </Text>

        {AGE_CATEGORIES.map((category) => (
          <Pressable
            key={category.key}
            style={[
              s.card,
              {
                backgroundColor: theme.colors.primary,
                borderColor: theme.colors.border,
              },
            ]}
            onPress={() =>
              router.push({
                pathname: "/(parent)/explore/_screens/category",
                params: { category: category.key },
              })
            }
          >
            <Image source={category.image} style={s.cardImage} />

            <View style={s.cardTextWrap}>
              <Text style={[s.cardTitle, { color: theme.colors.text }]}>
                {category.title}
              </Text>
              <Text style={{ color: theme.colors.textMuted }}>{category.subtitle}</Text>
            </View>

            <View
              style={[s.countBadge, { backgroundColor: theme.colors.tabIconActive }]}
            >
              <Text style={s.countText}>{categoryCounts.get(category.key) ?? 0}</Text>
            </View>
          </Pressable>
        ))}
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
    resizeMode: "cover",
    borderRadius: 22,
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
