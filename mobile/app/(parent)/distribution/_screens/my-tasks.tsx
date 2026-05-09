import { useCallback, useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../../src/context/ThemeContext";
import { api } from "../../../../src/services/api";
import { TaskItem } from "../../../../constants/parentCatalogue";

type FormErrors = {
  title?: string;
  xp?: string;
  rewardPoints?: string;
  type?: string;
};

const INTEGER_ERROR = "This area must contain an integer number";

const isNaturalNumber = (value: string) => /^(0|[1-9]\d*)$/.test(value.trim());

export default function DistributionMyTasksScreen() {
  const router = useRouter();
  const theme = useTheme();
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [title, setTitle] = useState("");
  const [xp, setXp] = useState("");
  const [rewardPoints, setRewardPoints] = useState("");
  const [type, setType] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const visibleTasks = editingId ? tasks.filter((task) => task.id !== editingId) : tasks;

  const loadTasks = useCallback(async () => {
    const res = await api.get("/parent/catalog/tasks");
    setTasks(res.data.data);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadTasks();
    }, [loadTasks])
  );

  const resetForm = () => {
    setTitle("");
    setXp("");
    setRewardPoints("");
    setType("");
    setEditingId(null);
    setIsFormVisible(false);
    setErrors({});
  };

  const validateForm = () => {
    const nextErrors: FormErrors = {};

    if (!title.trim()) {
      nextErrors.title = "This field is required.";
    }

    if (!type.trim()) {
      nextErrors.type = "This field is required.";
    }

    if (!isNaturalNumber(xp)) {
      nextErrors.xp = INTEGER_ERROR;
    }

    if (!isNaturalNumber(rewardPoints)) {
      nextErrors.rewardPoints = INTEGER_ERROR;
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleCreate = () => {
    setTitle("");
    setXp("");
    setRewardPoints("");
    setType("");
    setEditingId(null);
    setErrors({});
    setIsFormVisible(true);
  };

  const handleEdit = (task: TaskItem) => {
    setTitle(task.title);
    setXp(String(task.xp));
    setRewardPoints(String(task.rewardPoints));
    setType(task.type ?? "");
    setEditingId(task.id);
    setErrors({});
    setIsFormVisible(true);
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    const payload = {
      title: title.trim(),
      xp: Number(xp),
      rewardPoints: Number(rewardPoints),
      type: type.trim(),
    };

    if (editingId) {
      await api.put(`/parent/catalog/tasks/${editingId}`, payload);
    } else {
      await api.post("/parent/catalog/tasks", payload);
    }

    await loadTasks();
    resetForm();
  };

  const handleDelete = (task: TaskItem) => {
    Alert.alert(
      "Delete task",
      `Delete "${task.title}" from My Tasks?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await api.delete(`/parent/catalog/tasks/${task.id}`);
            await loadTasks();
            if (editingId === task.id) {
              resetForm();
            }
          },
        },
      ]
    );
  };

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

        <Text style={[s.topBarTitle, { color: theme.colors.text }]}>My Tasks</Text>
      </View>

      <ScrollView contentContainerStyle={s.content}>
        <Pressable
          style={[s.newButton, { backgroundColor: theme.colors.tabIconActive }]}
          onPress={handleCreate}
        >
          <Text style={s.newButtonText}>New Custom Task</Text>
        </Pressable>

        {isFormVisible && (
          <View
            style={[
              s.formCard,
              {
                backgroundColor: theme.colors.primary,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <Text style={[s.formTitle, { color: theme.colors.text }]}>
              {editingId ? "Edit Custom Task" : "Create Custom Task"}
            </Text>

            <View>
              <TextInput
                placeholder="Task title"
                placeholderTextColor={errors.title ? theme.colors.error : theme.colors.textMuted}
                value={title}
                onChangeText={(value) => {
                  setTitle(value);
                  setErrors((current) => ({ ...current, title: undefined }));
                }}
                style={[
                  s.input,
                  {
                    color: theme.colors.text,
                    borderColor: errors.title ? theme.colors.error : theme.colors.border,
                  },
                ]}
              />
              {errors.title ? (
                <Text style={[s.errorText, { color: theme.colors.error }]}>{errors.title}</Text>
              ) : null}
            </View>

            <View>
              <TextInput
                placeholder={errors.xp && !xp ? INTEGER_ERROR : "XP"}
                placeholderTextColor={errors.xp ? theme.colors.error : theme.colors.textMuted}
                value={xp}
                onChangeText={(value) => {
                  setXp(value);
                  setErrors((current) => ({ ...current, xp: undefined }));
                }}
                keyboardType="number-pad"
                style={[
                  s.input,
                  {
                    color: theme.colors.text,
                    borderColor: errors.xp ? theme.colors.error : theme.colors.border,
                  },
                ]}
              />
              {errors.xp && xp ? (
                <Text style={[s.errorText, { color: theme.colors.error }]}>{errors.xp}</Text>
              ) : null}
            </View>

            <View>
              <TextInput
                placeholder={
                  errors.rewardPoints && !rewardPoints ? INTEGER_ERROR : "Reward Points"
                }
                placeholderTextColor={
                  errors.rewardPoints ? theme.colors.error : theme.colors.textMuted
                }
                value={rewardPoints}
                onChangeText={(value) => {
                  setRewardPoints(value);
                  setErrors((current) => ({ ...current, rewardPoints: undefined }));
                }}
                keyboardType="number-pad"
                style={[
                  s.input,
                  {
                    color: theme.colors.text,
                    borderColor: errors.rewardPoints
                      ? theme.colors.error
                      : theme.colors.border,
                  },
                ]}
              />
              {errors.rewardPoints && rewardPoints ? (
                <Text style={[s.errorText, { color: theme.colors.error }]}>
                  {errors.rewardPoints}
                </Text>
              ) : null}
            </View>

            <View>
              <TextInput
                placeholder="Type"
                placeholderTextColor={errors.type ? theme.colors.error : theme.colors.textMuted}
                value={type}
                onChangeText={(value) => {
                  setType(value);
                  setErrors((current) => ({ ...current, type: undefined }));
                }}
                style={[
                  s.input,
                  {
                    color: theme.colors.text,
                    borderColor: errors.type ? theme.colors.error : theme.colors.border,
                  },
                ]}
              />
              {errors.type ? (
                <Text style={[s.errorText, { color: theme.colors.error }]}>{errors.type}</Text>
              ) : null}
            </View>

            <View style={s.formActions}>
              <Pressable
                style={[s.actionButton, { backgroundColor: theme.colors.tabIconActive }]}
                onPress={handleSave}
              >
                <Text style={s.actionButtonText}>Save</Text>
              </Pressable>
              <Pressable
                style={[s.actionButton, { backgroundColor: theme.colors.accent }]}
                onPress={resetForm}
              >
                <Text style={s.actionButtonText}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        )}

        {visibleTasks.length === 0 ? (
          <View
            style={[
              s.emptyCard,
              {
                backgroundColor: theme.colors.primary,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <Text style={{ color: theme.colors.textMuted }}>
              No custom tasks yet. Create your first one from the button above.
            </Text>
          </View>
        ) : (
          visibleTasks.map((task) => (
            <View
              key={task.id}
              style={[
                s.itemCard,
                {
                  backgroundColor: theme.colors.primary,
                  borderColor: theme.colors.border,
                },
              ]}
            >
              <View style={s.iconActions}>
                <Pressable onPress={() => handleEdit(task)} style={s.iconButton} hitSlop={8}>
                  <Image
                    source={require("../../../../assets/button_icons/edit.png")}
                    style={s.iconImage}
                  />
                </Pressable>
                <Pressable onPress={() => handleDelete(task)} style={s.iconButton} hitSlop={8}>
                  <Image
                    source={require("../../../../assets/button_icons/delete.png")}
                    style={s.iconImage}
                  />
                </Pressable>
              </View>

              <Text style={[s.itemTitle, { color: theme.colors.text }]}>{task.title}</Text>

              <View style={s.infoRow}>
                <View style={[s.typeBadge, { backgroundColor: theme.colors.surfaceAlt }]}>
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
  topBarTitle: {
    flex: 1,
    fontSize: 24,
    fontWeight: "800",
  },
  content: {
    padding: 20,
    paddingBottom: 32,
    gap: 14,
  },
  newButton: {
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  newButtonText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 16,
  },
  formCard: {
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    gap: 10,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 4,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  errorText: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: "600",
  },
  formActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 6,
  },
  actionButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  emptyCard: {
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
  },
  itemCard: {
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    gap: 6,
    position: "relative",
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: "800",
    paddingRight: 72,
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
    gap: 14,
    alignItems: "center",
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
  iconActions: {
    position: "absolute",
    top: 12,
    right: 12,
    flexDirection: "row",
    gap: 8,
    zIndex: 5,
    elevation: 5,
  },
  iconButton: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 6,
  },
  iconImage: {
    width: 22,
    height: 22,
    resizeMode: "contain",
  },
});
