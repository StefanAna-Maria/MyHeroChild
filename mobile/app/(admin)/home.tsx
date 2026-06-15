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

const taskTypeIcons: Record<string, any> = {
  default: require("../../assets/icons/Homework.png"),
  school_work: require("../../assets/icons/Homework.png"),
  reading: require("../../assets/icons/Homework.png"),
  hygiene: require("../../assets/icons/Hygiene.png"),
  neat_tidy: require("../../assets/icons/NeatTidy.png"),
  chores: require("../../assets/icons/Chores.png"),
  family_help: require("../../assets/icons/FamilyHelp.png"),
  responsibility: require("../../assets/icons/FamilyHelp.png"),
  respect_kindness: require("../../assets/icons/FamilyHelp.png"),
  health: require("../../assets/icons/Hygiene.png"),
  life_skills: require("../../assets/icons/FamilyHelp.png"),
  self_improvement: require("../../assets/icons/Homework.png"),
  digital_balance: require("../../assets/icons/Homework.png"),
  social_skills: require("../../assets/icons/FamilyHelp.png"),
  creativity: require("../../assets/icons/Homework.png"),
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

const getDominantTaskType = (tasks: PackageTask[]) => {
  if (tasks.length === 0) {
    return "default";
  }

  const counts = new Map<string, number>();

  tasks.forEach((task) => {
    const type = task.type || "default";
    counts.set(type, (counts.get(type) ?? 0) + 1);
  });

  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "default";
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
                const dominantTaskType = getDominantTaskType(pkg.tasks);
                const dominantTaskIcon =
                  taskTypeIcons[dominantTaskType] ?? taskTypeIcons.default;

                return (
                  <Pressable
                    key={pkg.id}
                    onPress={() =>
                      router.push(`/(admin)/packages/_screens/package-detail?id=${pkg.id}`)
                    }
                    style={s.packageCard}
                  >
                    <View style={s.packageTopVisualRow}>
                      <View style={s.packageTypeIconBubble}>
                        <Image source={dominantTaskIcon} style={s.packageTypeIconImage} />
                      </View>

                      <View style={s.ageBadge}>
                        <Text style={s.ageBadgeText}>Ages:</Text>
                        <Text style={s.ageBadgeValue}>{pkg.ageGroup}</Text>
                      </View>
                    </View>

                    <Text numberOfLines={2} style={s.packageTitle}>
                      {pkg.title}
                    </Text>

                    <View style={s.packageFooterRow}>
                      <View style={[s.packageMetricPill, s.tasksPill]}>
                        <Text style={s.packageMetricPillText}>{pkg.tasks.length} tasks</Text>
                      </View>

                      <View style={[s.packageMetricPill, s.rewardsPill]}>
                        <Text style={s.packageMetricPillText}>{pkg.rewards.length} rewards</Text>
                      </View>
                    </View>

                    {pkg.tasks.length > 0 ? (
                      <Text numberOfLines={1} style={s.packageTypeSummary}>
                        {formatItemTypeLabel(dominantTaskType)}
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
  packageTopVisualRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  packageTypeIconBubble: {
    width: 74,
    height: 74,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#14323E",
  },
  packageTypeIconImage: {
    width: 56,
    height: 56,
    resizeMode: "contain",
  },
  packageTitle: {
    color: "#F8FAFC",
    fontSize: 16,
    fontWeight: "800",
    lineHeight: 21,
    textTransform: "uppercase",
  },
  ageBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
    backgroundColor: "#D8B2FF",
    alignSelf: "center",
    minWidth: 58,
    alignItems: "center",
  },
  ageBadgeText: {
    color: "#33214A",
    fontSize: 10,
    fontWeight: "700",
    lineHeight: 12,
  },
  ageBadgeValue: {
    color: "#33214A",
    fontSize: 11,
    fontWeight: "800",
    lineHeight: 13,
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
