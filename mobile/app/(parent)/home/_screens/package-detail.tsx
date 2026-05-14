import { useCallback, useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { api } from "../../../../src/services/api";
import { useTheme } from "../../../../src/context/ThemeContext";
import { getCategoryByKey, PackageItem } from "../../../../constants/parentCatalogue";
import { getRewardImage } from "../../../../constants/rewardImages";

export default function HomePackageDetailScreen() {
  const { packageId, category } = useLocalSearchParams<{
    packageId: string;
    category?: string;
  }>();
  const router = useRouter();
  const theme = useTheme();
  const [pkg, setPkg] = useState<PackageItem | null>(null);

  const selectedCategory = getCategoryByKey(category);

  const fetchPackage = useCallback(async () => {
    const res = await api.get(`/packages/${packageId}`);
    setPkg(res.data.data);
  }, [packageId]);

  useFocusEffect(
    useCallback(() => {
      fetchPackage();
    }, [fetchPackage])
  );

  if (!pkg) {
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

        <View style={s.topBarText}>
          <Text style={[s.topBarTitle, { color: theme.colors.text }]}>{pkg.title}</Text>
          <Text style={{ color: theme.colors.textMuted }}>
            {selectedCategory?.title ?? `Age Group ${pkg.ageGroup}`}
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={s.content}>
        <View
          style={[
            s.heroCard,
            {
              backgroundColor: theme.colors.primary,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <Text style={[s.heroTitle, { color: theme.colors.text }]}>{pkg.title}</Text>
          <Text style={[s.heroDescription, { color: theme.colors.textMuted }]}>
            {pkg.description || "No description provided."}
          </Text>
        </View>

        <View
          style={[
            s.sectionCard,
            {
              backgroundColor: theme.colors.primary,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <Text style={[s.sectionTitle, { color: theme.colors.text }]}>Tasks</Text>

          {pkg.tasks.length === 0 ? (
            <Text style={{ color: theme.colors.textMuted }}>No tasks in this package.</Text>
          ) : (
            pkg.tasks.map((task) => (
              <View key={task.id} style={[s.itemCard, { backgroundColor: theme.colors.surfaceAlt }]}>
                <Text style={[s.itemTitle, { color: theme.colors.text }]}>{task.title}</Text>

                <View style={s.infoRow}>
                  <View style={[s.typeBadge, { backgroundColor: theme.colors.primary }]}>
                    <Text style={[s.typeBadgeText, { color: theme.colors.textMuted }]}>
                      {task.type || "-"}
                    </Text>
                  </View>

                  <View style={s.metricGroup}>
                    <View style={s.metricItem}>
                      <Text style={[s.metricValue, { color: theme.colors.text }]}>{task.xp}</Text>
                      <Image
                        source={require("../../../../assets/icons/xp.png")}
                        style={s.metricIcon}
                      />
                    </View>

                    <View style={s.metricItem}>
                      <Text style={[s.metricValue, { color: theme.colors.text }]}>
                        {task.rewardPoints}
                      </Text>
                      <Image
                        source={require("../../../../assets/icons/reward_points.png")}
                        style={s.metricIcon}
                      />
                    </View>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>

        <View
          style={[
            s.sectionCard,
            {
              backgroundColor: theme.colors.primary,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <Text style={[s.sectionTitle, { color: theme.colors.text }]}>Rewards</Text>

          {pkg.rewards.length === 0 ? (
            <Text style={{ color: theme.colors.textMuted }}>No rewards in this package.</Text>
          ) : (
            pkg.rewards.map((reward) => {
              const rewardImage = getRewardImage(reward.type);

              return (
                <View
                  key={reward.id}
                  style={[s.rewardCard, { backgroundColor: theme.colors.surfaceAlt }]}
                >
                  <Image source={rewardImage} style={s.rewardImage} />

                  <View style={s.rewardTextWrap}>
                    <Text style={[s.itemTitle, { color: theme.colors.text }]}>{reward.title}</Text>

                    <View style={s.infoRow}>
                      <View style={[s.typeBadge, { backgroundColor: theme.colors.primary }]}>
                        <Text style={[s.typeBadgeText, { color: theme.colors.textMuted }]}>
                          {reward.type || "-"}
                        </Text>
                      </View>

                      <View style={s.metricItem}>
                        <Text style={[s.metricValue, { color: theme.colors.text }]}>
                          {reward.price}
                        </Text>
                        <Image
                          source={require("../../../../assets/icons/reward_points.png")}
                          style={s.metricIcon}
                        />
                      </View>
                    </View>
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
    borderBottomWidth: 1,
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
    borderWidth: 1,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: "800",
  },
  heroDescription: {
    lineHeight: 21,
  },
  sectionCard: {
    borderRadius: 18,
    padding: 16,
    gap: 12,
    borderWidth: 1,
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
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 2,
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  typeBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  metricGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  metricItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metricValue: {
    fontSize: 15,
    fontWeight: "800",
  },
  metricIcon: {
    width: 18,
    height: 18,
    resizeMode: "contain",
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
    resizeMode: "cover",
    borderRadius: 28,
  },
  rewardTextWrap: {
    flex: 1,
    gap: 4,
  },
});
