import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, Image, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AppHeader from "../../components/AppHeader";
import BonusStatusBadge from "../../components/BonusStatusBadge";
import { useUser } from "../../src/context/UserContext";
import { api } from "../../src/services/api";
import { useTheme } from "../../src/context/ThemeContext";

type HomeTask = {
  id: number;
  title: string;
  xp: number;
  rewardPoints: number;
  type: string;
  startDate: string;
  endDate: string;
  completionRequested: boolean;
};

type HomeData = {
  todaysTasks: HomeTask[];
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
  rewardShop: { id: number }[];
  myRewards: { id: number }[];
  wishlist: { id: number }[] | string[];
  notifications: {
    id: number;
    type: string;
    title: string;
    message: string;
  }[];
};

const formatRange = (startDate: string, endDate: string) => `${startDate} - ${endDate}`;

const homeShortcuts = [
  {
    key: "all-tasks",
    title: "Check All Tasks",
    subtitle: "Open the full tasks page and review everything assigned to you.",
    route: "/(child)/tasks",
  },
  {
    key: "rewards",
    title: "Buy&Claim Rewards",
    subtitle: "Go to the rewards page to shop, check your rewards, and open wishlist.",
    route: "/(child)/rewards",
  },
];

export default function ChildHome() {
  const theme = useTheme();
  const router = useRouter();
  const { refreshUser } = useUser();
  const [data, setData] = useState<HomeData>({
    todaysTasks: [],
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
    rewardShop: [],
    myRewards: [],
    wishlist: [],
    notifications: [],
  });
  const [refreshing, setRefreshing] = useState(false);
  const [pendingTaskIds, setPendingTaskIds] = useState<number[]>([]);
  const lastShownNotificationIds = useRef<number[]>([]);

  const loadHome = useCallback(async () => {
    const response = await api.get("/child/home");
    setData(response.data.data);
    await refreshUser();
  }, [refreshUser]);

  useFocusEffect(
    useCallback(() => {
      loadHome();
    }, [loadHome])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);

    try {
      await loadHome();
    } finally {
      setRefreshing(false);
    }
  }, [loadHome]);

  const claimBonus = useCallback(async () => {
    try {
      await api.post("/child/bonus/claim");
      await loadHome();
    } catch (error: any) {
      Alert.alert("Claim failed", error?.response?.data?.message ?? "The daily bonus could not be claimed.");
    }
  }, [loadHome]);

  const toggleTask = useCallback(
    async (task: HomeTask) => {
      setPendingTaskIds((current) => [...current, task.id]);

      try {
        const response = await api.patch(`/child/tasks/${task.id}/validation-request`, {
          completionRequested: !task.completionRequested,
        });

        const updatedTask = response.data.data as HomeTask;

        setData((current) => ({
          ...current,
          todaysTasks: current.todaysTasks.map((item) =>
            item.id === updatedTask.id ? updatedTask : item
          ),
        }));
      } catch (error) {
        console.log("Failed to update task validation request", error);
      } finally {
        setPendingTaskIds((current) => current.filter((id) => id !== task.id));
      }
    },
    []
  );

  useEffect(() => {
    const unseenNotifications = data.notifications.filter(
      (notification) => !lastShownNotificationIds.current.includes(notification.id)
    );

    if (unseenNotifications.length === 0) {
      return;
    }

    lastShownNotificationIds.current = [
      ...lastShownNotificationIds.current,
      ...unseenNotifications.map((notification) => notification.id),
    ];

    unseenNotifications.forEach((notification) => {
      Alert.alert(notification.title, notification.message);
    });
  }, [data.notifications]);

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
          <Text style={[s.pageTitle, { color: theme.colors.text }]}>Home</Text>
          <Text style={[s.pageSubtitle, { color: theme.colors.textMuted }]}>
            Check today&apos;s missions and jump straight to the reward section you need.
          </Text>
        </View>

        <View
          style={[
            s.sectionCard,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <View style={s.todayHeaderRow}>
            <Text style={[s.sectionTitle, { color: theme.colors.text }]}>Today&apos;s Tasks</Text>
            <BonusStatusBadge bonus={data.dailyBonus} onClaim={claimBonus} />
          </View>

          {data.todaysTasks.length === 0 ? (
            <Text style={[s.emptyText, { color: theme.colors.textMuted }]}>
              No tasks for today just yet.
            </Text>
          ) : (
            data.todaysTasks.map((task) => {
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

        {homeShortcuts.map((shortcut) => (
          <Pressable
            key={shortcut.key}
            onPress={() => router.push(shortcut.route as never)}
            style={[
              s.shortcutCard,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <View style={s.shortcutTextWrap}>
              <Text style={[s.sectionTitle, { color: theme.colors.text }]}>{shortcut.title}</Text>
              <Text style={[s.shortcutSubtitle, { color: theme.colors.textMuted }]}>
                {shortcut.subtitle}
              </Text>
            </View>

            <Text style={[s.shortcutOpenText, { color: theme.colors.primary }]}>Open</Text>
          </Pressable>
        ))}
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
  sectionTitle: {
    fontSize: 22,
    fontWeight: "800",
  },
  todayHeaderRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
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
  shortcutCard: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
  },
  shortcutTextWrap: {
    flex: 1,
    gap: 6,
  },
  shortcutSubtitle: {
    fontSize: 15,
    lineHeight: 22,
  },
  shortcutOpenText: {
    fontSize: 14,
    fontWeight: "800",
  },
});
