import { useCallback, useMemo, useState } from "react";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "expo-router";
import AppHeader from "../../components/AppHeader";
import { api } from "../../src/services/api";
import { useTheme } from "../../src/context/ThemeContext";
import {
  AGE_CATEGORIES,
  PackageItem,
  resolveAgeGroup,
} from "../../constants/parentCatalogue";

export default function Distribution() {
  const theme = useTheme();
  const [cataloguePackages, setCataloguePackages] = useState<PackageItem[]>([]);

  const fetchCatalogue = useCallback(async () => {
    const res = await api.get("/parent/catalog/packages");
    setCataloguePackages(res.data.data);
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchCatalogue();
    }, [fetchCatalogue])
  );

  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>();

    for (const category of AGE_CATEGORIES) {
      counts.set(category.key, 0);
    }

    for (const pkg of cataloguePackages) {
      const key = resolveAgeGroup(pkg.ageGroup);
      if (counts.has(key)) {
        counts.set(key, (counts.get(key) ?? 0) + 1);
      }
    }

    return counts;
  }, [cataloguePackages]);

  return (
    <View style={[s.screen, { backgroundColor: theme.colors.background }]}>
      <AppHeader />

      <ScrollView contentContainerStyle={s.content}>
        <Text style={[s.pageTitle, { color: theme.colors.text }]}>My Catalogue</Text>
        <Text style={[s.pageSubtitle, { color: theme.colors.textMuted }]}>
          Packages are organized by age category, ready for future distribution.
        </Text>

        {AGE_CATEGORIES.map((category) => (
          <View
            key={category.key}
            style={[s.categoryCard, { backgroundColor: theme.colors.surface }]}
          >
            <Image source={category.image} style={s.categoryImage} />

            <View style={s.categoryTextWrap}>
              <Text style={[s.sectionTitle, { color: theme.colors.text }]}>
                {category.title}
              </Text>
              <Text style={{ color: theme.colors.textMuted }}>{category.subtitle}</Text>
              <Text style={[s.countLabel, { color: theme.colors.primaryLight }]}>
                {categoryCounts.get(category.key) ?? 0} packages
              </Text>
            </View>
          </View>
        ))}
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
    gap: 16,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: "800",
  },
  pageSubtitle: {
    marginTop: 8,
    lineHeight: 20,
  },
  categoryCard: {
    borderRadius: 22,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  categoryImage: {
    width: 76,
    height: 76,
    resizeMode: "contain",
  },
  categoryTextWrap: {
    flex: 1,
    gap: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
  },
  countLabel: {
    marginTop: 6,
    fontSize: 15,
    fontWeight: "700",
  },
});
