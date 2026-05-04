import { useCallback, useState } from "react";
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { api } from "../../../../src/services/api";
import { useTheme } from "../../../../src/context/ThemeContext";
import {
  getCategoryByKey,
  PackageItem,
} from "../../../../constants/parentCatalogue";
import { rewardImages, RewardType } from "../../../../constants/rewardImages";

export default function ParentPackageDetailScreen() {
  const { packageId, category } = useLocalSearchParams<{
    packageId: string;
    category?: string;
  }>();
  const router = useRouter();
  const theme = useTheme();
  const [pkg, setPkg] = useState<PackageItem | null>(null);
  const [catalogueIds, setCatalogueIds] = useState<number[]>([]);

  const selectedCategory = getCategoryByKey(category);

  const fetchData = useCallback(async () => {
    const [packageRes, catalogueRes] = await Promise.all([
      api.get(`/packages/${packageId}`),
      api.get("/parent/catalog/packages"),
    ]);

    setPkg(packageRes.data.data);
    setCatalogueIds((catalogueRes.data.data as PackageItem[]).map((item) => item.id));
  }, [packageId]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  const handleAddToCatalogue = async () => {
    if (!pkg) return;

    try {
      await api.post(`/parent/catalog/packages/${pkg.id}`);
      setCatalogueIds((current) =>
        current.includes(pkg.id) ? current : [...current, pkg.id]
      );
    } catch {
      Alert.alert("Could not add package", "Please try again.");
    }
  };

  if (!pkg) {
    return null;
  }

  const isInCatalogue = catalogueIds.includes(pkg.id);

  return (
    <View style={[s.screen, { backgroundColor: theme.colors.background }]}>
      <View style={[s.topBar, { backgroundColor: theme.colors.surface }]}>
        <Pressable onPress={() => router.back()} style={s.backButton}>
          <Ionicons name="arrow-back" size={22} color={theme.colors.text} />
        </Pressable>

        <View style={s.topBarText}>
          <Text style={[s.topBarTitle, { color: theme.colors.text }]}>{pkg.title}</Text>
          <Text style={{ color: theme.colors.textMuted }}>
            {selectedCategory?.title ?? `Age Group ${pkg.ageGroup}`}
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={s.content}>
        <View style={[s.heroCard, { backgroundColor: theme.colors.surface }]}>
          <Text style={[s.heroTitle, { color: theme.colors.text }]}>{pkg.title}</Text>
          <Text style={[s.heroDescription, { color: theme.colors.textMuted }]}>
            {pkg.description || "No description provided."}
          </Text>

          <Pressable
            style={[
              s.catalogueButton,
              {
                backgroundColor: isInCatalogue
                  ? theme.colors.surfaceAlt
                  : theme.colors.primary,
              },
            ]}
            onPress={handleAddToCatalogue}
            disabled={isInCatalogue}
          >
            <Text style={s.catalogueButtonText}>
              {isInCatalogue ? "Already in Catalogue" : "Add to Catalogue"}
            </Text>
          </Pressable>
        </View>

        <View style={[s.sectionCard, { backgroundColor: theme.colors.surface }]}>
          <Text style={[s.sectionTitle, { color: theme.colors.text }]}>Tasks</Text>

          {pkg.tasks.length === 0 ? (
            <Text style={{ color: theme.colors.textMuted }}>No tasks in this package.</Text>
          ) : (
            pkg.tasks.map((task) => (
              <View
                key={task.id}
                style={[s.itemCard, { backgroundColor: theme.colors.surfaceAlt }]}
              >
                <Text style={[s.itemTitle, { color: theme.colors.text }]}>{task.title}</Text>
                <Text style={{ color: theme.colors.textMuted }}>XP: {task.xp}</Text>
                <Text style={{ color: theme.colors.textMuted }}>
                  Reward Points: {task.rewardPoints}
                </Text>
                <Text style={{ color: theme.colors.textMuted }}>
                  Type: {task.type || "-"}
                </Text>
              </View>
            ))
          )}
        </View>

        <View style={[s.sectionCard, { backgroundColor: theme.colors.surface }]}>
          <Text style={[s.sectionTitle, { color: theme.colors.text }]}>Rewards</Text>

          {pkg.rewards.length === 0 ? (
            <Text style={{ color: theme.colors.textMuted }}>No rewards in this package.</Text>
          ) : (
            pkg.rewards.map((reward) => {
              const rewardImage =
                rewardImages[reward.type as RewardType] ?? rewardImages.default;

              return (
                <View
                  key={reward.id}
                  style={[s.rewardCard, { backgroundColor: theme.colors.surfaceAlt }]}
                >
                  <Image source={rewardImage} style={s.rewardImage} />

                  <View style={s.rewardTextWrap}>
                    <Text style={[s.itemTitle, { color: theme.colors.text }]}>
                      {reward.title}
                    </Text>
                    <Text style={{ color: theme.colors.textMuted }}>
                      Price: {reward.price} RP
                    </Text>
                    <Text style={{ color: theme.colors.textMuted }}>
                      Type: {reward.type || "-"}
                    </Text>
                  </View>
                </View>
              );
            })
          )}
        </View>
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
  topBarText: {
    flex: 1,
  },
  topBarTitle: {
    fontSize: 24,
    fontWeight: "800",
  },
  content: {
    padding: 16,
    paddingBottom: 32,
    gap: 16,
  },
  heroCard: {
    borderRadius: 20,
    padding: 18,
    gap: 12,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: "800",
  },
  heroDescription: {
    lineHeight: 21,
  },
  catalogueButton: {
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 6,
  },
  catalogueButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  sectionCard: {
    borderRadius: 18,
    padding: 16,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
  },
  itemCard: {
    borderRadius: 14,
    padding: 14,
    gap: 4,
  },
  itemTitle: {
    fontSize: 17,
    fontWeight: "700",
  },
  rewardCard: {
    borderRadius: 14,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  rewardImage: {
    width: 56,
    height: 56,
    resizeMode: "contain",
  },
  rewardTextWrap: {
    flex: 1,
    gap: 4,
  },
});
