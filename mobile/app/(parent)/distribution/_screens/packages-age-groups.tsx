import { useCallback, useMemo, useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { api } from "../../../../src/services/api";
import { useTheme } from "../../../../src/context/ThemeContext";
import {
  AGE_CATEGORIES,
  PackageItem,
  resolveAgeGroup,
} from "../../../../constants/parentCatalogue";

export default function DistributionPackagesAgeGroupsScreen() {
  const router = useRouter();
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
      <View
        style={[
          s.topBar,
          {
            backgroundColor: theme.colors.surface,
            borderBottomColor: theme.colors.border,
          },
        ]}
      >
        <Pressable
          onPress={() => router.back()}
          style={[s.backButton, { backgroundColor: theme.colors.surfaceAlt }]}
        >
          <Ionicons name="arrow-back" size={22} color={theme.colors.text} />
        </Pressable>

        <Text style={[s.topBarTitle, { color: theme.colors.text }]}>Packages</Text>
      </View>

      <ScrollView contentContainerStyle={s.content}>
        <Text style={[s.subtitle, { color: theme.colors.textMuted }]}>
          Open an age category to browse the saved packages in your catalogue.
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
                pathname: "/(parent)/distribution/_screens/package-category",
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
    borderBottomWidth: 1,
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
    padding: 16,
    paddingBottom: 32,
    gap: 14,
  },
  subtitle: {
    marginBottom: 4,
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
    borderRadius: 18,
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
