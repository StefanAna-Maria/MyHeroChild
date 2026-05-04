import { useCallback, useMemo, useState } from "react";
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { api } from "../../../../src/services/api";
import { useTheme } from "../../../../src/context/ThemeContext";
import {
  getCategoryByKey,
  PackageItem,
  resolveAgeGroup,
} from "../../../../constants/parentCatalogue";

export default function ExploreCategoryScreen() {
  const { category } = useLocalSearchParams<{ category: string }>();
  const router = useRouter();
  const theme = useTheme();
  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [catalogueIds, setCatalogueIds] = useState<number[]>([]);

  const selectedCategory = getCategoryByKey(category);

  const fetchData = useCallback(async () => {
    const [packagesRes, catalogueRes] = await Promise.all([
      api.get("/packages"),
      api.get("/parent/catalog/packages"),
    ]);

    setPackages(packagesRes.data.data);
    setCatalogueIds((catalogueRes.data.data as PackageItem[]).map((pkg) => pkg.id));
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  const filteredPackages = useMemo(
    () => packages.filter((pkg) => resolveAgeGroup(pkg.ageGroup) === category),
    [category, packages]
  );

  const handleAddToCatalogue = async (packageId: number) => {
    try {
      await api.post(`/parent/catalog/packages/${packageId}`);
      setCatalogueIds((current) =>
        current.includes(packageId) ? current : [...current, packageId]
      );
    } catch {
      Alert.alert("Could not add package", "Please try again.");
    }
  };

  if (!selectedCategory) {
    return null;
  }

  return (
    <View style={[s.screen, { backgroundColor: theme.colors.background }]}>
      <View style={[s.topBar, { backgroundColor: theme.colors.surface }]}>
        <Pressable onPress={() => router.back()} style={s.backButton}>
          <Ionicons name="arrow-back" size={22} color={theme.colors.text} />
        </Pressable>

        <Text style={[s.topBarTitle, { color: theme.colors.text }]}>
          {selectedCategory.title}
        </Text>

        <Image source={selectedCategory.image} style={s.topBarImage} />
      </View>

      <ScrollView contentContainerStyle={s.content}>
        <Text style={[s.subtitle, { color: theme.colors.textMuted }]}>
          {selectedCategory.subtitle}
        </Text>

        {filteredPackages.length === 0 ? (
          <View style={[s.emptyCard, { backgroundColor: theme.colors.surface }]}>
            <Text style={{ color: theme.colors.textMuted }}>
              No packages available in this category right now.
            </Text>
          </View>
        ) : (
          filteredPackages.map((pkg) => {
            const isInCatalogue = catalogueIds.includes(pkg.id);

            return (
              <View key={pkg.id} style={[s.card, { backgroundColor: theme.colors.surface }]}>
                <Pressable
                  onPress={() =>
                    router.push({
                      pathname: "/(parent)/explore/_screens/package-detail",
                      params: { packageId: String(pkg.id), category: selectedCategory.key },
                    })
                  }
                >
                  <Text style={[s.cardTitle, { color: theme.colors.text }]}>{pkg.title}</Text>
                  <Text style={{ color: theme.colors.textMuted }}>
                    {pkg.description || "No description provided."}
                  </Text>
                </Pressable>

                <View style={s.metaRow}>
                  <Text style={[s.metaBadge, { color: theme.colors.textMuted, borderColor: theme.colors.border }]}>
                    {pkg.tasks.length} tasks
                  </Text>
                  <Text style={[s.metaBadge, { color: theme.colors.textMuted, borderColor: theme.colors.border }]}>
                    {pkg.rewards.length} rewards
                  </Text>
                </View>

                <Pressable
                  style={[
                    s.catalogueButton,
                    {
                      backgroundColor: isInCatalogue
                        ? theme.colors.surfaceAlt
                        : theme.colors.primary,
                    },
                  ]}
                  onPress={() => handleAddToCatalogue(pkg.id)}
                  disabled={isInCatalogue}
                >
                  <Text style={s.catalogueButtonText}>
                    {isInCatalogue ? "Already in Catalogue" : "Add to Catalogue"}
                  </Text>
                </Pressable>
              </View>
            );
          })
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
    resizeMode: "contain",
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
  },
  card: {
    borderRadius: 18,
    padding: 16,
    gap: 14,
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
  },
  catalogueButton: {
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  catalogueButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
});
