import { useCallback, useEffect, useState } from "react";
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
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { api } from "../../../../src/services/api";
import { getRewardImage } from "../../../../constants/rewardImages";
import { useTheme } from "../../../../src/context/ThemeContext";

type TaskItem = {
  id?: number;
  title: string;
  xp: number;
  rewardPoints: number;
  type: string;
};

type RewardItem = {
  id?: number;
  title: string;
  price: number;
  type: string;
};

type PackageDetail = {
  id: number;
  title: string;
  ageGroup: string;
  description: string;
  tasks: TaskItem[];
  rewards: RewardItem[];
};

const emptyTask = (): TaskItem => ({
  title: "",
  xp: 0,
  rewardPoints: 0,
  type: "",
});

const emptyReward = (): RewardItem => ({
  title: "",
  price: 0,
  type: "",
});

export default function PackageDetailScreen() {
  const { id, edit } = useLocalSearchParams<{ id: string; edit?: string }>();
  const router = useRouter();
  const theme = useTheme();

  const [pkg, setPkg] = useState<PackageDetail | null>(null);
  const [draftPkg, setDraftPkg] = useState<PackageDetail | null>(null);
  const [isEditingPackage, setIsEditingPackage] = useState(false);
  const [editingTaskIndex, setEditingTaskIndex] = useState<number | null>(null);
  const [editingRewardIndex, setEditingRewardIndex] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const fetchPackage = useCallback(async () => {
    const res = await api.get(`/packages/${id}`);
    const data = res.data.data as PackageDetail;
    setPkg(data);
    setDraftPkg(JSON.parse(JSON.stringify(data)));
  }, [id]);

  useEffect(() => {
    fetchPackage();
  }, [fetchPackage]);

  useEffect(() => {
    if (edit === "1" && pkg) {
      setDraftPkg(JSON.parse(JSON.stringify(pkg)));
      setIsEditingPackage(true);
      setEditingTaskIndex(null);
      setEditingRewardIndex(null);
    }
  }, [edit, pkg]);

  const updatePackageField = (
    field: "title" | "ageGroup" | "description",
    value: string
  ) => {
    setDraftPkg((current) => (current ? { ...current, [field]: value } : current));
  };

  const updateTask = (index: number, field: keyof TaskItem, value: string) => {
    setDraftPkg((current) => {
      if (!current) return current;

      const tasks = [...current.tasks];
      tasks[index] = {
        ...tasks[index],
        [field]:
          field === "xp" || field === "rewardPoints"
            ? Number(value) || 0
            : value,
      };

      return { ...current, tasks };
    });
  };

  const updateReward = (index: number, field: keyof RewardItem, value: string) => {
    setDraftPkg((current) => {
      if (!current) return current;

      const rewards = [...current.rewards];
      rewards[index] = {
        ...rewards[index],
        [field]: field === "price" ? Number(value) || 0 : value,
      };

      return { ...current, rewards };
    });
  };

  const handleStartEdit = () => {
    if (!pkg) return;
    setDraftPkg(JSON.parse(JSON.stringify(pkg)));
    setIsEditingPackage(true);
    setEditingTaskIndex(null);
    setEditingRewardIndex(null);
  };

  const handleCancelEdit = () => {
    if (!pkg) return;
    setDraftPkg(JSON.parse(JSON.stringify(pkg)));
    setIsEditingPackage(false);
    setEditingTaskIndex(null);
    setEditingRewardIndex(null);
  };

  const handleSave = async () => {
    if (!draftPkg) return;

    try {
      setIsSaving(true);

      const payload = {
        title: draftPkg.title,
        ageGroup: draftPkg.ageGroup,
        description: draftPkg.description,
        tasks: draftPkg.tasks.map((task) => ({
          id: task.id,
          title: task.title,
          xp: task.xp,
          rewardPoints: task.rewardPoints,
          type: task.type,
        })),
        rewards: draftPkg.rewards.map((reward) => ({
          id: reward.id,
          title: reward.title,
          price: reward.price,
          type: reward.type,
        })),
      };

      const res = await api.put(`/packages/${id}`, payload);
      const updated = res.data.data as PackageDetail;

      setPkg(updated);
      setDraftPkg(JSON.parse(JSON.stringify(updated)));
      setIsEditingPackage(false);
      setEditingTaskIndex(null);
      setEditingRewardIndex(null);
      router.replace("/(admin)/packages");
    } catch {
      Alert.alert("Save failed", "The package could not be updated.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeletePackage = () => {
    Alert.alert(
      "Delete package",
      "This action will permanently remove the package and all its tasks and rewards.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await api.delete(`/packages/${id}`);
              router.replace("/(admin)/packages");
            } catch {
              Alert.alert("Delete failed", "The package could not be deleted.");
            }
          },
        },
      ]
    );
  };

  const handleDeleteTask = (index: number) => {
    setDraftPkg((current) => {
      if (!current) return current;
      return {
        ...current,
        tasks: current.tasks.filter((_, taskIndex) => taskIndex !== index),
      };
    });

    setEditingTaskIndex((current) => {
      if (current === null) return current;
      if (current === index) return null;
      if (current > index) return current - 1;
      return current;
    });
  };

  const handleDeleteReward = (index: number) => {
    setDraftPkg((current) => {
      if (!current) return current;
      return {
        ...current,
        rewards: current.rewards.filter((_, rewardIndex) => rewardIndex !== index),
      };
    });

    setEditingRewardIndex((current) => {
      if (current === null) return current;
      if (current === index) return null;
      if (current > index) return current - 1;
      return current;
    });
  };

  const addTask = () => {
    setDraftPkg((current) => {
      if (!current) return current;
      return { ...current, tasks: [...current.tasks, emptyTask()] };
    });
    setEditingTaskIndex(draftPkg?.tasks.length ?? 0);
  };

  const addReward = () => {
    setDraftPkg((current) => {
      if (!current) return current;
      return { ...current, rewards: [...current.rewards, emptyReward()] };
    });
    setEditingRewardIndex(draftPkg?.rewards.length ?? 0);
  };

  if (!draftPkg) {
    return null;
  }

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
          <Text style={[s.topBarTitle, { color: theme.colors.text }]}>Package Details</Text>
          <Text style={{ color: theme.colors.textMuted }}>
            {isEditingPackage ? "Edit package content" : "Review package content"}
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={s.content}>
        <View
          style={[
            s.heroCard,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            },
          ]}
        >
          {!isEditingPackage && (
            <View style={s.heroActions}>
              <Pressable onPress={handleStartEdit} style={s.iconButton} hitSlop={8}>
                <Image
                  source={require("../../../../assets/button_icons/edit.png")}
                  style={s.iconImage}
                />
              </Pressable>

              <Pressable onPress={handleDeletePackage} style={s.iconButton} hitSlop={8}>
                <Image
                  source={require("../../../../assets/button_icons/delete.png")}
                  style={s.iconImage}
                />
              </Pressable>
            </View>
          )}

          {isEditingPackage ? (
            <>
              <TextInput
                value={draftPkg.title}
                onChangeText={(value) => updatePackageField("title", value)}
                style={[
                  s.titleInput,
                  s.input,
                  inputColors(theme.colors.surfaceAlt, theme.colors.text),
                ]}
                placeholder="Package title"
                placeholderTextColor={theme.colors.textMuted}
              />

              <TextInput
                value={draftPkg.ageGroup}
                onChangeText={(value) => updatePackageField("ageGroup", value)}
                style={[s.input, inputColors(theme.colors.surfaceAlt, theme.colors.text)]}
                placeholder="Age group"
                placeholderTextColor={theme.colors.textMuted}
              />

              <TextInput
                value={draftPkg.description}
                onChangeText={(value) => updatePackageField("description", value)}
                style={[
                  s.input,
                  s.multilineInput,
                  inputColors(theme.colors.surfaceAlt, theme.colors.text),
                ]}
                placeholder="Description"
                placeholderTextColor={theme.colors.textMuted}
                multiline
              />
            </>
          ) : (
            <>
              <Text style={[s.heroTitle, { color: theme.colors.text }]}>{draftPkg.title}</Text>
              <Text style={[s.heroMeta, { color: theme.colors.textMuted }]}>
                Age Group {draftPkg.ageGroup}
              </Text>
              <Text style={[s.heroDescription, { color: theme.colors.textMuted }]}>
                {draftPkg.description || "No description provided."}
              </Text>
            </>
          )}

          {isEditingPackage && (
            <View style={s.formActions}>
              <Pressable
                style={[s.primaryAction, { backgroundColor: theme.colors.primary }]}
                onPress={handleSave}
                disabled={isSaving}
              >
                <Text style={s.primaryActionText}>{isSaving ? "Saving..." : "Save"}</Text>
              </Pressable>

              <Pressable
                style={[s.secondaryAction, { backgroundColor: theme.colors.surfaceAlt }]}
                onPress={handleCancelEdit}
              >
                <Text style={[s.secondaryActionText, { color: theme.colors.text }]}>Cancel</Text>
              </Pressable>
            </View>
          )}
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
          <View style={s.sectionHeader}>
            <Text style={[s.sectionTitle, { color: theme.colors.text }]}>Tasks</Text>

            {isEditingPackage && (
              <Pressable
                style={[s.addChip, { backgroundColor: theme.colors.primary }]}
                onPress={addTask}
              >
                <Text style={s.addChipText}>+ Add Task</Text>
              </Pressable>
            )}
          </View>

          {draftPkg.tasks.map((task, index) => {
            const isEditingTask = isEditingPackage && editingTaskIndex === index;

            return (
              <View
                key={task.id ?? `task-${index}`}
                style={[s.itemCard, { backgroundColor: theme.colors.surfaceAlt }]}
              >
                {isEditingTask ? (
                  <>
                    <TextInput
                      value={task.title}
                      onChangeText={(value) => updateTask(index, "title", value)}
                      style={[s.input, inputColors(theme.colors.surface, theme.colors.text)]}
                      placeholder="Task title"
                      placeholderTextColor={theme.colors.textMuted}
                    />

                    <TextInput
                      value={String(task.xp)}
                      onChangeText={(value) => updateTask(index, "xp", value)}
                      style={[s.input, inputColors(theme.colors.surface, theme.colors.text)]}
                      placeholder="XP"
                      placeholderTextColor={theme.colors.textMuted}
                      keyboardType="numeric"
                    />

                    <TextInput
                      value={String(task.rewardPoints)}
                      onChangeText={(value) => updateTask(index, "rewardPoints", value)}
                      style={[s.input, inputColors(theme.colors.surface, theme.colors.text)]}
                      placeholder="Reward Points"
                      placeholderTextColor={theme.colors.textMuted}
                      keyboardType="numeric"
                    />

                    <TextInput
                      value={task.type}
                      onChangeText={(value) => updateTask(index, "type", value)}
                      style={[s.input, inputColors(theme.colors.surface, theme.colors.text)]}
                      placeholder="Type"
                      placeholderTextColor={theme.colors.textMuted}
                    />
                  </>
                ) : (
                  <>
                    <Text style={[s.itemTitle, { color: theme.colors.text }]}>{task.title}</Text>

                    <View style={s.infoRow}>
                      <View
                        style={[s.typeBadge, { backgroundColor: theme.colors.surface }]}
                      >
                        <Text
                          style={[s.typeBadgeText, { color: theme.colors.textMuted }]}
                        >
                          {task.type || "-"}
                        </Text>
                      </View>

                      <View style={s.metricGroup}>
                        <View style={s.metricItem}>
                          <Text style={[s.metricValue, { color: theme.colors.text }]}>
                            {task.xp}
                          </Text>
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
                  </>
                )}

                {isEditingPackage && (
                  <View style={s.itemActions}>
                    <Pressable
                      onPress={() => setEditingTaskIndex(isEditingTask ? null : index)}
                      style={s.iconButton}
                      hitSlop={8}
                    >
                      <Image
                        source={require("../../../../assets/button_icons/edit.png")}
                        style={s.iconImage}
                      />
                    </Pressable>

                    <Pressable
                      onPress={() => handleDeleteTask(index)}
                      style={s.iconButton}
                      hitSlop={8}
                    >
                      <Image
                        source={require("../../../../assets/button_icons/delete.png")}
                        style={s.iconImage}
                      />
                    </Pressable>
                  </View>
                )}
              </View>
            );
          })}
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
          <View style={s.sectionHeader}>
            <Text style={[s.sectionTitle, { color: theme.colors.text }]}>Rewards</Text>

            {isEditingPackage && (
              <Pressable
                style={[s.addChip, { backgroundColor: theme.colors.primary }]}
                onPress={addReward}
              >
                <Text style={s.addChipText}>+ Add Reward</Text>
              </Pressable>
            )}
          </View>

          {draftPkg.rewards.map((reward, index) => {
            const isEditingReward = isEditingPackage && editingRewardIndex === index;
            const imageSource = getRewardImage(reward.type);

            return (
              <View
                key={reward.id ?? `reward-${index}`}
                style={[s.rewardCard, { backgroundColor: theme.colors.surfaceAlt }]}
              >
                {isEditingReward ? (
                  <View style={s.editFormWrap}>
                    <TextInput
                      value={reward.title}
                      onChangeText={(value) => updateReward(index, "title", value)}
                      style={[s.input, inputColors(theme.colors.surface, theme.colors.text)]}
                      placeholder="Reward title"
                      placeholderTextColor={theme.colors.textMuted}
                    />

                    <TextInput
                      value={String(reward.price)}
                      onChangeText={(value) => updateReward(index, "price", value)}
                      style={[s.input, inputColors(theme.colors.surface, theme.colors.text)]}
                      placeholder="Price"
                      placeholderTextColor={theme.colors.textMuted}
                      keyboardType="numeric"
                    />

                    <TextInput
                      value={reward.type}
                      onChangeText={(value) => updateReward(index, "type", value)}
                      style={[s.input, inputColors(theme.colors.surface, theme.colors.text)]}
                      placeholder="Type"
                      placeholderTextColor={theme.colors.textMuted}
                    />
                  </View>
                ) : (
                  <>
                    <Image source={imageSource} style={s.rewardImage} />

                    <View style={s.rewardTextWrap}>
                      <Text style={[s.itemTitle, { color: theme.colors.text }]}>
                        {reward.title}
                      </Text>

                      <View style={s.infoRow}>
                        <View
                          style={[s.typeBadge, { backgroundColor: theme.colors.surface }]}
                        >
                          <Text
                            style={[s.typeBadgeText, { color: theme.colors.textMuted }]}
                          >
                            {reward.type || "-"}
                          </Text>
                        </View>

                        <View style={s.metricItem}>
                          <Text style={[s.metricValue, { color: theme.colors.text }]}>
                            {reward.price}
                          </Text>
                          <Image
                            source={require("../../../../assets/icons/reward_points.png")}
                            style={s.metricIcon}
                          />
                        </View>
                      </View>
                    </View>
                  </>
                )}

                {isEditingPackage && (
                  <View style={s.itemActions}>
                    <Pressable
                      onPress={() => setEditingRewardIndex(isEditingReward ? null : index)}
                      style={s.iconButton}
                      hitSlop={8}
                    >
                      <Image
                        source={require("../../../../assets/button_icons/edit.png")}
                        style={s.iconImage}
                      />
                    </Pressable>

                    <Pressable
                      onPress={() => handleDeleteReward(index)}
                      style={s.iconButton}
                      hitSlop={8}
                    >
                      <Image
                        source={require("../../../../assets/button_icons/delete.png")}
                        style={s.iconImage}
                      />
                    </Pressable>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const inputColors = (backgroundColor: string, color: string) => ({
  backgroundColor,
  color,
});

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
    gap: 12,
    borderWidth: 1,
    position: "relative",
  },
  heroActions: {
    position: "absolute",
    top: 14,
    right: 14,
    flexDirection: "row",
    gap: 8,
    zIndex: 2,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: "800",
    paddingRight: 72,
  },
  heroMeta: {
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  heroDescription: {
    lineHeight: 21,
  },
  titleInput: {
    fontSize: 22,
    fontWeight: "700",
  },
  input: {
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  multilineInput: {
    minHeight: 110,
    textAlignVertical: "top",
  },
  formActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },
  primaryAction: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  primaryActionText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  secondaryAction: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  secondaryActionText: {
    fontWeight: "700",
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
    gap: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
  },
  addChip: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  addChipText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 12,
    textTransform: "uppercase",
  },
  itemCard: {
    borderRadius: 14,
    padding: 14,
    gap: 4,
    position: "relative",
  },
  rewardCard: {
    borderRadius: 14,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    position: "relative",
  },
  editFormWrap: {
    flex: 1,
    gap: 12,
  },
  itemTitle: {
    fontSize: 17,
    fontWeight: "700",
    paddingRight: 64,
  },
  rewardImage: {
    width: 56,
    height: 56,
    resizeMode: "contain",
  },
  rewardTextWrap: {
    flex: 1,
    gap: 4,
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
  itemActions: {
    position: "absolute",
    top: 12,
    right: 12,
    flexDirection: "row",
    gap: 8,
    zIndex: 2,
  },
  iconButton: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  iconImage: {
    width: 22,
    height: 22,
    resizeMode: "contain",
  },
});
