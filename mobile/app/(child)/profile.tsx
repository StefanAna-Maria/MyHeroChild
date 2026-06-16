import { useCallback, useState } from "react";
import {
  ImageBackground,
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

type ActivityPoint = {
  label: string;
  approvedTasks: number;
  grantedRewards: number;
};

type ChildProfileData = {
  activeTasksCount: number;
  availableRewardsCount: number;
  completedTasksCount: number;
  purchasedRewardsCount: number;
  grantedRewardsCount: number;
  weeklyActivity: ActivityPoint[];
};

const initialData: ChildProfileData = {
  activeTasksCount: 0,
  availableRewardsCount: 0,
  completedTasksCount: 0,
  purchasedRewardsCount: 0,
  grantedRewardsCount: 0,
  weeklyActivity: [],
};

export default function ChildProfile() {
  const theme = useTheme();
  const [data, setData] = useState<ChildProfileData>(initialData);
  const [refreshing, setRefreshing] = useState(false);

  const loadProfile = useCallback(async () => {
    const response = await api.get("/child/profile");
    setData(response.data.data ?? initialData);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [loadProfile])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadProfile();
    } finally {
      setRefreshing(false);
    }
  }, [loadProfile]);

  const maxBarValue = Math.max(
    1,
    ...(data.weeklyActivity.flatMap((point) => [point.approvedTasks, point.grantedRewards]))
  );

  return (
    <View style={[s.screen, { backgroundColor: theme.colors.background }]}>
      <AppHeader />

      <CurvedScreenBody>
        <ScrollView
          contentContainerStyle={s.content}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />
          }
        >
          <ImageBackground
            source={require("../../assets/backgrounds/nextWeekTasks.png")}
            resizeMode="cover"
            imageStyle={s.cardBackgroundImage}
            style={[s.sectionCard, { borderColor: theme.colors.border }]}
          >
            <View style={s.cardOverlay}>
              <Text style={[s.sectionTitle, { color: theme.colors.text }]}>Current Snapshot</Text>

              <View style={s.snapshotTopRow}>
                <View style={[s.snapshotLargeCard, { backgroundColor: "#E8F5E9" }]}>
                  <Text style={[s.snapshotLargeValue, { color: theme.colors.text }]}>{data.activeTasksCount}</Text>
                  <Text style={[s.snapshotLargeLabel, { color: theme.colors.textMuted }]}>Active Tasks</Text>
                </View>

                <View style={[s.snapshotLargeCard, { backgroundColor: "#E3F2FD" }]}>
                  <Text style={[s.snapshotLargeValue, { color: theme.colors.text }]}>{data.availableRewardsCount}</Text>
                  <Text style={[s.snapshotLargeLabel, { color: theme.colors.textMuted }]}>Available Rewards</Text>
                </View>
              </View>

              <View style={s.snapshotBottomRow}>
                <View style={[s.snapshotSmallCard, { backgroundColor: "#FFF3E0" }]}>
                  <Text style={[s.snapshotSmallValue, { color: theme.colors.text }]}>{data.completedTasksCount}</Text>
                  <Text style={[s.snapshotSmallLabel, { color: theme.colors.textMuted }]}>Tasks Done</Text>
                </View>

                <View style={[s.snapshotSmallCard, { backgroundColor: "#F3E5F5" }]}>
                  <Text style={[s.snapshotSmallValue, { color: theme.colors.text }]}>{data.purchasedRewardsCount}</Text>
                  <Text style={[s.snapshotSmallLabel, { color: theme.colors.textMuted }]}>Bought</Text>
                </View>

                <View style={[s.snapshotSmallCard, { backgroundColor: "#FFF8E1" }]}>
                  <Text style={[s.snapshotSmallValue, { color: theme.colors.text }]}>{data.grantedRewardsCount}</Text>
                  <Text style={[s.snapshotSmallLabel, { color: theme.colors.textMuted }]}>Granted</Text>
                </View>
              </View>
            </View>
          </ImageBackground>

          <ImageBackground
            source={require("../../assets/backgrounds/thisWeekTasks.png")}
            resizeMode="cover"
            imageStyle={s.cardBackgroundImage}
            style={[s.sectionCard, { borderColor: theme.colors.border }]}
          >
            <View style={s.weeklyCardOverlay}>
              <Text style={[s.sectionTitle, { color: theme.colors.text }]}>Weekly Activity</Text>
              <Text style={[s.sectionSubtitle, { color: theme.colors.textMuted }]}>
                Approved tasks and granted rewards in the last 7 days.
              </Text>

              <View style={s.legendRow}>
                <View style={s.legendItem}>
                  <View style={[s.legendDot, { backgroundColor: "#8B7CF6" }]} />
                  <Text style={[s.legendText, { color: theme.colors.textMuted }]}>Approved Tasks</Text>
                </View>

                <View style={s.legendItem}>
                  <View style={[s.legendDot, { backgroundColor: "#7CCB9A" }]} />
                  <Text style={[s.legendText, { color: theme.colors.textMuted }]}>Granted Rewards</Text>
                </View>
              </View>

              <View style={s.chartRow}>
                {data.weeklyActivity.map((point) => (
                  <View key={point.label} style={s.chartColumn}>
                    <View style={s.chartBarsWrap}>
                      <View
                        style={[
                          s.chartBar,
                          {
                            backgroundColor: "#8B7CF6",
                            height: `${(point.approvedTasks / maxBarValue) * 100}%`,
                          },
                        ]}
                      />
                      <View
                        style={[
                          s.chartBar,
                          {
                            backgroundColor: "#7CCB9A",
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
          </ImageBackground>
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
    paddingBottom: 104,
    gap: 16,
  },
  sectionCard: {
    borderRadius: 24,
    borderWidth: 1,
    overflow: "hidden",
  },
  cardBackgroundImage: {
    borderRadius: 24,
  },
  cardOverlay: {
    padding: 16,
    gap: 16,
    backgroundColor: "rgba(255,255,255,0.70)",
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "900",
  },
  sectionSubtitle: {
    fontSize: 15,
    lineHeight: 22,
    marginTop: -8,
  },
  weeklyCardOverlay: {
    paddingTop: 16,
    paddingRight: 16,
    paddingBottom: 10,
    paddingLeft: 16,
    gap: 16,
    backgroundColor: "rgba(255,255,255,0.70)",
  },
  snapshotTopRow: {
    flexDirection: "row",
    gap: 12,
  },
  snapshotLargeCard: {
    flex: 1,
    minHeight: 118,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
    gap: 8,
  },
  snapshotLargeValue: {
    fontSize: 36,
    fontWeight: "900",
  },
  snapshotLargeLabel: {
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
  },
  snapshotBottomRow: {
    flexDirection: "row",
    gap: 12,
  },
  snapshotSmallCard: {
    flex: 1,
    minHeight: 92,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
    gap: 6,
  },
  snapshotSmallValue: {
    fontSize: 30,
    fontWeight: "900",
  },
  snapshotSmallLabel: {
    fontSize: 13,
    fontWeight: "700",
    textAlign: "center",
  },
  legendRow: {
    flexDirection: "row",
    gap: 18,
    flexWrap: "wrap",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
  },
  legendText: {
    fontSize: 14,
    fontWeight: "600",
  },
  chartRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 8,
    height: 178,
  },
  chartColumn: {
    flex: 1,
    alignItems: "center",
    gap: 8,
  },
  chartBarsWrap: {
    width: "100%",
    height: 150,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
    gap: 6,
  },
  chartBar: {
    width: 14,
    minHeight: 6,
    borderRadius: 999,
  },
  chartLabel: {
    fontSize: 12,
    fontWeight: "700",
  },
});
