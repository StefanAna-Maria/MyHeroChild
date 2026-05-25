import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AppHeader from "../../components/AppHeader";
import BonusStatusBadge from "../../components/BonusStatusBadge";
import { api } from "../../src/services/api";
import { useUser } from "../../src/context/UserContext";
import { useTheme } from "../../src/context/ThemeContext";

type ChildTask = {
  id: number;
  title: string;
  xp: number;
  rewardPoints: number;
  type: string;
  startDate: string;
  endDate: string;
  completionRequested: boolean;
};

type TasksData = {
  tasks: ChildTask[];
  dailyBonus: {
    rewardPoints: number;
    totalTasks: number;
    approvedTasks: number;
    progress: number;
    claimable: boolean;
    claimed: boolean;
    restricted: boolean;
    restrictedUntil?: string | null;
  };
  notifications: {
    id: number;
    type: string;
    title: string;
    message: string;
  }[];
};

type GroupKey = "Today" | "This Week" | "Next Week" | "This Month" | "Later";

const order: GroupKey[] = ["Today", "This Week", "Next Week", "This Month", "Later"];

const parseDate = (value: string) => new Date(`${value}T00:00:00`);

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

const isTodayActive = (startDate: string, endDate: string, today: Date) => {
  const start = parseDate(startDate).getTime();
  const end = parseDate(endDate).getTime();
  const current = new Date(today);
  current.setHours(0, 0, 0, 0);
  const now = current.getTime();
  return now >= start && now <= end;
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

  if (start.getFullYear() === today.getFullYear() && start.getMonth() === today.getMonth()) {
    return "This Month";
  }

  return "Later";
};

const formatRange = (startDate: string, endDate: string) => `${startDate} - ${endDate}`;

export default function ChildTasksScreen() {
  const theme = useTheme();
  const { refreshUser } = useUser();
  const [data, setData] = useState<TasksData>({
    tasks: [],
    dailyBonus: {
      rewardPoints: 100,
      totalTasks: 0,
      approvedTasks: 0,
      progress: 0,
      claimable: false,
      claimed: false,
      restricted: false,
      restrictedUntil: null,
    },
    notifications: [],
  });
  const [refreshing, setRefreshing] = useState(false);
  const [pendingTaskIds, setPendingTaskIds] = useState<number[]>([]);
  const [shownNotificationIds, setShownNotificationIds] = useState<number[]>([]);

  const loadTasks = useCallback(async () => {
    const response = await api.get("/child/tasks");
    setData(response.data.data);
    await refreshUser();
  }, [refreshUser]);

  useFocusEffect(
    useCallback(() => {
      loadTasks();
    }, [loadTasks])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);

    try {
      await loadTasks();
    } finally {
      setRefreshing(false);
    }
  }, [loadTasks]);

  const toggleTask = useCallback(async (task: ChildTask) => {
    setPendingTaskIds((current) => [...current, task.id]);

    try {
      const response = await api.patch(`/child/tasks/${task.id}/validation-request`, {
        completionRequested: !task.completionRequested,
      });

      const updatedTask = response.data.data as ChildTask;
      setData((current) => ({
        ...current,
        tasks: current.tasks.map((item) => (item.id === updatedTask.id ? updatedTask : item)),
      }));
    } catch (error) {
      console.log("Failed to update task validation request", error);
      Alert.alert("Action failed", "The task status could not be updated.");
    } finally {
      setPendingTaskIds((current) => current.filter((id) => id !== task.id));
    }
  }, []);

  const claimBonus = useCallback(async () => {
    try {
      await api.post("/child/bonus/claim");
      await loadTasks();
    } catch (error: any) {
      Alert.alert("Claim failed", error?.response?.data?.message ?? "The daily bonus could not be claimed.");
    }
  }, [loadTasks]);

  const groupedTasks = useMemo(() => {
    const today = new Date();
    const groups = new Map<GroupKey, ChildTask[]>();
    order.forEach((key) => groups.set(key, []));

    data.tasks.forEach((task) => {
      const key = getGroupKey(task.startDate, task.endDate, today);
      groups.set(key, [...(groups.get(key) ?? []), task]);
    });

    return groups;
  }, [data.tasks]);

  useEffect(() => {
    const unseen = data.notifications.filter((notification) => !shownNotificationIds.includes(notification.id));
    if (unseen.length === 0) {
      return;
    }

    unseen.forEach((notification) => {
      Alert.alert(notification.title, notification.message);
    });

    setShownNotificationIds((current) => [...current, ...unseen.map((notification) => notification.id)]);
  }, [data.notifications, shownNotificationIds]);

  return (
    <View style={[s.screen, { backgroundColor: theme.colors.background }]}>
      <AppHeader />

      <ScrollView
        contentContainerStyle={s.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />
        }
      >
        <View style={s.sectionHeader}>
          <Text style={[s.pageTitle, { color: theme.colors.text }]}>Tasks</Text>
          <Text style={[s.pageSubtitle, { color: theme.colors.textMuted }]}>
            Review every task you received and mark it when you are ready for parent validation.
          </Text>
        </View>

        {order.map((groupKey) => {
          const items = groupedTasks.get(groupKey) ?? [];

          if (groupKey !== "Today" && items.length === 0) {
            return null;
          }

          return (
            <View
              key={groupKey}
              style={[
                s.sectionCard,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                },
              ]}
            >
              <View style={s.groupHeader}>
                <Text style={[s.sectionTitle, { color: theme.colors.text }]}>{groupKey}</Text>
                <View style={s.groupHeaderRight}>
                  {groupKey === "Today" ? (
                    <BonusStatusBadge bonus={data.dailyBonus} onClaim={claimBonus} compact />
                  ) : null}
                  {items.length > 0 ? (
                    <View style={[s.countBadge, { backgroundColor: theme.colors.primary }]}>
                      <Text style={s.countBadgeText}>{items.length}</Text>
                    </View>
                  ) : null}
                </View>
              </View>

              {items.length === 0 ? (
                <Text style={[s.emptyText, { color: theme.colors.textMuted }]}>
                  No tasks are active for today right now.
                </Text>
              ) : (
                items.map((task) => {
                  const isUpdating = pendingTaskIds.includes(task.id);
                  const isHighlighted = task.completionRequested;

                  return (
                    <View
                      key={task.id}
                      style={[
                        s.taskCard,
                        {
                          backgroundColor: isHighlighted
                            ? theme.colors.primaryLight
                            : theme.colors.surfaceAlt,
                          borderColor: isHighlighted ? theme.colors.primary : "transparent",
                        },
                      ]}
                    >
                      <View style={s.taskTopRow}>
                        <Pressable
                          onPress={() => toggleTask(task)}
                          disabled={isUpdating}
                          style={[
                            s.checkbox,
                            {
                              borderColor: isHighlighted
                                ? theme.colors.primary
                                : theme.colors.textMuted,
                              backgroundColor: isHighlighted
                                ? theme.colors.primary
                                : theme.colors.surface,
                            },
                          ]}
                        >
                          {isHighlighted ? (
                            <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                          ) : null}
                        </Pressable>

                        <View style={s.taskContent}>
                          <Text style={[s.taskTitle, { color: theme.colors.text }]}>{task.title}</Text>

                          <View style={s.taskMetaRow}>
                            <View style={[s.typeBadge, { backgroundColor: theme.colors.surface }]}>
                              <Text style={[s.typeBadgeText, { color: theme.colors.textMuted }]}>
                                {task.type || "Task"}
                              </Text>
                            </View>

                            <View style={s.metricGroup}>
                              <View style={s.metricItem}>
                                <Text style={[s.metricValue, { color: theme.colors.text }]}>
                                  {task.xp}
                                </Text>
                                <Image
                                  source={require("../../assets/icons/xp.png")}
                                  style={s.metricIcon}
                                />
                              </View>

                              <View style={s.metricItem}>
                                <Text style={[s.metricValue, { color: theme.colors.text }]}>
                                  {task.rewardPoints}
                                </Text>
                                <Image
                                  source={require("../../assets/icons/reward_points.png")}
                                  style={s.metricIcon}
                                />
                              </View>
                            </View>
                          </View>

                          <Text style={[s.dateText, { color: theme.colors.textMuted }]}>
                            {formatRange(task.startDate, task.endDate)}
                          </Text>

                          {task.completionRequested ? (
                            <View style={[s.statusPill, { backgroundColor: theme.colors.primary }]}>
                              <Text style={s.statusPillText}>Awaiting parent validation</Text>
                            </View>
                          ) : null}
                        </View>
                      </View>
                    </View>
                  );
                })
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
  content: {
    padding: 16,
    paddingBottom: 32,
    gap: 16,
  },
  sectionHeader: {
    gap: 8,
  },
  pageTitle: {
    fontSize: 32,
    fontWeight: "800",
  },
  pageSubtitle: {
    fontSize: 16,
    lineHeight: 23,
  },
  sectionCard: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 18,
    gap: 12,
  },
  groupHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "800",
  },
  groupHeaderRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  countBadge: {
    minWidth: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  countBadgeText: {
    color: "#FFFFFF",
    fontWeight: "800",
  },
  emptyText: {
    fontSize: 15,
    lineHeight: 22,
  },
  taskCard: {
    borderRadius: 18,
    padding: 14,
    borderWidth: 2,
    position: "relative",
  },
  taskTopRow: {
    flexDirection: "row",
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    top: 0,
    right: 0,
  },
  taskContent: {
    flex: 1,
    gap: 8,
    paddingRight: 48,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: "800",
  },
  taskMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    alignSelf: "flex-start",
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
    fontSize: 16,
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
  statusPill: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  statusPillText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },
});
