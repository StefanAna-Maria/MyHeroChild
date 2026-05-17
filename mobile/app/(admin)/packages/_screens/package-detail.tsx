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
import { AGE_CATEGORIES } from "../../../../constants/parentCatalogue";
import {
  formatItemTypeLabel,
  REWARD_TYPE_OPTIONS,
  TASK_TYPE_OPTIONS,
} from "../../../../constants/itemTypes";
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

type TaskDraft = {
  id?: number;
  title: string;
  xp: string;
  rewardPoints: string;
  type: string;
};

type RewardDraft = {
  id?: number;
  title: string;
  price: string;
  type: string;
};

type PackageDraft = {
  id: number;
  title: string;
  ageGroup: string;
  description: string;
  tasks: TaskDraft[];
  rewards: RewardDraft[];
};

type PackageErrors = {
  title?: string;
  ageGroup?: string;
  description?: string;
};

type TaskErrors = {
  title?: string;
  xp?: string;
  rewardPoints?: string;
  type?: string;
};

type RewardErrors = {
  title?: string;
  price?: string;
  type?: string;
};

type EditingState<T> = {
  index: number;
  isNew: boolean;
  original: T | null;
} | null;

const INTEGER_ERROR = "This area must contain an integer number";

const emptyTask = (): TaskDraft => ({
  title: "",
  xp: "",
  rewardPoints: "",
  type: "",
});

const emptyReward = (): RewardDraft => ({
  title: "",
  price: "",
  type: "",
});

const mapToDraft = (pkg: PackageDetail): PackageDraft => ({
  ...pkg,
  tasks: pkg.tasks.map((task) => ({
    ...task,
    xp: String(task.xp),
    rewardPoints: String(task.rewardPoints),
  })),
  rewards: pkg.rewards.map((reward) => ({
    ...reward,
    price: String(reward.price),
  })),
});

const isNaturalNumber = (value: string) => /^(0|[1-9]\d*)$/.test(value.trim());

export default function PackageDetailScreen() {
  const { id, edit } = useLocalSearchParams<{ id: string; edit?: string }>();
  const router = useRouter();
  const theme = useTheme();

  const [pkg, setPkg] = useState<PackageDetail | null>(null);
  const [draftPkg, setDraftPkg] = useState<PackageDraft | null>(null);
  const [packageErrors, setPackageErrors] = useState<PackageErrors>({});
  const [taskErrors, setTaskErrors] = useState<TaskErrors[]>([]);
  const [rewardErrors, setRewardErrors] = useState<RewardErrors[]>([]);
  const [isEditingPackage, setIsEditingPackage] = useState(false);
  const [editingTaskState, setEditingTaskState] = useState<EditingState<TaskDraft>>(null);
  const [editingRewardState, setEditingRewardState] = useState<EditingState<RewardDraft>>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isAgeDropdownOpen, setIsAgeDropdownOpen] = useState(false);
  const [isTaskTypeDropdownOpen, setIsTaskTypeDropdownOpen] = useState(false);
  const [isRewardTypeDropdownOpen, setIsRewardTypeDropdownOpen] = useState(false);

  const syncDraftState = useCallback((data: PackageDetail) => {
    const nextDraft = mapToDraft(data);
    setDraftPkg(nextDraft);
    setTaskErrors(nextDraft.tasks.map(() => ({})));
    setRewardErrors(nextDraft.rewards.map(() => ({})));
    setPackageErrors({});
  }, []);

  const fetchPackage = useCallback(async () => {
    const res = await api.get(`/packages/${id}`);
    const data = res.data.data as PackageDetail;
    setPkg(data);
    syncDraftState(data);
  }, [id, syncDraftState]);

  useEffect(() => {
    fetchPackage();
  }, [fetchPackage]);

  useEffect(() => {
    if (edit === "1" && pkg) {
      syncDraftState(pkg);
      setIsEditingPackage(true);
      setEditingTaskState(null);
      setEditingRewardState(null);
      setIsAgeDropdownOpen(false);
      setIsTaskTypeDropdownOpen(false);
      setIsRewardTypeDropdownOpen(false);
    }
  }, [edit, pkg, syncDraftState]);

  const validatePackageInfo = () => {
    if (!draftPkg) return false;

    const nextErrors: PackageErrors = {};

    if (!draftPkg.title.trim()) {
      nextErrors.title = "This field is required.";
    }

    if (!draftPkg.ageGroup.trim()) {
      nextErrors.ageGroup = "This field is required.";
    }

    if (!draftPkg.description.trim()) {
      nextErrors.description = "This field is required.";
    }

    setPackageErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const validateTaskAt = (index: number) => {
    if (!draftPkg) return false;

    const task = draftPkg.tasks[index];
    const nextErrors: TaskErrors = {};

    if (!task.title.trim()) {
      nextErrors.title = "This field is required.";
    }

    if (!task.type.trim()) {
      nextErrors.type = "This field is required.";
    }

    if (!isNaturalNumber(task.xp)) {
      nextErrors.xp = INTEGER_ERROR;
    }

    if (!isNaturalNumber(task.rewardPoints)) {
      nextErrors.rewardPoints = INTEGER_ERROR;
    }

    setTaskErrors((current) =>
      current.map((entry, entryIndex) => (entryIndex === index ? nextErrors : entry))
    );

    return Object.keys(nextErrors).length === 0;
  };

  const validateRewardAt = (index: number) => {
    if (!draftPkg) return false;

    const reward = draftPkg.rewards[index];
    const nextErrors: RewardErrors = {};

    if (!reward.title.trim()) {
      nextErrors.title = "This field is required.";
    }

    if (!reward.type.trim()) {
      nextErrors.type = "This field is required.";
    }

    if (!isNaturalNumber(reward.price)) {
      nextErrors.price = INTEGER_ERROR;
    }

    setRewardErrors((current) =>
      current.map((entry, entryIndex) => (entryIndex === index ? nextErrors : entry))
    );

    return Object.keys(nextErrors).length === 0;
  };

  const validateAllTasks = () => {
    if (!draftPkg) return false;

    const nextErrors = draftPkg.tasks.map<TaskErrors>((task) => {
      const currentErrors: TaskErrors = {};

      if (!task.title.trim()) {
        currentErrors.title = "This field is required.";
      }

      if (!task.type.trim()) {
        currentErrors.type = "This field is required.";
      }

      if (!isNaturalNumber(task.xp)) {
        currentErrors.xp = INTEGER_ERROR;
      }

      if (!isNaturalNumber(task.rewardPoints)) {
        currentErrors.rewardPoints = INTEGER_ERROR;
      }

      return currentErrors;
    });

    setTaskErrors(nextErrors);
    return nextErrors.every((entry) => Object.keys(entry).length === 0);
  };

  const validateAllRewards = () => {
    if (!draftPkg) return false;

    const nextErrors = draftPkg.rewards.map<RewardErrors>((reward) => {
      const currentErrors: RewardErrors = {};

      if (!reward.title.trim()) {
        currentErrors.title = "This field is required.";
      }

      if (!reward.type.trim()) {
        currentErrors.type = "This field is required.";
      }

      if (!isNaturalNumber(reward.price)) {
        currentErrors.price = INTEGER_ERROR;
      }

      return currentErrors;
    });

    setRewardErrors(nextErrors);
    return nextErrors.every((entry) => Object.keys(entry).length === 0);
  };

  const updatePackageField = (
    field: "title" | "ageGroup" | "description",
    value: string
  ) => {
    setDraftPkg((current) => (current ? { ...current, [field]: value } : current));
    setPackageErrors((current) => ({ ...current, [field]: undefined }));
  };

  const updateTask = (index: number, field: keyof TaskDraft, value: string) => {
    setDraftPkg((current) => {
      if (!current) return current;

      const tasks = [...current.tasks];
      tasks[index] = {
        ...tasks[index],
        [field]: value,
      };

      return { ...current, tasks };
    });

    setTaskErrors((current) =>
      current.map((entry, entryIndex) =>
        entryIndex === index ? { ...entry, [field]: undefined } : entry
      )
    );
  };

  const updateReward = (index: number, field: keyof RewardDraft, value: string) => {
    setDraftPkg((current) => {
      if (!current) return current;

      const rewards = [...current.rewards];
      rewards[index] = {
        ...rewards[index],
        [field]: value,
      };

      return { ...current, rewards };
    });

    setRewardErrors((current) =>
      current.map((entry, entryIndex) =>
        entryIndex === index ? { ...entry, [field]: undefined } : entry
      )
    );
  };

  const handleStartEdit = () => {
    if (!pkg) return;
    syncDraftState(pkg);
    setIsEditingPackage(true);
    setEditingTaskState(null);
    setEditingRewardState(null);
    setIsAgeDropdownOpen(false);
    setIsTaskTypeDropdownOpen(false);
    setIsRewardTypeDropdownOpen(false);
  };

  const handleCancelEdit = () => {
    if (!pkg) return;
    syncDraftState(pkg);
    setIsEditingPackage(false);
    setEditingTaskState(null);
    setEditingRewardState(null);
    setIsAgeDropdownOpen(false);
    setIsTaskTypeDropdownOpen(false);
    setIsRewardTypeDropdownOpen(false);
  };

  const handleSave = async () => {
    if (!draftPkg) return;

    const isPackageValid = validatePackageInfo();
    const areTasksValid = validateAllTasks();
    const areRewardsValid = validateAllRewards();

    if (!isPackageValid || !areTasksValid || !areRewardsValid) {
      return;
    }

    try {
      setIsSaving(true);

      const payload = {
        title: draftPkg.title.trim(),
        ageGroup: draftPkg.ageGroup.trim(),
        description: draftPkg.description.trim(),
        tasks: draftPkg.tasks.map((task) => ({
          id: task.id,
          title: task.title.trim(),
          xp: Number(task.xp),
          rewardPoints: Number(task.rewardPoints),
          type: task.type.trim(),
        })),
        rewards: draftPkg.rewards.map((reward) => ({
          id: reward.id,
          title: reward.title.trim(),
          price: Number(reward.price),
          type: reward.type.trim(),
        })),
      };

      const res = await api.put(`/packages/${id}`, payload);
      const updated = res.data.data as PackageDetail;

      setPkg(updated);
      syncDraftState(updated);
      setIsEditingPackage(false);
      setEditingTaskState(null);
      setEditingRewardState(null);
      setIsTaskTypeDropdownOpen(false);
      setIsRewardTypeDropdownOpen(false);
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

  const handleOpenTaskEdit = (index: number) => {
    if (!draftPkg || editingTaskState) return;

    setEditingTaskState({
      index,
      isNew: false,
      original: { ...draftPkg.tasks[index] },
    });
    setIsTaskTypeDropdownOpen(false);
  };

  const handleOpenRewardEdit = (index: number) => {
    if (!draftPkg || editingRewardState) return;

    setEditingRewardState({
      index,
      isNew: false,
      original: { ...draftPkg.rewards[index] },
    });
    setIsRewardTypeDropdownOpen(false);
  };

  const handleCancelTaskEdit = () => {
    if (!draftPkg || !editingTaskState) return;

    if (editingTaskState.isNew) {
      setDraftPkg((current) => {
        if (!current) return current;
        return {
          ...current,
          tasks: current.tasks.filter((_, index) => index !== editingTaskState.index),
        };
      });

      setTaskErrors((current) =>
        current.filter((_, index) => index !== editingTaskState.index)
      );
    } else if (editingTaskState.original) {
      setDraftPkg((current) => {
        if (!current) return current;

        const tasks = [...current.tasks];
        tasks[editingTaskState.index] = editingTaskState.original as TaskDraft;
        return { ...current, tasks };
      });

      setTaskErrors((current) =>
        current.map((entry, index) => (index === editingTaskState.index ? {} : entry))
      );
    }

    setEditingTaskState(null);
    setIsTaskTypeDropdownOpen(false);
  };

  const handleCancelRewardEdit = () => {
    if (!draftPkg || !editingRewardState) return;

    if (editingRewardState.isNew) {
      setDraftPkg((current) => {
        if (!current) return current;
        return {
          ...current,
          rewards: current.rewards.filter((_, index) => index !== editingRewardState.index),
        };
      });

      setRewardErrors((current) =>
        current.filter((_, index) => index !== editingRewardState.index)
      );
    } else if (editingRewardState.original) {
      setDraftPkg((current) => {
        if (!current) return current;

        const rewards = [...current.rewards];
        rewards[editingRewardState.index] = editingRewardState.original as RewardDraft;
        return { ...current, rewards };
      });

      setRewardErrors((current) =>
        current.map((entry, index) => (index === editingRewardState.index ? {} : entry))
      );
    }

    setEditingRewardState(null);
    setIsRewardTypeDropdownOpen(false);
  };

  const handleSaveTaskChanges = () => {
    if (!editingTaskState) return;
    const isValid = validateTaskAt(editingTaskState.index);
    if (!isValid) return;
    setEditingTaskState(null);
    setIsTaskTypeDropdownOpen(false);
  };

  const handleSaveRewardChanges = () => {
    if (!editingRewardState) return;
    const isValid = validateRewardAt(editingRewardState.index);
    if (!isValid) return;
    setEditingRewardState(null);
    setIsRewardTypeDropdownOpen(false);
  };

  const handleDeleteTask = (index: number) => {
    setDraftPkg((current) => {
      if (!current) return current;
      return {
        ...current,
        tasks: current.tasks.filter((_, taskIndex) => taskIndex !== index),
      };
    });

    setTaskErrors((current) => current.filter((_, errorIndex) => errorIndex !== index));
    setEditingTaskState(null);
    setIsTaskTypeDropdownOpen(false);
  };

  const handleDeleteReward = (index: number) => {
    setDraftPkg((current) => {
      if (!current) return current;
      return {
        ...current,
        rewards: current.rewards.filter((_, rewardIndex) => rewardIndex !== index),
      };
    });

    setRewardErrors((current) => current.filter((_, errorIndex) => errorIndex !== index));
    setEditingRewardState(null);
    setIsRewardTypeDropdownOpen(false);
  };

  const addTask = () => {
    if (!draftPkg || editingTaskState) return;

    const isPackageValid = validatePackageInfo();
    const areExistingTasksValid = validateAllTasks();

    if (!isPackageValid || !areExistingTasksValid) {
      return;
    }

    setDraftPkg((current) => {
      if (!current) return current;
      return { ...current, tasks: [emptyTask(), ...current.tasks] };
    });
    setTaskErrors((current) => [{}, ...current]);
    setEditingTaskState({ index: 0, isNew: true, original: null });
    setIsTaskTypeDropdownOpen(false);
  };

  const addReward = () => {
    if (!draftPkg || editingRewardState) return;

    const isPackageValid = validatePackageInfo();
    const areExistingRewardsValid = validateAllRewards();

    if (!isPackageValid || !areExistingRewardsValid) {
      return;
    }

    setDraftPkg((current) => {
      if (!current) return current;
      return { ...current, rewards: [emptyReward(), ...current.rewards] };
    });
    setRewardErrors((current) => [{}, ...current]);
    setEditingRewardState({ index: 0, isNew: true, original: null });
    setIsRewardTypeDropdownOpen(false);
  };

  if (!draftPkg) {
    return null;
  }

  const ageGroupLabel = draftPkg.ageGroup
    ? `Age Group ${draftPkg.ageGroup}`
    : "Select age group";

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
              <View>
                <TextInput
                  value={draftPkg.title}
                  onChangeText={(value) => updatePackageField("title", value)}
                  style={[
                    s.titleInput,
                    s.input,
                    inputColors(theme.colors.surfaceAlt, theme.colors.text),
                    packageErrors.title && { borderColor: theme.colors.error },
                  ]}
                  placeholder="Package title"
                  placeholderTextColor={
                    packageErrors.title ? theme.colors.error : theme.colors.textMuted
                  }
                />
                {packageErrors.title ? (
                  <Text style={[s.errorText, { color: theme.colors.error }]}>
                    {packageErrors.title}
                  </Text>
                ) : null}
              </View>

              <View>
                <Pressable
                  onPress={() => setIsAgeDropdownOpen((current) => !current)}
                  style={[
                    s.selectField,
                    {
                      backgroundColor: theme.colors.surfaceAlt,
                    },
                    packageErrors.ageGroup && { borderColor: theme.colors.error },
                  ]}
                >
                  <Text
                    style={{
                      color: draftPkg.ageGroup ? theme.colors.text : theme.colors.textMuted,
                      fontSize: 16,
                    }}
                  >
                    {ageGroupLabel}
                  </Text>

                  <Ionicons
                    name={isAgeDropdownOpen ? "chevron-up" : "chevron-down"}
                    size={18}
                    color={theme.colors.textMuted}
                  />
                </Pressable>

                {isAgeDropdownOpen ? (
                  <View
                    style={[
                      s.dropdown,
                      {
                        backgroundColor: theme.colors.surfaceAlt,
                        borderColor: theme.colors.border,
                      },
                    ]}
                  >
                    {AGE_CATEGORIES.map((category) => (
                      <Pressable
                        key={category.key}
                        onPress={() => {
                          updatePackageField("ageGroup", category.key);
                          setIsAgeDropdownOpen(false);
                        }}
                        style={[
                          s.dropdownOption,
                          category.key === draftPkg.ageGroup && {
                            backgroundColor: theme.colors.primary,
                          },
                        ]}
                      >
                        <Text
                          style={{
                            color: theme.colors.text,
                            fontWeight: category.key === draftPkg.ageGroup ? "700" : "500",
                          }}
                        >
                          {category.key}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                ) : null}

                {packageErrors.ageGroup ? (
                  <Text style={[s.errorText, { color: theme.colors.error }]}>
                    {packageErrors.ageGroup}
                  </Text>
                ) : null}
              </View>

              <View>
                <TextInput
                  value={draftPkg.description}
                  onChangeText={(value) => updatePackageField("description", value)}
                  style={[
                    s.input,
                    s.multilineInput,
                    inputColors(theme.colors.surfaceAlt, theme.colors.text),
                    packageErrors.description && { borderColor: theme.colors.error },
                  ]}
                  placeholder="Description"
                  placeholderTextColor={
                    packageErrors.description ? theme.colors.error : theme.colors.textMuted
                  }
                  multiline
                />
                {packageErrors.description ? (
                  <Text style={[s.errorText, { color: theme.colors.error }]}>
                    {packageErrors.description}
                  </Text>
                ) : null}
              </View>
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
            const isEditingTask = editingTaskState?.index === index;
            const taskError = taskErrors[index] ?? {};

            return (
              <View
                key={task.id ?? `task-${index}`}
                style={[s.itemCard, { backgroundColor: theme.colors.surfaceAlt }]}
              >
                {isEditingTask ? (
                  <>
                    <View>
                      <TextInput
                        value={task.title}
                        onChangeText={(value) => updateTask(index, "title", value)}
                        style={[
                          s.input,
                          inputColors(theme.colors.surface, theme.colors.text),
                          taskError.title && { borderColor: theme.colors.error },
                        ]}
                        placeholder="Task title"
                        placeholderTextColor={
                          taskError.title ? theme.colors.error : theme.colors.textMuted
                        }
                      />
                      {taskError.title ? (
                        <Text style={[s.errorText, { color: theme.colors.error }]}>
                          {taskError.title}
                        </Text>
                      ) : null}
                    </View>

                    <View>
                      <TextInput
                        value={task.xp}
                        onChangeText={(value) => updateTask(index, "xp", value)}
                        style={[
                          s.input,
                          inputColors(theme.colors.surface, theme.colors.text),
                          taskError.xp && { borderColor: theme.colors.error },
                        ]}
                        placeholder={taskError.xp && !task.xp ? INTEGER_ERROR : "XP"}
                        placeholderTextColor={
                          taskError.xp ? theme.colors.error : theme.colors.textMuted
                        }
                        keyboardType="number-pad"
                      />
                      {taskError.xp && task.xp ? (
                        <Text style={[s.errorText, { color: theme.colors.error }]}>
                          {taskError.xp}
                        </Text>
                      ) : null}
                    </View>

                    <View>
                      <TextInput
                        value={task.rewardPoints}
                        onChangeText={(value) => updateTask(index, "rewardPoints", value)}
                        style={[
                          s.input,
                          inputColors(theme.colors.surface, theme.colors.text),
                          taskError.rewardPoints && { borderColor: theme.colors.error },
                        ]}
                        placeholder={
                          taskError.rewardPoints && !task.rewardPoints
                            ? INTEGER_ERROR
                            : "Reward Points"
                        }
                        placeholderTextColor={
                          taskError.rewardPoints
                            ? theme.colors.error
                            : theme.colors.textMuted
                        }
                        keyboardType="number-pad"
                      />
                      {taskError.rewardPoints && task.rewardPoints ? (
                        <Text style={[s.errorText, { color: theme.colors.error }]}>
                          {taskError.rewardPoints}
                        </Text>
                      ) : null}
                    </View>

                    <View>
                      <Pressable
                        onPress={() => setIsTaskTypeDropdownOpen((current) => !current)}
                        style={[
                          s.selectField,
                          inputColors(theme.colors.surface, theme.colors.text),
                          taskError.type && { borderColor: theme.colors.error },
                        ]}
                      >
                        <Text
                          style={{
                            color: task.type ? theme.colors.text : theme.colors.textMuted,
                            fontSize: 16,
                          }}
                        >
                          {task.type ? formatItemTypeLabel(task.type) : "Select type"}
                        </Text>
                        <Ionicons
                          name={isTaskTypeDropdownOpen ? "chevron-up" : "chevron-down"}
                          size={18}
                          color={theme.colors.textMuted}
                        />
                      </Pressable>
                      {isTaskTypeDropdownOpen ? (
                        <View
                          style={[
                            s.dropdown,
                            {
                              backgroundColor: theme.colors.surface,
                              borderColor: theme.colors.border,
                            },
                          ]}
                        >
                          {TASK_TYPE_OPTIONS.map((option) => (
                            <Pressable
                              key={option}
                              onPress={() => {
                                updateTask(index, "type", option);
                                setIsTaskTypeDropdownOpen(false);
                              }}
                              style={[
                                s.dropdownOption,
                                option === task.type && { backgroundColor: theme.colors.primary },
                              ]}
                            >
                              <Text
                                style={{
                                  color: theme.colors.text,
                                  fontWeight: option === task.type ? "700" : "500",
                                }}
                              >
                                {formatItemTypeLabel(option)}
                              </Text>
                            </Pressable>
                          ))}
                        </View>
                      ) : null}
                      {taskError.type ? (
                        <Text style={[s.errorText, { color: theme.colors.error }]}>
                          {taskError.type}
                        </Text>
                      ) : null}
                    </View>

                    <View style={s.itemFormActions}>
                      <Pressable
                        style={[s.itemActionButton, { backgroundColor: theme.colors.primary }]}
                        onPress={handleSaveTaskChanges}
                      >
                        <Text style={s.itemActionText}>
                          {editingTaskState?.isNew ? "Confirm" : "Save Changes"}
                        </Text>
                      </Pressable>

                      <Pressable
                        style={[s.itemActionButton, { backgroundColor: theme.colors.surface }]}
                        onPress={handleCancelTaskEdit}
                      >
                        <Text style={[s.itemSecondaryActionText, { color: theme.colors.text }]}>
                          Cancel
                        </Text>
                      </Pressable>
                    </View>
                  </>
                ) : (
                  <>
                    <Text style={[s.itemTitle, { color: theme.colors.text }]}>{task.title}</Text>

                    <View style={s.infoRow}>
                      <View style={[s.typeBadge, { backgroundColor: theme.colors.surface }]}>
                        <Text style={[s.typeBadgeText, { color: theme.colors.textMuted }]}>
                          {formatItemTypeLabel(task.type)}
                        </Text>
                      </View>

                      <View style={s.metricGroup}>
                        <View style={s.metricItem}>
                          <Text style={[s.metricValue, { color: theme.colors.text }]}>
                            {task.xp || "-"}
                          </Text>
                          <Image
                            source={require("../../../../assets/icons/xp.png")}
                            style={s.metricIcon}
                          />
                        </View>

                        <View style={s.metricItem}>
                          <Text style={[s.metricValue, { color: theme.colors.text }]}>
                            {task.rewardPoints || "-"}
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

                {isEditingPackage && !isEditingTask && (
                  <View style={s.itemActions}>
                    <Pressable
                      onPress={() => handleOpenTaskEdit(index)}
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
            const isEditingReward = editingRewardState?.index === index;
            const rewardError = rewardErrors[index] ?? {};
            const imageSource = getRewardImage(reward.type);

            return (
              <View
                key={reward.id ?? `reward-${index}`}
                style={[s.rewardCard, { backgroundColor: theme.colors.surfaceAlt }]}
              >
                {isEditingReward ? (
                  <View style={s.editFormWrap}>
                    <View>
                      <TextInput
                        value={reward.title}
                        onChangeText={(value) => updateReward(index, "title", value)}
                        style={[
                          s.input,
                          inputColors(theme.colors.surface, theme.colors.text),
                          rewardError.title && { borderColor: theme.colors.error },
                        ]}
                        placeholder="Reward title"
                        placeholderTextColor={
                          rewardError.title ? theme.colors.error : theme.colors.textMuted
                        }
                      />
                      {rewardError.title ? (
                        <Text style={[s.errorText, { color: theme.colors.error }]}>
                          {rewardError.title}
                        </Text>
                      ) : null}
                    </View>

                    <View>
                      <TextInput
                        value={reward.price}
                        onChangeText={(value) => updateReward(index, "price", value)}
                        style={[
                          s.input,
                          inputColors(theme.colors.surface, theme.colors.text),
                          rewardError.price && { borderColor: theme.colors.error },
                        ]}
                        placeholder={rewardError.price && !reward.price ? INTEGER_ERROR : "Price"}
                        placeholderTextColor={
                          rewardError.price ? theme.colors.error : theme.colors.textMuted
                        }
                        keyboardType="number-pad"
                      />
                      {rewardError.price && reward.price ? (
                        <Text style={[s.errorText, { color: theme.colors.error }]}>
                          {rewardError.price}
                        </Text>
                      ) : null}
                    </View>

                    <View>
                      <Pressable
                        onPress={() => setIsRewardTypeDropdownOpen((current) => !current)}
                        style={[
                          s.selectField,
                          inputColors(theme.colors.surface, theme.colors.text),
                          rewardError.type && { borderColor: theme.colors.error },
                        ]}
                      >
                        <Text
                          style={{
                            color: reward.type ? theme.colors.text : theme.colors.textMuted,
                            fontSize: 16,
                          }}
                        >
                          {reward.type ? formatItemTypeLabel(reward.type) : "Select type"}
                        </Text>
                        <Ionicons
                          name={isRewardTypeDropdownOpen ? "chevron-up" : "chevron-down"}
                          size={18}
                          color={theme.colors.textMuted}
                        />
                      </Pressable>
                      {isRewardTypeDropdownOpen ? (
                        <View
                          style={[
                            s.dropdown,
                            {
                              backgroundColor: theme.colors.surface,
                              borderColor: theme.colors.border,
                            },
                          ]}
                        >
                          {REWARD_TYPE_OPTIONS.map((option) => (
                            <Pressable
                              key={option}
                              onPress={() => {
                                updateReward(index, "type", option);
                                setIsRewardTypeDropdownOpen(false);
                              }}
                              style={[
                                s.dropdownOption,
                                option === reward.type && { backgroundColor: theme.colors.primary },
                              ]}
                            >
                              <Text
                                style={{
                                  color: theme.colors.text,
                                  fontWeight: option === reward.type ? "700" : "500",
                                }}
                              >
                                {formatItemTypeLabel(option)}
                              </Text>
                            </Pressable>
                          ))}
                        </View>
                      ) : null}
                      {rewardError.type ? (
                        <Text style={[s.errorText, { color: theme.colors.error }]}>
                          {rewardError.type}
                        </Text>
                      ) : null}
                    </View>

                    <View style={s.itemFormActions}>
                      <Pressable
                        style={[s.itemActionButton, { backgroundColor: theme.colors.primary }]}
                        onPress={handleSaveRewardChanges}
                      >
                        <Text style={s.itemActionText}>
                          {editingRewardState?.isNew ? "Confirm" : "Save Changes"}
                        </Text>
                      </Pressable>

                      <Pressable
                        style={[s.itemActionButton, { backgroundColor: theme.colors.surface }]}
                        onPress={handleCancelRewardEdit}
                      >
                        <Text style={[s.itemSecondaryActionText, { color: theme.colors.text }]}>
                          Cancel
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                ) : (
                  <>
                    <Image source={imageSource} style={s.rewardImage} />

                    <View style={s.rewardTextWrap}>
                      <Text style={[s.itemTitle, { color: theme.colors.text }]}>
                        {reward.title}
                      </Text>

                      <View style={s.infoRow}>
                        <View style={[s.typeBadge, { backgroundColor: theme.colors.surface }]}>
                          <Text style={[s.typeBadgeText, { color: theme.colors.textMuted }]}>
                            {formatItemTypeLabel(reward.type)}
                          </Text>
                        </View>

                        <View style={s.metricItem}>
                          <Text style={[s.metricValue, { color: theme.colors.text }]}>
                            {reward.price || "-"}
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

                {isEditingPackage && !isEditingReward && (
                  <View style={s.itemActions}>
                    <Pressable
                      onPress={() => handleOpenRewardEdit(index)}
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
    borderWidth: 1,
    borderColor: "transparent",
  },
  selectField: {
    minHeight: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "transparent",
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dropdown: {
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 8,
    overflow: "hidden",
  },
  dropdownOption: {
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
    gap: 8,
    position: "relative",
  },
  rewardCard: {
    borderRadius: 14,
    padding: 14,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    position: "relative",
  },
  editFormWrap: {
    flex: 1,
    gap: 10,
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
    borderRadius: 16,
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
  itemFormActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 2,
  },
  itemActionButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  itemActionText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  itemSecondaryActionText: {
    fontWeight: "700",
  },
  errorText: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: "600",
  },
});
