import { useCallback, useMemo, useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { getRewardImage } from "../../../../constants/rewardImages";
import { api } from "../../../../src/services/api";
import { useTheme } from "../../../../src/context/ThemeContext";

type Mode = "tasks" | "rewards";

type AssignedTask = {
  id: number;
  title: string;
  xp: number;
  rewardPoints: number;
  type: string;
  startDate: string;
  endDate: string;
};

type AssignedReward = {
  id: number;
  title: string;
  price: number;
  type: string;
  startDate: string;
  endDate: string;
};

type GroupKey = "Today" | "This Week" | "Next Week" | "This Month" | "Later";

const order: GroupKey[] = ["Today", "This Week", "Next Week", "This Month", "Later"];

const startOfWeek = (date: Date) => {
  const next = new Date(date);
  const day = (next.getDay() + 6) % 7;
  next.setDate(next.getDate() - day);
  next.setHours(0, 0, 0, 0);
  return next;
};

const endOfWeek = (date: Date) => {
  const next = startOfWeek(date);
  next.setDate(next.getDate() + 6);
  next.setHours(23, 59, 59, 999);
  return next;
};

const parseDate = (value: string) => new Date(`${value}T00:00:00`);

const isTodayActive = (startDate: string, endDate: string, today: Date) => {
  const start = parseDate(startDate).getTime();
  const end = parseDate(endDate).getTime();
  const now = new Date(today);
  now.setHours(0, 0, 0, 0);
  const current = now.getTime();
  return current >= start && current <= end;
};

const getGroupKey = (startDate: string, endDate: string, today: Date): GroupKey => {
  if (isTodayActive(startDate, endDate, today)) {
    return "Today";
  }

  const start = parseDate(startDate);
  const thisWeekStart = startOfWeek(today);
  const thisWeekEnd = endOfWeek(today);
  const nextWeekStart = new Date(thisWeekStart);
  nextWeekStart.setDate(nextWeekStart.getDate() + 7);
  const nextWeekEnd = new Date(thisWeekEnd);
  nextWeekEnd.setDate(nextWeekEnd.getDate() + 7);

  if (start >= thisWeekStart && start <= thisWeekEnd) {
    return "This Week";
  }

  if (start >= nextWeekStart && start <= nextWeekEnd) {
    return "Next Week";
  }

  if (
    start.getFullYear() === today.getFullYear() &&
    start.getMonth() === today.getMonth()
  ) {
    return "This Month";
  }

  return "Later";
};

const formatRange = (startDate: string, endDate: string) => `${startDate} - ${endDate}`;

export default function ChildItemsScreen() {
  const { childId, childName, mode } = useLocalSearchParams<{
    childId: string;
    childName?: string;
    mode: Mode;
  }>();
  const router = useRouter();
  const theme = useTheme();
  const [tasks, setTasks] = useState<AssignedTask[]>([]);
  const [rewards, setRewards] = useState<AssignedReward[]>([]);

  const currentMode: Mode = mode === "rewards" ? "rewards" : "tasks";

  const loadData = useCallback(async () => {
    if (currentMode === "tasks") {
      const response = await api.get(`/parent/distribution/children/${childId}/tasks`);
      setTasks(response.data.data);
      return;
    }

    const response = await api.get(`/parent/distribution/children/${childId}/rewards`);
    setRewards(response.data.data);
  }, [childId, currentMode]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const groupedData = useMemo(() => {
    const today = new Date();
    const groups = new Map<GroupKey, (AssignedTask | AssignedReward)[]>();
    order.forEach((key) => groups.set(key, []));

    const source = currentMode === "tasks" ? tasks : rewards;
    source.forEach((item) => {
      const key = getGroupKey(item.startDate, item.endDate, today);
      groups.set(key, [...(groups.get(key) ?? []), item]);
    });

    return groups;
  }, [currentMode, rewards, tasks]);

  const title = currentMode === "tasks" ? "Assigned Tasks" : "Available Rewards";
  const subtitle =
    currentMode === "tasks"
      ? "All task assignments grouped by their current time window."
      : "All reward activations grouped by their current time window.";

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
          <Text style={[s.topBarTitle, { color: theme.colors.text }]}>{title}</Text>
          <Text style={{ color: theme.colors.textMuted }}>{childName ?? "Child"}</Text>
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
          <Text style={[s.heroTitle, { color: theme.colors.text }]}>{title}</Text>
          <Text style={{ color: theme.colors.textMuted }}>{subtitle}</Text>
        </View>

        {order.map((groupKey) => {
          const items = groupedData.get(groupKey) ?? [];

          if (items.length === 0) {
            return null;
          }

          return (
            <View
              key={groupKey}
              style={[
                s.sectionCard,
                {
                  backgroundColor: theme.colors.primary,
                  borderColor: theme.colors.border,
                },
              ]}
            >
              <View style={s.sectionHeader}>
                <Text style={[s.sectionTitle, { color: theme.colors.text }]}>{groupKey}</Text>
                <View style={[s.countBadge, { backgroundColor: theme.colors.tabIconActive }]}>
                  <Text style={s.countBadgeText}>{items.length}</Text>
                </View>
              </View>

              {items.map((item) =>
                currentMode === "tasks" ? (
                  <View
                    key={`task-${item.id}`}
                    style={[s.itemCard, { backgroundColor: theme.colors.surfaceAlt }]}
                  >
                    <Text style={[s.itemTitle, { color: theme.colors.text }]}>{item.title}</Text>

                    <View style={s.infoRow}>
                      <View style={[s.typeBadge, { backgroundColor: theme.colors.primary }]}>
                        <Text style={[s.typeBadgeText, { color: theme.colors.textMuted }]}>
                          {item.type || "-"}
                        </Text>
                      </View>

                      <View style={s.metricGroup}>
                        <View style={s.metricItem}>
                          <Text style={[s.metricValue, { color: theme.colors.text }]}>
                            {(item as AssignedTask).xp}
                          </Text>
                          <Image
                            source={require("../../../../assets/icons/xp.png")}
                            style={s.metricIcon}
                          />
                        </View>

                        <View style={s.metricItem}>
                          <Text style={[s.metricValue, { color: theme.colors.text }]}>
                            {(item as AssignedTask).rewardPoints}
                          </Text>
                          <Image
                            source={require("../../../../assets/icons/reward_points.png")}
                            style={s.metricIcon}
                          />
                        </View>
                      </View>
                    </View>

                    <Text style={[s.dateText, { color: theme.colors.textMuted }]}>
                      {formatRange(item.startDate, item.endDate)}
                    </Text>
                  </View>
                ) : (
                  <View
                    key={`reward-${item.id}`}
                    style={[s.rewardCard, { backgroundColor: theme.colors.surfaceAlt }]}
                  >
                    <Image
                      source={getRewardImage((item as AssignedReward).type)}
                      style={s.rewardImage}
                    />

                    <View style={s.rewardTextWrap}>
                      <Text style={[s.itemTitle, { color: theme.colors.text }]}>{item.title}</Text>

                      <View style={s.infoRow}>
                        <View style={[s.typeBadge, { backgroundColor: theme.colors.primary }]}>
                          <Text style={[s.typeBadgeText, { color: theme.colors.textMuted }]}>
                            {item.type || "-"}
                          </Text>
                        </View>

                        <View style={s.metricItem}>
                          <Text style={[s.metricValue, { color: theme.colors.text }]}>
                            {(item as AssignedReward).price}
                          </Text>
                          <Image
                            source={require("../../../../assets/icons/reward_points.png")}
                            style={s.metricIcon}
                          />
                        </View>
                      </View>

                      <Text style={[s.dateText, { color: theme.colors.textMuted }]}>
                        {formatRange(item.startDate, item.endDate)}
                      </Text>
                    </View>
                  </View>
                )
              )}
            </View>
          );
        })}
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
    gap: 8,
    borderWidth: 1,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: "800",
  },
  sectionCard: {
    borderRadius: 18,
    padding: 16,
    gap: 12,
    borderWidth: 1,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
  },
  countBadge: {
    minWidth: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  countBadgeText: {
    color: "#FFFFFF",
    fontWeight: "800",
  },
  itemCard: {
    borderRadius: 14,
    padding: 14,
    gap: 8,
  },
  rewardCard: {
    borderRadius: 14,
    padding: 14,
    gap: 12,
    flexDirection: "row",
  },
  rewardImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
    resizeMode: "cover",
  },
  rewardTextWrap: {
    flex: 1,
    gap: 8,
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
  dateText: {
    fontSize: 13,
    fontWeight: "600",
  },
});
