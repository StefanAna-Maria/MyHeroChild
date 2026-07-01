import { useMemo, useState } from "react";
import {
  Alert,
  Image,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CurvedScreenBody from "../../../../components/CurvedScreenBody";
import { api } from "../../../../src/services/api";
import { useTheme } from "../../../../src/context/ThemeContext";
import { AGE_CATEGORIES } from "../../../../constants/parentCatalogue";
import {
  formatItemTypeLabel,
  REWARD_TYPE_OPTIONS,
  TASK_TYPE_OPTIONS,
} from "../../../../constants/itemTypes";
import { getRewardImage } from "../../../../constants/rewardImages";

type DraftTask = {
  title: string;
  xp: string;
  rewardPoints: string;
  type: string;
};

type DraftReward = {
  title: string;
  price: string;
  type: string;
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

const INTEGER_ERROR = "This area must contain an integer number";

const newTask = (): DraftTask => ({
  title: "",
  xp: "",
  rewardPoints: "",
  type: "",
});

const newReward = (): DraftReward => ({
  title: "",
  price: "",
  type: "",
});

const isNaturalNumber = (value: string) => /^(0|[1-9]\d*)$/.test(value.trim());

export default function CreatePackage() {
  const router = useRouter();
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const [title, setTitle] = useState("");
  const [ageGroup, setAgeGroup] = useState("");
  const [description, setDescription] = useState("");
  const [tasks, setTasks] = useState<DraftTask[]>([]);
  const [rewards, setRewards] = useState<DraftReward[]>([]);
  const [packageErrors, setPackageErrors] = useState<PackageErrors>({});
  const [taskErrors, setTaskErrors] = useState<TaskErrors[]>([]);
  const [rewardErrors, setRewardErrors] = useState<RewardErrors[]>([]);
  const [taskSectionError, setTaskSectionError] = useState("");
  const [rewardSectionError, setRewardSectionError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAgeDropdownOpen, setIsAgeDropdownOpen] = useState(false);
  const [openTaskTypeKey, setOpenTaskTypeKey] = useState<string | null>(null);
  const [openRewardTypeKey, setOpenRewardTypeKey] = useState<string | null>(null);

  const ageOptions = useMemo(() => AGE_CATEGORIES.map((category) => category.key), []);

  const validatePackageInfo = () => {
    const nextErrors: PackageErrors = {};

    if (!title.trim()) {
      nextErrors.title = "This field is required.";
    }

    if (!ageGroup.trim()) {
      nextErrors.ageGroup = "Please select an age group.";
    }

    if (!description.trim()) {
      nextErrors.description = "This field is required.";
    }

    setPackageErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const validateTasks = () => {
    const nextErrors = tasks.map<TaskErrors>((task) => {
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

  const validateRewards = () => {
    const nextErrors = rewards.map<RewardErrors>((reward) => {
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

  const handleAddTask = () => {
    const isPackageValid = validatePackageInfo();
    const areCurrentTasksValid = validateTasks();

    if (!isPackageValid || !areCurrentTasksValid) {
      return;
    }

    setTaskSectionError("");
    setOpenTaskTypeKey(null);
    setTasks((current) => [newTask(), ...current]);
    setTaskErrors((current) => [{}, ...current]);
  };

  const handleAddReward = () => {
    const isPackageValid = validatePackageInfo();
    const areCurrentRewardsValid = validateRewards();

    if (!isPackageValid || !areCurrentRewardsValid) {
      return;
    }

    setRewardSectionError("");
    setOpenRewardTypeKey(null);
    setRewards((current) => [newReward(), ...current]);
    setRewardErrors((current) => [{}, ...current]);
  };

  const updateTask = (index: number, field: keyof DraftTask, value: string) => {
    setTasks((current) =>
      current.map((task, taskIndex) =>
        taskIndex === index
          ? {
              ...task,
              [field]: value,
            }
          : task
      )
    );

    setTaskErrors((current) =>
      current.map((error, errorIndex) =>
        errorIndex === index ? { ...error, [field]: undefined } : error
      )
    );
  };

  const updateReward = (index: number, field: keyof DraftReward, value: string) => {
    setRewards((current) =>
      current.map((reward, rewardIndex) =>
        rewardIndex === index
          ? {
              ...reward,
              [field]: value,
            }
          : reward
      )
    );

    setRewardErrors((current) =>
      current.map((error, errorIndex) =>
        errorIndex === index ? { ...error, [field]: undefined } : error
      )
    );
  };

  const deleteTask = (index: number) => {
    setOpenTaskTypeKey(null);
    setTasks((current) => current.filter((_, taskIndex) => taskIndex !== index));
    setTaskErrors((current) => current.filter((_, errorIndex) => errorIndex !== index));
  };

  const deleteReward = (index: number) => {
    setOpenRewardTypeKey(null);
    setRewards((current) => current.filter((_, rewardIndex) => rewardIndex !== index));
    setRewardErrors((current) => current.filter((_, errorIndex) => errorIndex !== index));
  };

  const submit = async () => {
    const isPackageValid = validatePackageInfo();
    const areTasksValid = validateTasks();
    const areRewardsValid = validateRewards();
    const hasTasks = tasks.length > 0;
    const hasRewards = rewards.length > 0;

    setTaskSectionError(hasTasks ? "" : "Add at least one task before creating the package.");
    setRewardSectionError(
      hasRewards ? "" : "Add at least one reward before creating the package."
    );

    if (!isPackageValid || !areTasksValid || !areRewardsValid || !hasTasks || !hasRewards) {
      return;
    }

    try {
      setIsSubmitting(true);

      await api.post("/packages", {
        title: title.trim(),
        ageGroup,
        description: description.trim(),
        tasks: tasks.map((task) => ({
          title: task.title.trim(),
          xp: Number(task.xp),
          rewardPoints: Number(task.rewardPoints),
          type: task.type.trim(),
        })),
        rewards: rewards.map((reward) => ({
          title: reward.title.trim(),
          price: Number(reward.price),
          type: reward.type.trim(),
        })),
      });

      router.replace("/(admin)/packages");
    } catch {
      Alert.alert("Create failed", "The package could not be created.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const ageGroupLabel = ageGroup
    ? `Age Group ${ageGroup}`
    : "Select age group";

  return (
    <View style={[s.screen, { backgroundColor: theme.colors.background }]}>
      <ImageBackground
        source={require("../../../../assets/images/AdminAppHeader.png")}
        resizeMode="cover"
        style={[s.topBar, { paddingTop: insets.top + 14 }]}
      >
        <View style={s.topBarContent}>
          <Pressable
            onPress={() => router.back()}
            style={[s.backButton, { backgroundColor: theme.colors.surfaceAlt }]}
          >
            <Ionicons name="arrow-back" size={22} color={theme.colors.text} />
          </Pressable>

          <View style={s.topBarText}>
            <Text style={[s.topBarTitle, { color: theme.colors.text }]}>Create Package</Text>
          </View>
        </View>
      </ImageBackground>

      <CurvedScreenBody>
      <ScrollView contentContainerStyle={s.content}>
        <View
          style={[
            s.sectionCard,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <Text style={[s.sectionTitle, { color: theme.colors.text }]}>Package Info</Text>

          <View>
            <TextInput
              placeholder="Title"
              placeholderTextColor={
                packageErrors.title ? theme.colors.error : theme.colors.textMuted
              }
              value={title}
              onChangeText={(value) => {
                setTitle(value);
                setPackageErrors((current) => ({ ...current, title: undefined }));
              }}
              style={[
                s.input,
                {
                  backgroundColor: theme.colors.surfaceAlt,
                  color: theme.colors.text,
                  borderColor: packageErrors.title ? theme.colors.error : "transparent",
                },
              ]}
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
                  borderColor: packageErrors.ageGroup ? theme.colors.error : "transparent",
                },
              ]}
            >
              <Text
                style={{
                  color: ageGroup ? theme.colors.text : theme.colors.textMuted,
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
                {ageOptions.map((option) => (
                  <Pressable
                    key={option}
                    onPress={() => {
                      setAgeGroup(option);
                      setPackageErrors((current) => ({ ...current, ageGroup: undefined }));
                      setIsAgeDropdownOpen(false);
                    }}
                    style={[
                      s.dropdownOption,
                      option === ageGroup && {
                        backgroundColor: theme.colors.primary,
                      },
                    ]}
                  >
                    <Text
                      style={{
                        color: theme.colors.text,
                        fontWeight: option === ageGroup ? "700" : "500",
                      }}
                    >
                      {option}
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
              placeholder="Description"
              placeholderTextColor={
                packageErrors.description ? theme.colors.error : theme.colors.textMuted
              }
              value={description}
              onChangeText={(value) => {
                setDescription(value);
                setPackageErrors((current) => ({ ...current, description: undefined }));
              }}
              multiline
              style={[
                s.input,
                s.multilineInput,
                {
                  backgroundColor: theme.colors.surfaceAlt,
                  color: theme.colors.text,
                  borderColor: packageErrors.description ? theme.colors.error : "transparent",
                },
              ]}
            />
            {packageErrors.description ? (
              <Text style={[s.errorText, { color: theme.colors.error }]}>
                {packageErrors.description}
              </Text>
            ) : null}
          </View>
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
            <Pressable
              onPress={handleAddTask}
              style={[s.addChip, { backgroundColor: theme.colors.primary }]}
            >
              <Text style={s.addChipText}>+ Add Task</Text>
            </Pressable>
          </View>

          {taskSectionError ? (
            <Text style={[s.errorText, { color: theme.colors.error }]}>{taskSectionError}</Text>
          ) : null}

          {tasks.length === 0 ? (
            <Text style={{ color: theme.colors.textMuted }}>
              No tasks yet. Start by adding your first task.
            </Text>
          ) : (
            tasks.map((task, index) => {
              const errors = taskErrors[index] ?? {};

              return (
                <View
                  key={`task-${index}`}
                  style={[s.itemCard, { backgroundColor: theme.colors.surfaceAlt }]}
                >
                  <View>
                    <TextInput
                      placeholder="Task title"
                      placeholderTextColor={errors.title ? theme.colors.error : theme.colors.textMuted}
                      value={task.title}
                      onChangeText={(value) => updateTask(index, "title", value)}
                      style={[
                        s.input,
                        {
                          backgroundColor: theme.colors.surface,
                          color: theme.colors.text,
                          borderColor: errors.title ? theme.colors.error : "transparent",
                        },
                      ]}
                    />
                    {errors.title ? (
                      <Text style={[s.errorText, { color: theme.colors.error }]}>
                        {errors.title}
                      </Text>
                    ) : null}
                  </View>

                  <View>
                    <TextInput
                      placeholder={errors.xp && !task.xp ? INTEGER_ERROR : "XP"}
                      placeholderTextColor={errors.xp ? theme.colors.error : theme.colors.textMuted}
                      value={task.xp}
                      keyboardType="number-pad"
                      onChangeText={(value) => updateTask(index, "xp", value)}
                      style={[
                        s.input,
                        {
                          backgroundColor: theme.colors.surface,
                          color: theme.colors.text,
                          borderColor: errors.xp ? theme.colors.error : "transparent",
                        },
                      ]}
                    />
                    {errors.xp && task.xp ? (
                      <Text style={[s.errorText, { color: theme.colors.error }]}>
                        {errors.xp}
                      </Text>
                    ) : null}
                  </View>

                  <View>
                    <TextInput
                      placeholder={
                        errors.rewardPoints && !task.rewardPoints
                          ? INTEGER_ERROR
                          : "Reward Points"
                      }
                      placeholderTextColor={
                        errors.rewardPoints ? theme.colors.error : theme.colors.textMuted
                      }
                      value={task.rewardPoints}
                      keyboardType="number-pad"
                      onChangeText={(value) => updateTask(index, "rewardPoints", value)}
                      style={[
                        s.input,
                        {
                          backgroundColor: theme.colors.surface,
                          color: theme.colors.text,
                          borderColor: errors.rewardPoints
                            ? theme.colors.error
                            : "transparent",
                        },
                      ]}
                    />
                    {errors.rewardPoints && task.rewardPoints ? (
                      <Text style={[s.errorText, { color: theme.colors.error }]}>
                        {errors.rewardPoints}
                      </Text>
                    ) : null}
                  </View>

                  <View>
                    <Pressable
                      onPress={() =>
                        setOpenTaskTypeKey((current) =>
                          current === `task-${index}` ? null : `task-${index}`
                        )
                      }
                      style={[
                        s.selectField,
                        {
                          backgroundColor: theme.colors.surface,
                          borderColor: errors.type ? theme.colors.error : "transparent",
                        },
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
                        name={openTaskTypeKey === `task-${index}` ? "chevron-up" : "chevron-down"}
                        size={18}
                        color={theme.colors.textMuted}
                      />
                    </Pressable>
                    {openTaskTypeKey === `task-${index}` ? (
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
                              setOpenTaskTypeKey(null);
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
                    {errors.type ? (
                      <Text style={[s.errorText, { color: theme.colors.error }]}>
                        {errors.type}
                      </Text>
                    ) : null}
                  </View>

                  <View style={s.previewRow}>
                    <View style={[s.typeBadge, { backgroundColor: theme.colors.surface }]}>
                      <Text style={[s.typeBadgeText, { color: theme.colors.textMuted }]}>
                        {task.type ? formatItemTypeLabel(task.type) : "Type"}
                      </Text>
                    </View>

                    <View style={s.previewRightSide}>
                      <View style={s.metricGroup}>
                        <View style={s.metricItem}>
                          <Text style={[s.metricValue, { color: theme.colors.text }]}>
                            {task.xp.trim() || "-"}
                          </Text>
                          <Image
                            source={require("../../../../assets/icons/xp.png")}
                            style={s.metricIcon}
                          />
                        </View>

                        <View style={s.metricItem}>
                          <Text style={[s.metricValue, { color: theme.colors.text }]}>
                            {task.rewardPoints.trim() || "-"}
                          </Text>
                          <Image
                            source={require("../../../../assets/icons/reward_points.png")}
                            style={s.metricIcon}
                          />
                        </View>
                      </View>

                      <Pressable onPress={() => deleteTask(index)} style={s.iconButton} hitSlop={8}>
                        <Image
                          source={require("../../../../assets/button_icons/delete.png")}
                          style={s.iconImage}
                        />
                      </Pressable>
                    </View>
                  </View>
                </View>
              );
            })
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
            <Text style={[s.sectionTitle, { color: theme.colors.text }]}>Rewards</Text>
            <Pressable
              onPress={handleAddReward}
              style={[s.addChip, { backgroundColor: theme.colors.primary }]}
            >
              <Text style={s.addChipText}>+ Add Reward</Text>
            </Pressable>
          </View>

          {rewardSectionError ? (
            <Text style={[s.errorText, { color: theme.colors.error }]}>
              {rewardSectionError}
            </Text>
          ) : null}

          {rewards.length === 0 ? (
            <Text style={{ color: theme.colors.textMuted }}>
              No rewards yet. Start by adding your first reward.
            </Text>
          ) : (
            rewards.map((reward, index) => {
              const errors = rewardErrors[index] ?? {};
              const rewardImage = getRewardImage(reward.type);

              return (
                <View
                  key={`reward-${index}`}
                  style={[s.rewardCard, { backgroundColor: theme.colors.surfaceAlt }]}
                >
                  <View style={[s.rewardImageFrame, { backgroundColor: theme.colors.surface }]}>
                    <Image source={rewardImage} style={s.rewardImage} />
                  </View>

                  <View style={s.rewardContent}>
                    <View>
                      <TextInput
                        placeholder="Reward title"
                        placeholderTextColor={
                          errors.title ? theme.colors.error : theme.colors.textMuted
                        }
                        value={reward.title}
                        onChangeText={(value) => updateReward(index, "title", value)}
                        style={[
                          s.input,
                          {
                            backgroundColor: theme.colors.surface,
                            color: theme.colors.text,
                            borderColor: errors.title ? theme.colors.error : "transparent",
                          },
                        ]}
                      />
                      {errors.title ? (
                        <Text style={[s.errorText, { color: theme.colors.error }]}>
                          {errors.title}
                        </Text>
                      ) : null}
                    </View>

                    <View>
                      <TextInput
                        placeholder={errors.price && !reward.price ? INTEGER_ERROR : "Price"}
                        placeholderTextColor={
                          errors.price ? theme.colors.error : theme.colors.textMuted
                        }
                        value={reward.price}
                        keyboardType="number-pad"
                        onChangeText={(value) => updateReward(index, "price", value)}
                        style={[
                          s.input,
                          {
                            backgroundColor: theme.colors.surface,
                            color: theme.colors.text,
                            borderColor: errors.price ? theme.colors.error : "transparent",
                          },
                        ]}
                      />
                      {errors.price && reward.price ? (
                        <Text style={[s.errorText, { color: theme.colors.error }]}>
                          {errors.price}
                        </Text>
                      ) : null}
                    </View>

                    <View>
                      <Pressable
                        onPress={() =>
                          setOpenRewardTypeKey((current) =>
                            current === `reward-${index}` ? null : `reward-${index}`
                          )
                        }
                        style={[
                          s.selectField,
                          {
                            backgroundColor: theme.colors.surface,
                            borderColor: errors.type ? theme.colors.error : "transparent",
                          },
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
                          name={
                            openRewardTypeKey === `reward-${index}` ? "chevron-up" : "chevron-down"
                          }
                          size={18}
                          color={theme.colors.textMuted}
                        />
                      </Pressable>
                      {openRewardTypeKey === `reward-${index}` ? (
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
                                setOpenRewardTypeKey(null);
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
                      {errors.type ? (
                        <Text style={[s.errorText, { color: theme.colors.error }]}>
                          {errors.type}
                        </Text>
                      ) : null}
                    </View>

                    <View style={s.previewRow}>
                      <View style={[s.typeBadge, { backgroundColor: theme.colors.surface }]}>
                        <Text style={[s.typeBadgeText, { color: theme.colors.textMuted }]}>
                          {reward.type ? formatItemTypeLabel(reward.type) : "Type"}
                        </Text>
                      </View>

                      <View style={s.previewRightSide}>
                        <View style={s.metricItem}>
                          <Text style={[s.metricValue, { color: theme.colors.text }]}>
                            {reward.price.trim() || "-"}
                          </Text>
                          <Image
                            source={require("../../../../assets/icons/reward_points.png")}
                            style={s.metricIcon}
                          />
                        </View>

                        <Pressable
                          onPress={() => deleteReward(index)}
                          style={s.iconButton}
                          hitSlop={8}
                        >
                          <Image
                            source={require("../../../../assets/button_icons/delete.png")}
                            style={s.iconImage}
                          />
                        </Pressable>
                      </View>
                    </View>
                  </View>
                </View>
              );
            })
          )}
        </View>

        <Pressable
          style={[s.submitButton, { backgroundColor: theme.colors.primary }]}
          onPress={submit}
          disabled={isSubmitting}
        >
          <Text style={s.submitText}>
            {isSubmitting ? "Creating..." : "Create Package"}
          </Text>
        </Pressable>
      </ScrollView>
      </CurvedScreenBody>
    </View>
  );
}

const s = StyleSheet.create({
  screen: {
    flex: 1,
  },
  topBar: {
    paddingBottom: 34,
    paddingHorizontal: 20,
  },
  topBarContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    minHeight: 42,
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
    paddingTop: 28,
    paddingBottom: 32,
    gap: 16,
  },
  sectionCard: {
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    gap: 12,
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
  input: {
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    fontSize: 16,
  },
  multilineInput: {
    minHeight: 110,
    textAlignVertical: "top",
  },
  selectField: {
    minHeight: 48,
    borderRadius: 12,
    borderWidth: 1,
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
    gap: 10,
  },
  rewardCard: {
    borderRadius: 14,
    padding: 14,
    gap: 12,
  },
  rewardImageFrame: {
    width: 64,
    height: 64,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  rewardImage: {
    width: 56,
    height: 56,
    resizeMode: "cover",
    borderRadius: 16,
  },
  rewardContent: {
    gap: 10,
  },
  previewRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  previewRightSide: {
    flexDirection: "row",
    alignItems: "center",
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
  errorText: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: "600",
  },
  submitButton: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  submitText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 16,
  },
});
