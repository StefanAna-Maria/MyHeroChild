import { useCallback, useMemo, useState } from "react";
import {
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import AppHeader from "../../components/AppHeader";
import CurvedScreenBody from "../../components/CurvedScreenBody";
import { formatItemTypeLabel } from "../../constants/itemTypes";
import { api } from "../../src/services/api";
import { useTheme } from "../../src/context/ThemeContext";
import { useUser } from "../../src/context/UserContext";

type PackageTask = {
  id: number;
  type: string;
};

type PackageReward = {
  id: number;
};

type AdminHomePackage = {
  id: number;
  title: string;
  ageGroup: string;
  tasks: PackageTask[];
  rewards: PackageReward[];
};

const taskTypeIcons: Record<string, keyof typeof Ionicons.glyphMap> = {
  default: "sparkles-outline",
  school_work: "school-outline",
  reading: "book-outline",
  hygiene: "water-outline",
  neat_tidy: "sparkles-outline",
  chores: "hammer-outline",
  family_help: "people-outline",
  responsibility: "shield-checkmark-outline",
  respect_kindness: "heart-outline",
  health: "fitness-outline",
  life_skills: "construct-outline",
  self_improvement: "trending-up-outline",
  digital_balance: "phone-portrait-outline",
  social_skills: "chatbubbles-outline",
  creativity: "color-palette-outline",
};

const quickActions = [
  {
    key: "new-package",
    title: "Add New Package",
    route: "/(admin)/packages/_screens/package-create",
    image: require("../../assets/icons/newPackage.png"),
    backgroundColor: "#1B7E84",
    borderColor: "#2C9BA1",
  },
  {
    key: "analytics",
    title: "View Analytics",
    route: "/(admin)/adminPanel",
    image: require("../../assets/icons/Analytics.png"),
    backgroundColor: "#F18479",
    borderColor: "#F4A097",
  },
] as const;

const getTaskTypePreview = (tasks: PackageTask[]) => {
  const uniqueTypes = [...new Set(tasks.map((task) => task.type).filter(Boolean))];
  return uniqueTypes.slice(0, 4);
};

export default function AdminHome() {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useUser();
  const [packages, setPackages] = useState<AdminHomePackage[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPackages = useCallback(async () => {
    const response = await api.get("/packages");
    const allPackages = (response.data.data ?? []) as AdminHomePackage[];
    const latestPackages = [...allPackages]
      .sort((a, b) => b.id - a.id)
      .slice(0, 4);
    setPackages(latestPackages);
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchPackages();
    }, [fetchPackages])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchPackages();
    } finally {
      setRefreshing(false);
    }
  }, [fetchPackages]);

  const username = useMemo(() => user?.username ?? "Admin", [user?.username]);

  return (
    <View style={[s.screen, { backgroundColor: theme.colors.background }]}>
      <AppHeader />

      <CurvedScreenBody>
        <ScrollView
          contentContainerStyle={s.content}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.colors.primary}
            />
          }
        >
          <View style={s.heroBlock}>
            <Text style={s.heroTitle}>{`Welcome back, ${username}!`}</Text>
            <Text style={s.heroDescription}>
              Empowering families starts here. Use your dashboard to monitor platform engagement and design exciting new task & reward packages that help parents motivate their kids every day.
            </Text>
          </View>

          <View style={s.quickActionsRow}>
            {quickActions.map((action) => (
              <Pressable
                key={action.key}
                onPress={() => router.push(action.route as never)}
                style={[
                  s.quickActionCard,
                  {
                    backgroundColor: action.backgroundColor,
                    borderColor: action.borderColor,
                  },
                ]}
              >
                <Text style={s.quickActionTitle}>{action.title}</Text>
                <Image source={action.image} style={s.quickActionIcon} />
              </Pressable>
            ))}
          </View>

          <View style={s.separator} />

          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>Latest Packages</Text>
          </View>

          {packages.length === 0 ? (
            <View style={s.emptyState}>
              <Text style={s.emptyStateTitle}>No packages yet</Text>
              <Text style={s.emptyStateText}>
                Start by creating the first package for the platform.
              </Text>
            </View>
          ) : (
            <View style={s.packageGrid}>
              {packages.map((pkg) => {
                const previewTypes = getTaskTypePreview(pkg.tasks);

                return (
                  <Pressable
                    key={pkg.id}
                    onPress={() =>
                      router.push(`/(admin)/packages/_screens/package-detail?id=${pkg.id}`)
                    }
                    style={s.packageCard}
                  >
                    <View style={s.packageIconsWrap}>
                      {previewTypes.length > 0 ? (
                        previewTypes.map((type, index) => (
                          <View
                            key={`${pkg.id}-${type}-${index}`}
                            style={s.packageTypeIconBubble}
                          >
                            <Ionicons
                              name={taskTypeIcons[type] ?? "sparkles-outline"}
                              size={18}
                              color="#B7F3C9"
                            />
                          </View>
                        ))
                      ) : (
                        <View style={s.packageTypeIconBubble}>
                          <Ionicons
                            name="sparkles-outline"
                            size={18}
                            color="#B7F3C9"
                          />
                        </View>
                      )}
                    </View>

                    <View style={s.packageTitleRow}>
                      <Text numberOfLines={2} style={s.packageTitle}>
                        {pkg.title}
                      </Text>

                      <View style={s.ageBadge}>
                        <Text style={s.ageBadgeText}>Ages:{pkg.ageGroup}</Text>
                      </View>
                    </View>

                    <View style={s.packageFooterRow}>
                      <View style={[s.packageMetricPill, s.tasksPill]}>
                        <Text style={s.packageMetricPillText}>{pkg.tasks.length} tasks</Text>
                      </View>

                      <View style={[s.packageMetricPill, s.rewardsPill]}>
                        <Text style={s.packageMetricPillText}>{pkg.rewards.length} rewards</Text>
                      </View>
                    </View>

                    {previewTypes.length > 0 ? (
                      <Text numberOfLines={1} style={s.packageTypeSummary}>
                        {previewTypes.map((type) => formatItemTypeLabel(type)).join(" • ")}
                      </Text>
                    ) : null}
                  </Pressable>
                );
              })}
            </View>
          )}

          <Pressable
            onPress={() => router.push("/(admin)/packages" as never)}
            style={[s.viewAllButton, { backgroundColor: theme.colors.primary }]}
          >
            <Text style={s.viewAllText}>View All</Text>
          </Pressable>
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
    gap: 18,
  },
  heroBlock: {
    gap: 10,
  },
  heroTitle: {
    color: "#55d1bc",
    fontSize: 30,
    fontWeight: "800",
    lineHeight: 36,
  },
  heroDescription: {
    color: "#D4DCEA",
    fontSize: 16,
    lineHeight: 24,
  },
  quickActionsRow: {
    flexDirection: "row",
    gap: 12,
  },
  quickActionCard: {
    flex: 1,
    minHeight: 92,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  quickActionTitle: {
    flex: 1,
    color: "#F8FAFC",
    fontSize: 18,
    fontWeight: "800",
    lineHeight: 24,
  },
  quickActionIcon: {
    width: 36,
    height: 36,
    resizeMode: "contain",
  },
  separator: {
    height: 1,
    borderRadius: 999,
    backgroundColor: "#1D2943",
  },
  sectionHeader: {
    gap: 6,
  },
  sectionTitle: {
    color: "#F8FAFC",
    fontSize: 24,
    fontWeight: "800",
  },
  emptyState: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#1D2943",
    backgroundColor: "#111B31",
    padding: 18,
    gap: 8,
  },
  emptyStateTitle: {
    color: "#F8FAFC",
    fontSize: 20,
    fontWeight: "800",
  },
  emptyStateText: {
    color: "#D4DCEA",
    fontSize: 15,
    lineHeight: 22,
  },
  packageGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 14,
  },
  packageCard: {
    width: "48.2%",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#245F70",
    backgroundColor: "#1A4B58",
    padding: 14,
    minHeight: 228,
    gap: 10,
  },
  packageIconsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    minHeight: 78,
    alignContent: "flex-start",
  },
  packageTypeIconBubble: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#14323E",
  },
  packageTitleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 8,
  },
  packageTitle: {
    color: "#F8FAFC",
    fontSize: 16,
    fontWeight: "800",
    lineHeight: 21,
    flex: 1,
    textTransform: "uppercase",
  },
  ageBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "#D8B2FF",
    marginTop: 2,
    flexShrink: 0,
  },
  ageBadgeText: {
    color: "#33214A",
    fontSize: 11,
    fontWeight: "700",
  },
  packageFooterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: "auto",
  },
  packageMetricPill: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  tasksPill: {
    backgroundColor: "#BDE9FF",
  },
  rewardsPill: {
    backgroundColor: "#BFEBC6",
  },
  packageMetricPillText: {
    color: "#1F2937",
    fontSize: 11,
    fontWeight: "800",
  },
  packageTypeSummary: {
    color: "#D4DCEA",
    fontSize: 11,
    fontWeight: "600",
    lineHeight: 15,
  },
  viewAllButton: {
    borderRadius: 20,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  viewAllText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
});
