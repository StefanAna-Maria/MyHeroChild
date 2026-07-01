import { useCallback, useState } from "react";
import { Image, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { avatars, AvatarType } from "../../constants/avatars";
import AppHeader from "../../components/AppHeader";
import CurvedScreenBody from "../../components/CurvedScreenBody";
import { api } from "../../src/services/api";
import { useTheme } from "../../src/context/ThemeContext";

type EvaluationTask = {
  id: number;
  title: string;
};

type EvaluationChild = {
  id: number;
  username: string;
  avatar: AvatarType;
  tasks: EvaluationTask[];
};

export default function Evaluation() {
  const theme = useTheme();
  const [children, setChildren] = useState<EvaluationChild[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [pendingTaskIds, setPendingTaskIds] = useState<number[]>([]);

  const loadTasks = useCallback(async () => {
    const response = await api.get("/parent/evaluation/tasks");
    setChildren(response.data.data);
  }, []);

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

  const removeTaskFromList = useCallback((taskId: number) => {
    setChildren((current) =>
      current
        .map((child) => ({
          ...child,
          tasks: child.tasks.filter((task) => task.id !== taskId),
        }))
        .filter((child) => child.tasks.length > 0)
    );
  }, []);

  const evaluateTask = useCallback(
    async (taskId: number, action: "approve" | "reject") => {
      setPendingTaskIds((current) => [...current, taskId]);

      try {
        await api.post(`/parent/evaluation/tasks/${taskId}/${action}`);
        removeTaskFromList(taskId);
      } catch (error) {
        console.log(`Failed to ${action} task`, error);
      } finally {
        setPendingTaskIds((current) => current.filter((id) => id !== taskId));
      }
    },
    [removeTaskFromList]
  );

  return (
    <View style={[s.screen, { backgroundColor: theme.colors.background }]}>
      <AppHeader />

      <CurvedScreenBody>
        <ScrollView
          contentContainerStyle={s.content}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.tabIconActive} />
          }
        >
        <View style={s.header}>
          <Text style={[s.title, { color: theme.colors.text }]}>Evaluate</Text>
          <Text style={[s.subtitle, { color: theme.colors.textMuted }]}>
            Review the tasks that your children claimed to have completed.
          </Text>
        </View>

        {children.length === 0 ? (
          <View
            style={[
              s.emptyCard,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <Text style={[s.emptyTitle, { color: theme.colors.text }]}>Nothing to review</Text>
            <Text style={[s.emptyText, { color: theme.colors.textMuted }]}>
              Completed tasks waiting for approval will appear here.
            </Text>
          </View>
        ) : (
          children.map((child) => (
            <View
              key={child.id}
              style={[
                s.childCard,
                {
                  backgroundColor: theme.colors.primary,
                  borderColor: theme.colors.border,
                },
              ]}
            >
              <View style={s.childHeader}>
                <Image source={avatars[child.avatar]} style={s.avatar} />
                <View style={s.childTextWrap}>
                  <Text style={[s.childName, { color: theme.colors.text }]}>{child.username}</Text>
                  <Text style={[s.childCount, { color: theme.colors.textMuted }]}>
                    {child.tasks.length} task{child.tasks.length === 1 ? "" : "s"} waiting
                  </Text>
                </View>
              </View>

              <View style={s.taskList}>
                {child.tasks.map((task) => {
                  const isBusy = pendingTaskIds.includes(task.id);

                  return (
                    <View
                      key={task.id}
                      style={[s.taskCard, { backgroundColor: theme.colors.surfaceAlt }]}
                    >
                      <Text style={[s.taskTitle, { color: theme.colors.text }]}>{task.title}</Text>

                      <View style={s.actionsRow}>
                        <Pressable
                          disabled={isBusy}
                          onPress={() => evaluateTask(task.id, "approve")}
                          style={[s.actionButton, { backgroundColor: theme.colors.success }]}
                        >
                          <Ionicons name="checkmark" size={22} color="#FFFFFF" />
                        </Pressable>

                        <Pressable
                          disabled={isBusy}
                          onPress={() => evaluateTask(task.id, "reject")}
                          style={[s.actionButton, { backgroundColor: theme.colors.error }]}
                        >
                          <Ionicons name="close" size={22} color="#FFFFFF" />
                        </Pressable>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          ))
        )}
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
    gap: 16,
  },
  header: {
    gap: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 23,
  },
  emptyCard: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 20,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "800",
  },
  emptyText: {
    fontSize: 15,
    lineHeight: 22,
  },
  childCard: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 18,
    gap: 16,
  },
  childHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  childTextWrap: {
    flex: 1,
    gap: 2,
  },
  childName: {
    fontSize: 24,
    fontWeight: "800",
  },
  childCount: {
    fontSize: 14,
    fontWeight: "600",
  },
  taskList: {
    gap: 12,
  },
  taskCard: {
    borderRadius: 16,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  taskTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: "700",
    lineHeight: 24,
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  actionButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
});
