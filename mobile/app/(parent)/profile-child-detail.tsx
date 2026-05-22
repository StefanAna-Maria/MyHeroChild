import { useCallback, useState } from "react";
import {
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { avatars, AvatarType } from "../../constants/avatars";
import { api } from "../../src/services/api";
import { useTheme } from "../../src/context/ThemeContext";

type ActivityPoint = {
  label: string;
  approvedTasks: number;
  grantedRewards: number;
};

type ChildDetail = {
  id: number;
  username: string;
  avatar: AvatarType;
  level: number;
  activeTasksCount: number;
  availableRewardsCount: number;
  wishlistCount: number;
  completedTasksCount: number;
  purchasedRewardsCount: number;
  grantedRewardsCount: number;
  weeklyActivity: ActivityPoint[];
};

export default function ParentChildDetailScreen() {
  const theme = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ childId?: string }>();
  const childId = Number(params.childId);
  const [data, setData] = useState<ChildDetail | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadDetail = useCallback(async () => {
    if (!Number.isFinite(childId)) return;
    const response = await api.get(`/parent/profile/children/${childId}`);
    setData(response.data.data);
  }, [childId]);

  useFocusEffect(useCallback(() => { loadDetail(); }, [loadDetail]));

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadDetail();
    } finally {
      setRefreshing(false);
    }
  }, [loadDetail]);

  const maxBarValue = Math.max(
    1,
    ...(data?.weeklyActivity.flatMap((point) => [point.approvedTasks, point.grantedRewards]) ?? [1])
  );

  return (
    <View style={[s.screen, { backgroundColor: theme.colors.background }]}>
      <View style={[s.header, { backgroundColor: theme.colors.surface }]}>
        <Pressable onPress={() => router.back()} style={[s.backButton, { backgroundColor: theme.colors.surfaceAlt }]}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </Pressable>
        <View style={s.headerTextWrap}>
          <Text style={[s.headerTitle, { color: theme.colors.text }]}>Child Details</Text>
          <Text style={[s.headerSubtitle, { color: theme.colors.textMuted }]}>
            See activity, rewards and wishlist progress for this child.
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={s.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />}
      >
        {data ? (
          <>
            <View style={[s.heroCard, { backgroundColor: theme.colors.primary, borderColor: theme.colors.border }]}>
              <Image source={avatars[data.avatar] ?? avatars.robot} style={s.avatar} />
              <Text style={[s.childName, { color: theme.colors.text }]}>{data.username}</Text>
              <Text style={[s.levelText, { color: theme.colors.textMuted }]}>Level {data.level}</Text>

              <View style={s.metricsRow}>
                <View style={[s.metricPill, { backgroundColor: theme.colors.surfaceAlt }]}>
                  <Text style={[s.metricValue, { color: theme.colors.text }]}>{data.completedTasksCount}</Text>
                  <Text style={[s.metricLabel, { color: theme.colors.textMuted }]}>Tasks Done</Text>
                </View>
                <View style={[s.metricPill, { backgroundColor: theme.colors.surfaceAlt }]}>
                  <Text style={[s.metricValue, { color: theme.colors.text }]}>{data.purchasedRewardsCount}</Text>
                  <Text style={[s.metricLabel, { color: theme.colors.textMuted }]}>Bought</Text>
                </View>
                <View style={[s.metricPill, { backgroundColor: theme.colors.surfaceAlt }]}>
                  <Text style={[s.metricValue, { color: theme.colors.text }]}>{data.grantedRewardsCount}</Text>
                  <Text style={[s.metricLabel, { color: theme.colors.textMuted }]}>Granted</Text>
                </View>
              </View>

              <Pressable
                onPress={() =>
                  router.push({
                    pathname: "/(parent)/profile-child-wishlist",
                    params: {
                      childId: String(data.id),
                      childName: data.username,
                    },
                  })
                }
                style={[s.wishlistButton, { backgroundColor: theme.colors.tabIconActive }]}
              >
                <Text style={s.wishlistButtonText}>
                  {data.username}&apos;s Wishlist ({data.wishlistCount})
                </Text>
              </Pressable>
            </View>

            <View style={[s.sectionCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
              <Text style={[s.sectionTitle, { color: theme.colors.text }]}>Current Snapshot</Text>
              <View style={s.snapshotGrid}>
                <View style={[s.snapshotItem, { backgroundColor: theme.colors.surfaceAlt }]}>
                  <Text style={[s.snapshotValue, { color: theme.colors.text }]}>{data.activeTasksCount}</Text>
                  <Text style={[s.snapshotLabel, { color: theme.colors.textMuted }]}>Active Tasks</Text>
                </View>
                <View style={[s.snapshotItem, { backgroundColor: theme.colors.surfaceAlt }]}>
                  <Text style={[s.snapshotValue, { color: theme.colors.text }]}>{data.availableRewardsCount}</Text>
                  <Text style={[s.snapshotLabel, { color: theme.colors.textMuted }]}>Available Rewards</Text>
                </View>
              </View>
            </View>

            <View style={[s.sectionCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
              <Text style={[s.sectionTitle, { color: theme.colors.text }]}>Weekly Activity</Text>
              <Text style={[s.chartSubtitle, { color: theme.colors.textMuted }]}>
                Approved tasks and granted rewards in the last 7 days.
              </Text>
              <View style={s.chartLegend}>
                <View style={s.legendItem}>
                  <View style={[s.legendDot, { backgroundColor: theme.colors.tabIconActive }]} />
                  <Text style={{ color: theme.colors.textMuted }}>Approved Tasks</Text>
                </View>
                <View style={s.legendItem}>
                  <View style={[s.legendDot, { backgroundColor: theme.colors.accent }]} />
                  <Text style={{ color: theme.colors.textMuted }}>Granted Rewards</Text>
                </View>
              </View>
              <View style={s.chartRow}>
                {data.weeklyActivity.map((point) => (
                  <View key={point.label} style={s.chartColumn}>
                    <View style={s.chartBars}>
                      <View
                        style={[
                          s.chartBar,
                          {
                            backgroundColor: theme.colors.tabIconActive,
                            height: `${(point.approvedTasks / maxBarValue) * 100}%`,
                          },
                        ]}
                      />
                      <View
                        style={[
                          s.chartBar,
                          {
                            backgroundColor: theme.colors.accent,
                            height: `${(point.grantedRewards / maxBarValue) * 100}%`,
                          },
                        ]}
                      />
                    </View>
                    <Text style={[s.chartLabel, { color: theme.colors.textMuted }]}>{point.label}</Text>
                  </View>
                ))}
              </View>
            </View>
          </>
        ) : null}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1 },
  header: { paddingTop: 60, paddingHorizontal: 20, paddingBottom: 18, flexDirection: "row", alignItems: "center", gap: 16 },
  backButton: { width: 52, height: 52, borderRadius: 26, alignItems: "center", justifyContent: "center" },
  headerTextWrap: { flex: 1, gap: 4 },
  headerTitle: { fontSize: 24, fontWeight: "800" },
  headerSubtitle: { fontSize: 15, lineHeight: 21 },
  content: { padding: 16, paddingBottom: 32, gap: 16 },
  heroCard: { borderRadius: 24, borderWidth: 1, padding: 20, alignItems: "center", gap: 10 },
  avatar: { width: 92, height: 92, borderRadius: 46 },
  childName: { fontSize: 28, fontWeight: "800" },
  levelText: { fontSize: 16, fontWeight: "600" },
  metricsRow: { flexDirection: "row", gap: 10, width: "100%" },
  metricPill: { flex: 1, borderRadius: 18, paddingVertical: 14, paddingHorizontal: 10, alignItems: "center", gap: 4 },
  metricValue: { fontSize: 22, fontWeight: "800" },
  metricLabel: { fontSize: 12, fontWeight: "700", textAlign: "center" },
  wishlistButton: { width: "100%", borderRadius: 14, paddingVertical: 14, alignItems: "center", marginTop: 4 },
  wishlistButtonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "800" },
  sectionCard: { borderRadius: 22, borderWidth: 1, padding: 18, gap: 14 },
  sectionTitle: { fontSize: 22, fontWeight: "800" },
  snapshotGrid: { flexDirection: "row", gap: 12 },
  snapshotItem: { flex: 1, borderRadius: 18, padding: 16, gap: 6, alignItems: "center" },
  snapshotValue: { fontSize: 24, fontWeight: "800" },
  snapshotLabel: { fontSize: 13, fontWeight: "700" },
  chartSubtitle: { fontSize: 14, lineHeight: 20 },
  chartLegend: { flexDirection: "row", gap: 16 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  chartRow: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", height: 180, gap: 10 },
  chartColumn: { flex: 1, alignItems: "center", gap: 8 },
  chartBars: { height: 140, width: "100%", flexDirection: "row", alignItems: "flex-end", justifyContent: "center", gap: 6 },
  chartBar: { width: 16, minHeight: 6, borderRadius: 999 },
  chartLabel: { fontSize: 12, fontWeight: "700" },
});
