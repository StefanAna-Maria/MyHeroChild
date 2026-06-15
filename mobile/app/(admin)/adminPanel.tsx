import { Ionicons } from "@expo/vector-icons";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useFocusEffect } from "expo-router";

import AppHeader from "../../components/AppHeader";
import CurvedScreenBody from "../../components/CurvedScreenBody";
import { api } from "../../src/services/api";
import { useTheme } from "../../src/context/ThemeContext";

type OverviewMetrics = {
  totalRegisteredUsers: number;
  totalTasksDistributed: number;
  averageSavedPackagesPerParent: number;
  totalRewardsClaimed: number;
  totalTasksCompleted: number;
  weeklyTaskCompletionRate: number;
  weeklyUserGrowthPercentage: number;
};

type MonthlyActivityPoint = {
  label: string;
  activeFamilies: number;
};

type WeeklyEngagementPoint = {
  label: string;
  completedTasks: number;
  claimedRewards: number;
};

type AdminAnalytics = {
  overview: OverviewMetrics;
  activeFamiliesByMonth: MonthlyActivityPoint[];
  completedTasksVsClaimedRewards: WeeklyEngagementPoint[];
};

const metricDefinitions = [
  { key: "totalRegisteredUsers", label: "Registered Users", accent: "#55D1BC" },
  { key: "totalTasksDistributed", label: "Tasks Distributed", accent: "#7DD3FC" },
  { key: "averageSavedPackagesPerParent", label: "Avg Saved Packages / Parent", accent: "#C4B5FD" },
  { key: "totalRewardsClaimed", label: "Rewards Claimed", accent: "#F9A8D4" },
  { key: "totalTasksCompleted", label: "Tasks Completed", accent: "#86EFAC" },
  { key: "weeklyTaskCompletionRate", label: "Weekly Completion Rate", accent: "#FDBA74" },
  { key: "weeklyUserGrowthPercentage", label: "New User Growth", accent: "#FCA5A5" },
] as const;

export default function AdminPanel() {
  const theme = useTheme();
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [chartIndex, setChartIndex] = useState(0);

  const loadAnalytics = useCallback(async () => {
    const response = await api.get("/admin/analytics");
    setAnalytics(response.data.data as AdminAnalytics);
  }, []);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      const run = async () => {
        setLoading(true);
        try {
          const response = await api.get("/admin/analytics");
          if (active) {
            setAnalytics(response.data.data as AdminAnalytics);
          }
        } finally {
          if (active) {
            setLoading(false);
          }
        }
      };

      run();

      return () => {
        active = false;
      };
    }, [])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadAnalytics();
    } finally {
      setRefreshing(false);
    }
  }, [loadAnalytics]);

  const chartCards = useMemo(() => {
    if (!analytics) {
      return [];
    }

    return [
      {
        key: "families",
        title: "Active Families by Month",
        subtitle:
          "A family counts as active when a parent and at least one linked child both show activity in the same month.",
        content: (
          <SingleSeriesChart
            data={analytics.activeFamiliesByMonth}
            valueKey="activeFamilies"
            barColor="#55D1BC"
            emptyLabel="No family activity yet"
          />
        ),
      },
      {
        key: "engagement",
        title: "Completed Tasks vs Claimed Rewards",
        subtitle: "Child completions and reward claims recorded during the last 7 days.",
        content: (
          <GroupedWeeklyChart
            data={analytics.completedTasksVsClaimedRewards}
            leftLabel="Completed"
            rightLabel="Claimed"
            leftColor="#7C83FF"
            rightColor="#55D1BC"
          />
        ),
      },
    ];
  }, [analytics]);

  const currentChart = chartCards[chartIndex] ?? null;

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
            <Text style={s.heroTitle}>Platform Analytics</Text>
            <Text style={s.heroDescription}>
              Track engagement across the entire app and switch between key admin insights.
            </Text>
          </View>

          {loading && !analytics ? (
            <View style={s.loadingCard}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text style={[s.loadingText, { color: theme.colors.textMuted }]}>
                Loading platform analytics...
              </Text>
            </View>
          ) : null}

          {analytics ? (
            <>
              <View style={s.metricsGrid}>
                {metricDefinitions.map((metric) => (
                  <View key={metric.key} style={s.metricCard}>
                    <View style={[s.metricAccent, { backgroundColor: metric.accent }]} />
                    <Text style={s.metricValue}>
                      {formatMetricValue(metric.key, analytics.overview[metric.key])}
                    </Text>
                    <Text style={s.metricLabel}>{metric.label}</Text>
                  </View>
                ))}
              </View>

              {currentChart ? (
                <View style={s.chartCard}>
                  <View style={s.chartHeader}>
                    <View style={s.chartHeaderText}>
                      <Text style={s.chartTitle}>{currentChart.title}</Text>
                      <Text style={s.chartSubtitle}>{currentChart.subtitle}</Text>
                    </View>

                    <Pressable
                      onPress={() => setChartIndex((previous) => (previous + 1) % chartCards.length)}
                      style={s.chartSwitchButton}
                    >
                      <Ionicons name="swap-horizontal" size={20} color="#F8FAFC" />
                    </Pressable>
                  </View>

                  {currentChart.content}
                </View>
              ) : null}
            </>
          ) : null}
        </ScrollView>
      </CurvedScreenBody>
    </View>
  );
}

function SingleSeriesChart({
  data,
  valueKey,
  barColor,
  emptyLabel,
}: {
  data: MonthlyActivityPoint[];
  valueKey: "activeFamilies";
  barColor: string;
  emptyLabel: string;
}) {
  const maxValue = Math.max(1, ...data.map((item) => item[valueKey]));
  const hasAnyValue = data.some((item) => item[valueKey] > 0);

  if (!hasAnyValue) {
    return <Text style={s.emptyChartText}>{emptyLabel}</Text>;
  }

  return (
    <View style={s.singleChartRow}>
      {data.map((item) => (
        <View key={item.label} style={s.singleChartColumn}>
          <Text style={s.barValueText}>{item[valueKey]}</Text>
          <View style={s.singleChartTrack}>
            <View
              style={[
                s.singleChartBar,
                {
                  backgroundColor: barColor,
                  height: `${Math.max((item[valueKey] / maxValue) * 100, item[valueKey] > 0 ? 8 : 0)}%`,
                },
              ]}
            />
          </View>
          <Text style={s.chartAxisLabel}>{item.label}</Text>
        </View>
      ))}
    </View>
  );
}

function GroupedWeeklyChart({
  data,
  leftLabel,
  rightLabel,
  leftColor,
  rightColor,
}: {
  data: WeeklyEngagementPoint[];
  leftLabel: string;
  rightLabel: string;
  leftColor: string;
  rightColor: string;
}) {
  const maxValue = Math.max(
    1,
    ...data.flatMap((item) => [item.completedTasks, item.claimedRewards])
  );
  const hasAnyValue = data.some(
    (item) => item.completedTasks > 0 || item.claimedRewards > 0
  );

  return (
    <View style={s.groupedChartWrap}>
      <View style={s.chartLegend}>
        <View style={s.legendItem}>
          <View style={[s.legendDot, { backgroundColor: leftColor }]} />
          <Text style={s.legendText}>{leftLabel}</Text>
        </View>
        <View style={s.legendItem}>
          <View style={[s.legendDot, { backgroundColor: rightColor }]} />
          <Text style={s.legendText}>{rightLabel}</Text>
        </View>
      </View>

      {!hasAnyValue ? (
        <Text style={s.emptyChartText}>No weekly engagement recorded yet</Text>
      ) : (
        <View style={s.groupedChartRow}>
          {data.map((item) => (
            <View key={item.label} style={s.groupedChartColumn}>
              <Text style={s.barValueText}>
                {item.completedTasks + item.claimedRewards}
              </Text>
              <View style={s.groupedBars}>
                <View
                  style={[
                    s.groupedBar,
                    {
                      backgroundColor: leftColor,
                      height: `${Math.max((item.completedTasks / maxValue) * 100, item.completedTasks > 0 ? 8 : 0)}%`,
                    },
                  ]}
                />
                <View
                  style={[
                    s.groupedBar,
                    {
                      backgroundColor: rightColor,
                      height: `${Math.max((item.claimedRewards / maxValue) * 100, item.claimedRewards > 0 ? 8 : 0)}%`,
                    },
                  ]}
                />
              </View>
              <Text style={s.chartAxisLabel}>{item.label}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

function formatMetricValue(key: keyof OverviewMetrics, value: number) {
  if (key === "averageSavedPackagesPerParent") {
    return value.toFixed(1);
  }

  if (key === "weeklyTaskCompletionRate" || key === "weeklyUserGrowthPercentage") {
    const prefix = value > 0 && key === "weeklyUserGrowthPercentage" ? "+" : "";
    return `${prefix}${value.toFixed(1)}%`;
  }

  return String(value);
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
  loadingCard: {
    borderRadius: 24,
    backgroundColor: "#111B31",
    borderWidth: 1,
    borderColor: "#1D2943",
    paddingVertical: 28,
    paddingHorizontal: 18,
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 15,
    fontWeight: "600",
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 12,
  },
  metricCard: {
    width: "48.4%",
    minHeight: 122,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#1D2943",
    backgroundColor: "#111B31",
    padding: 16,
    gap: 10,
  },
  metricAccent: {
    width: 42,
    height: 6,
    borderRadius: 999,
  },
  metricValue: {
    color: "#F8FAFC",
    fontSize: 28,
    fontWeight: "800",
    lineHeight: 32,
  },
  metricLabel: {
    color: "#D4DCEA",
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 18,
  },
  chartCard: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#1D2943",
    backgroundColor: "#111B31",
    padding: 18,
    gap: 16,
  },
  chartHeader: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
  },
  chartHeaderText: {
    flex: 1,
    gap: 6,
  },
  chartTitle: {
    color: "#F8FAFC",
    fontSize: 22,
    fontWeight: "800",
  },
  chartSubtitle: {
    color: "#D4DCEA",
    fontSize: 14,
    lineHeight: 20,
  },
  chartSwitchButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#1B7E84",
    alignItems: "center",
    justifyContent: "center",
  },
  chartLegend: {
    flexDirection: "row",
    gap: 16,
    flexWrap: "wrap",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    color: "#D4DCEA",
    fontSize: 13,
    fontWeight: "600",
  },
  singleChartRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 10,
    height: 220,
  },
  singleChartColumn: {
    flex: 1,
    alignItems: "center",
    gap: 8,
  },
  barValueText: {
    color: "#F8FAFC",
    fontSize: 11,
    fontWeight: "800",
  },
  singleChartTrack: {
    width: "100%",
    height: 160,
    borderRadius: 16,
    backgroundColor: "#0E162A",
    overflow: "hidden",
    justifyContent: "flex-end",
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
  singleChartBar: {
    width: "100%",
    borderRadius: 999,
    minHeight: 0,
  },
  chartAxisLabel: {
    color: "#94A3B8",
    fontSize: 12,
    fontWeight: "700",
  },
  groupedChartWrap: {
    gap: 14,
  },
  groupedChartRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 10,
    height: 220,
  },
  groupedChartColumn: {
    flex: 1,
    alignItems: "center",
    gap: 8,
  },
  groupedBars: {
    height: 160,
    width: "100%",
    borderRadius: 16,
    backgroundColor: "#0E162A",
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
  groupedBar: {
    width: 16,
    borderRadius: 999,
  },
  emptyChartText: {
    color: "#94A3B8",
    fontSize: 14,
    lineHeight: 20,
  },
});
