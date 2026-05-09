import { useCallback, useMemo, useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { api } from "../../../../src/services/api";
import { useTheme } from "../../../../src/context/ThemeContext";
import {
  getCategoryByKey,
  PackageItem,
  resolveAgeGroup,
} from "../../../../constants/parentCatalogue";

export default function DistributionPackageCategoryScreen() {
  const { category } = useLocalSearchParams<{ category: string }>();
  const router = useRouter();
  const theme = useTheme();
  const [cataloguePackages, setCataloguePackages] = useState<PackageItem[]>([]);

  const selectedCategory = getCategoryByKey(category);

  const fetchCatalogue = useCallback(async () => {
    const res = await api.get("/parent/catalog/packages");
    setCataloguePackages(res.data.data);
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchCatalogue();
    }, [fetchCatalogue])
  );

  const filteredPackages = useMemo(
    () => cataloguePackages.filter((pkg) => resolveAgeGroup(pkg.ageGroup) === category),
    [category, cataloguePackages]
  );

  if (!selectedCategory) {
    return null;
  }

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

        <Text style={[s.topBarTitle, { color: theme.colors.text }]}>
          {selectedCategory.title}
        </Text>

        <Image source={selectedCategory.image} style={s.topBarImage} />
      </View>

      <ScrollView contentContainerStyle={s.content}>
        <Text style={[s.subtitle, { color: theme.colors.textMuted }]}>
          Saved packages from your catalogue for this age category.
        </Text>

        {filteredPackages.length === 0 ? (
          <View
            style={[
              s.emptyCard,
              {
                backgroundColor: theme.colors.primary,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <Text style={{ color: theme.colors.textMuted }}>
              No catalogue packages in this category yet.
            </Text>
          </View>
        ) : (
          filteredPackages.map((pkg) => (
            <Pressable
              key={pkg.id}
              style={[
                s.card,
                {
                  backgroundColor: theme.colors.primary,
                  borderColor: theme.colors.border,
                },
              ]}
              onPress={() =>
                router.push({
                  pathname: "/(parent)/distribution/_screens/package-detail",
                  params: { packageId: String(pkg.id), category: selectedCategory.key },
                })
              }
            >
              <Text style={[s.cardTitle, { color: theme.colors.text }]}>{pkg.title}</Text>
              <Text style={{ color: theme.colors.textMuted }}>
                {pkg.description || "No description provided."}
              </Text>

              <View style={s.metaRow}>
                <Text
                  style={[
                    s.metaBadge,
                    {
                      color: theme.colors.text,
                      borderColor: theme.colors.surfaceAlt,
                      backgroundColor: theme.colors.surfaceAlt,
                    },
                  ]}
                >
                  {pkg.tasks.length} tasks
                </Text>
                <Text
                  style={[
                    s.metaBadge,
                    {
                      color: theme.colors.text,
                      borderColor: theme.colors.tabIconActive,
                      backgroundColor: theme.colors.tabIconActive,
                    },
                  ]}
                >
                  {pkg.rewards.length} rewards
                </Text>
              </View>
            </Pressable>
          ))
        )}
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
  topBarImage: {
    width: 54,
    height: 54,
    resizeMode: "cover",
    borderRadius: 18,
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
  emptyCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  card: {
    borderRadius: 18,
    padding: 16,
    gap: 14,
    borderWidth: 1,
    shadowColor: "#8F7AD8",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: "row",
    gap: 10,
  },
  metaBadge: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    overflow: "hidden",
    fontWeight: "700",
  },
});
