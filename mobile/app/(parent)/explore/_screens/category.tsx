import { useCallback, useMemo, useState } from "react";
import { Alert, Image, ImageBackground, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CurvedScreenBody from "../../../../components/CurvedScreenBody";
import { api } from "../../../../src/services/api";
import { useTheme } from "../../../../src/context/ThemeContext";
import {
  getCategoryByKey,
  PackageItem,
  resolveAgeGroup,
} from "../../../../constants/parentCatalogue";

const taskTypeImages: Record<string, any> = {
  default: require("../../../../assets/icons/Homework.png"),
  school_work: require("../../../../assets/icons/Homework.png"),
  reading: require("../../../../assets/icons/Homework.png"),
  hygiene: require("../../../../assets/icons/Hygiene.png"),
  neat_tidy: require("../../../../assets/icons/NeatTidy.png"),
  chores: require("../../../../assets/icons/Chores.png"),
  family_help: require("../../../../assets/icons/FamilyHelp.png"),
  responsibility: require("../../../../assets/icons/FamilyHelp.png"),
  respect_kindness: require("../../../../assets/icons/FamilyHelp.png"),
  health: require("../../../../assets/icons/Hygiene.png"),
  life_skills: require("../../../../assets/icons/FamilyHelp.png"),
  self_improvement: require("../../../../assets/icons/Homework.png"),
  digital_balance: require("../../../../assets/icons/Homework.png"),
  social_skills: require("../../../../assets/icons/FamilyHelp.png"),
  creativity: require("../../../../assets/icons/Homework.png"),
};

const getPackageImage = (pkg: PackageItem) => {
  if (pkg.tasks.length === 0) {
    return taskTypeImages.default;
  }

  const counts = new Map<string, number>();
  pkg.tasks.forEach((task) => {
    const type = task.type || "default";
    counts.set(type, (counts.get(type) ?? 0) + 1);
  });

  const dominant = [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "default";
  return taskTypeImages[dominant] ?? taskTypeImages.default;
};

export default function ExploreCategoryScreen() {
  const { category } = useLocalSearchParams<{ category: string }>();
  const router = useRouter();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
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
      <ImageBackground
        source={require("../../../../assets/images/ParentAppHeader.png")}
        resizeMode="cover"
        style={[s.topBar, { paddingTop: insets.top + 14 }]}
      >
        <View style={s.topBarContent}>
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
      </ImageBackground>

      <CurvedScreenBody>
      <ScrollView contentContainerStyle={s.content}>

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
              No packages available in this category right now.
            </Text>
          </View>
        ) : (
          filteredPackages.map((pkg) => {
            const isInCatalogue = catalogueIds.includes(pkg.id);

            return (
              <View
                key={pkg.id}
                style={[
                  s.card,
                  {
                    backgroundColor: theme.colors.primary,
                    borderColor: theme.colors.border,
                  },
                ]}
              >
                <View style={s.cardTopRow}>
                  <Image source={getPackageImage(pkg)} style={s.packageImage} />

                  <Pressable
                    style={s.cardTextContent}
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
                </View>

                <View style={s.cardFooter}>
                  <View style={s.metaRow}>
                    <Text
                      style={[
                        s.metaBadge,
                        {
                          color: theme.colors.text,
                          backgroundColor: theme.colors.surfaceAlt,
                          borderColor: theme.colors.surfaceAlt,
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
                          backgroundColor: theme.colors.tabIconActive,
                          borderColor: theme.colors.tabIconActive,
                        },
                      ]}
                    >
                      {pkg.rewards.length} rewards
                    </Text>
                  </View>

                  <Pressable
                    style={[
                      s.catalogueButton,
                      {
                        backgroundColor: isInCatalogue
                          ? theme.colors.accent
                          : theme.colors.tabIconActive,
                      },
                    ]}
                    onPress={() => handleAddToCatalogue(pkg.id)}
                    disabled={isInCatalogue}
                  >
                    <Text style={s.catalogueButtonText}>
                      {isInCatalogue ? "Added" : "Add"}
                    </Text>
                  </Pressable>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
      </CurvedScreenBody>
    </View>
  );
}

const s = StyleSheet.create({
  screen: {
    flex: 1,
  },
  topBar: {
    paddingBottom: 34,
    paddingHorizontal: 20,
  },
  topBarContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    minHeight: 42,
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
    paddingTop: 28,
    paddingBottom: 32,
    gap: 14,
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
  cardTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  cardTextContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: "row",
    gap: 10,
    flex: 1,
    flexWrap: "wrap",
  },
  metaBadge: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    overflow: "hidden",
    fontWeight: "700",
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  packageImage: {
    width: 62,
    height: 62,
    resizeMode: "contain",
    borderRadius: 18,
  },
  catalogueButton: {
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 92,
  },
  catalogueButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
});
