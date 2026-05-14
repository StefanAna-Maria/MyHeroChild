import { useCallback, useMemo, useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import CalendarPickerModal from "../../../../components/CalendarPickerModal";
import { api } from "../../../../src/services/api";
import { useTheme } from "../../../../src/context/ThemeContext";
import { getRewardImage } from "../../../../constants/rewardImages";
import { PackageItem, RewardItem, TaskItem } from "../../../../constants/parentCatalogue";

type Mode = "tasks" | "rewards";

type SelectionState = {
  sourceType: string;
  sourceId: number;
  startDate: string;
  endDate: string;
};

type ChildSummary = {
  id: number;
  username: string;
  avatar: string;
  level: number;
  assignedTasksCount: number;
  availableRewardsCount: number;
};

const DATE_ERROR = "Use YYYY-MM-DD";
const isValidDate = (value: string) => !Number.isNaN(new Date(`${value}T00:00:00`).getTime());

const compareDateStrings = (startDate: string, endDate: string) =>
  new Date(`${startDate}T00:00:00`).getTime() <= new Date(`${endDate}T00:00:00`).getTime();

const formatDisplayDate = (value: string) => {
  if (!value) {
    return "";
  }

  return new Date(`${value}T00:00:00`).toLocaleDateString("en-GB");
};

export default function AssignItemsScreen() {
  const { childId, mode, childName } = useLocalSearchParams<{
    childId: string;
    mode: Mode;
    childName?: string;
  }>();
  const router = useRouter();
  const theme = useTheme();

  const [child, setChild] = useState<ChildSummary | null>(null);
  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [customTasks, setCustomTasks] = useState<TaskItem[]>([]);
  const [customRewards, setCustomRewards] = useState<RewardItem[]>([]);
  const [expandedPackages, setExpandedPackages] = useState<number[]>([]);
  const [selections, setSelections] = useState<Record<string, SelectionState>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [calendarTarget, setCalendarTarget] = useState<{
    sourceType: string;
    sourceId: number;
    field: "startDate" | "endDate";
  } | null>(null);

  const currentMode: Mode = mode === "rewards" ? "rewards" : "tasks";

  const screenTitle =
    currentMode === "tasks" ? "Assign Tasks" : "Activate Rewards";
  const screenSubtitle =
    currentMode === "tasks"
      ? "Choose tasks from My Tasks or from package contents."
      : "Choose rewards from My Rewards or from package contents.";
  const confirmButtonText =
    currentMode === "tasks" ? "Confirm task selection" : "Confirm reward selection";

  const fetchData = useCallback(async () => {
    const requests =
      currentMode === "tasks"
        ? [
            api.get("/parent/distribution/children"),
            api.get("/parent/catalog/tasks"),
            api.get("/parent/catalog/packages"),
          ]
        : [
            api.get("/parent/distribution/children"),
            api.get("/parent/catalog/rewards"),
            api.get("/parent/catalog/packages"),
          ];

    const [childrenRes, customRes, packagesRes] = await Promise.all(requests);
    const children: ChildSummary[] = childrenRes.data.data;

    setChild(children.find((item) => String(item.id) === String(childId)) ?? null);
    setPackages(packagesRes.data.data);

    if (currentMode === "tasks") {
      setCustomTasks(customRes.data.data);
    } else {
      setCustomRewards(customRes.data.data);
    }
  }, [childId, currentMode]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  const togglePackage = (packageId: number) => {
    setExpandedPackages((current) =>
      current.includes(packageId)
        ? current.filter((id) => id !== packageId)
        : [...current, packageId]
    );
  };

  const buildSelectionKey = (sourceType: string, sourceId: number) => `${sourceType}:${sourceId}`;

  const isSelected = (sourceType: string, sourceId: number) =>
    Boolean(selections[buildSelectionKey(sourceType, sourceId)]);

  const toggleSelection = (sourceType: string, sourceId: number) => {
    const key = buildSelectionKey(sourceType, sourceId);

    setSelections((current) => {
      if (current[key]) {
        const next = { ...current };
        delete next[key];
        return next;
      }

      return {
        ...current,
        [key]: {
          sourceType,
          sourceId,
          startDate: "",
          endDate: "",
        },
      };
    });

    setValidationErrors((current) => {
      const next = { ...current };
      delete next[key];
      return next;
    });
  };

  const updateSelectionField = (
    sourceType: string,
    sourceId: number,
    field: "startDate" | "endDate",
    value: string
  ) => {
    const key = buildSelectionKey(sourceType, sourceId);

    setSelections((current) => ({
      ...current,
      [key]: {
        ...current[key],
        [field]: value,
      },
    }));

    setValidationErrors((current) => {
      const next = { ...current };
      delete next[key];
      return next;
    });
  };

  const validateSelections = () => {
    const keys = Object.keys(selections);
    if (keys.length === 0) {
      Alert.alert("Selection needed", "Select at least one item before confirming.");
      return false;
    }

    const nextErrors: Record<string, string> = {};

    for (const key of keys) {
      const selection = selections[key];

      if (!isValidDate(selection.startDate) || !isValidDate(selection.endDate)) {
        nextErrors[key] = DATE_ERROR;
        continue;
      }

      if (!compareDateStrings(selection.startDate, selection.endDate)) {
        nextErrors[key] = "End date must be after start date";
      }
    }

    setValidationErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const handleConfirm = async () => {
    if (!validateSelections()) {
      return;
    }

    try {
      setIsSubmitting(true);

      const payload = {
        selections: Object.values(selections),
      };

      if (currentMode === "tasks") {
        await api.post(`/parent/distribution/children/${childId}/tasks`, payload);
      } else {
        await api.post(`/parent/distribution/children/${childId}/rewards`, payload);
      }

      Alert.alert(
        "Success",
        currentMode === "tasks"
          ? "Tasks were assigned successfully."
          : "Rewards were activated successfully."
      );
      router.back();
    } catch (error: any) {
      const message =
        error?.response?.data?.message ?? "The selected items could not be distributed.";
      Alert.alert("Action failed", message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedCount = Object.keys(selections).length;
  const headerName = child?.username ?? childName ?? "Child";

  const packageCards = useMemo(() => packages, [packages]);

  const renderDateInputs = (sourceType: string, sourceId: number) => {
    const key = buildSelectionKey(sourceType, sourceId);
    const selection = selections[key];

    if (!selection) {
      return null;
    }

    return (
      <View style={s.dateSection}>
        <View style={s.dateRow}>
          <Pressable
            onPress={() =>
              setCalendarTarget({
                sourceType,
                sourceId,
                field: "startDate",
              })
            }
            style={[
              s.dateInput,
              {
                backgroundColor: theme.colors.surface,
                borderColor: validationErrors[key] ? theme.colors.error : theme.colors.border,
              },
            ]}
          >
            <Text
              style={{
                color: selection.startDate ? theme.colors.text : theme.colors.textMuted,
              }}
            >
              {selection.startDate ? formatDisplayDate(selection.startDate) : "Select start date"}
            </Text>
          </Pressable>

          <Pressable
            onPress={() =>
              setCalendarTarget({
                sourceType,
                sourceId,
                field: "endDate",
              })
            }
            style={[
              s.dateInput,
              {
                backgroundColor: theme.colors.surface,
                borderColor: validationErrors[key] ? theme.colors.error : theme.colors.border,
              },
            ]}
          >
            <Text
              style={{
                color: selection.endDate ? theme.colors.text : theme.colors.textMuted,
              }}
            >
              {selection.endDate ? formatDisplayDate(selection.endDate) : "Select end date"}
            </Text>
          </Pressable>
        </View>

        {validationErrors[key] ? (
          <Text style={[s.errorText, { color: theme.colors.error }]}>{validationErrors[key]}</Text>
        ) : null}
      </View>
    );
  };

  const renderTaskCard = (
    task: TaskItem,
    sourceType: "CUSTOM_TASK" | "PACKAGE_TASK",
    backgroundColor: string
  ) => {
    const selected = isSelected(sourceType, task.id);

    return (
      <View
        key={`${sourceType}-${task.id}`}
        style={[
          s.itemCard,
          {
            backgroundColor,
            borderColor: selected ? theme.colors.tabIconActive : "transparent",
          },
        ]}
      >
        <View style={s.itemHeader}>
          <Text style={[s.itemTitle, { color: theme.colors.text }]}>{task.title}</Text>
          <Pressable
            style={[
              s.selectButton,
              {
                backgroundColor: selected ? theme.colors.accent : theme.colors.tabIconActive,
              },
            ]}
            onPress={() => toggleSelection(sourceType, task.id)}
          >
            <Text style={s.selectButtonText}>{selected ? "Selected" : "Select"}</Text>
          </Pressable>
        </View>

        <View style={s.infoRow}>
          <View style={[s.typeBadge, { backgroundColor: theme.colors.primary }]}>
            <Text style={[s.typeBadgeText, { color: theme.colors.textMuted }]}>
              {task.type || "-"}
            </Text>
          </View>

          <View style={s.metricGroup}>
            <View style={s.metricItem}>
              <Text style={[s.metricValue, { color: theme.colors.text }]}>{task.xp}</Text>
              <Image source={require("../../../../assets/icons/xp.png")} style={s.metricIcon} />
            </View>

            <View style={s.metricItem}>
              <Text style={[s.metricValue, { color: theme.colors.text }]}>{task.rewardPoints}</Text>
              <Image
                source={require("../../../../assets/icons/reward_points.png")}
                style={s.metricIcon}
              />
            </View>
          </View>
        </View>

        {selected ? renderDateInputs(sourceType, task.id) : null}
      </View>
    );
  };

  const renderRewardCard = (
    reward: RewardItem,
    sourceType: "CUSTOM_REWARD" | "PACKAGE_REWARD",
    backgroundColor: string
  ) => {
    const selected = isSelected(sourceType, reward.id);

    return (
      <View
        key={`${sourceType}-${reward.id}`}
        style={[
          s.rewardCard,
          {
            backgroundColor,
            borderColor: selected ? theme.colors.tabIconActive : "transparent",
          },
        ]}
      >
        <Image source={getRewardImage(reward.type)} style={s.rewardImage} />

        <View style={s.rewardTextWrap}>
          <View style={s.itemHeader}>
            <Text style={[s.itemTitle, { color: theme.colors.text }]}>{reward.title}</Text>
            <Pressable
              style={[
                s.selectButton,
                {
                  backgroundColor: selected ? theme.colors.accent : theme.colors.tabIconActive,
                },
              ]}
              onPress={() => toggleSelection(sourceType, reward.id)}
            >
              <Text style={s.selectButtonText}>{selected ? "Selected" : "Select"}</Text>
            </Pressable>
          </View>

          <View style={s.infoRow}>
            <View style={[s.typeBadge, { backgroundColor: theme.colors.primary }]}>
              <Text style={[s.typeBadgeText, { color: theme.colors.textMuted }]}>
                {reward.type || "-"}
              </Text>
            </View>

            <View style={s.metricItem}>
              <Text style={[s.metricValue, { color: theme.colors.text }]}>{reward.price}</Text>
              <Image
                source={require("../../../../assets/icons/reward_points.png")}
                style={s.metricIcon}
              />
            </View>
          </View>

          {selected ? renderDateInputs(sourceType, reward.id) : null}
        </View>
      </View>
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

        <View style={s.topBarText}>
          <Text style={[s.topBarTitle, { color: theme.colors.text }]}>{screenTitle}</Text>
          <Text style={{ color: theme.colors.textMuted }}>{headerName}</Text>
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
          <Text style={[s.heroTitle, { color: theme.colors.text }]}>{screenTitle}</Text>
          <Text style={{ color: theme.colors.textMuted }}>{screenSubtitle}</Text>
          <Text style={[s.selectedText, { color: theme.colors.text }]}>
            {selectedCount} item{selectedCount === 1 ? "" : "s"} selected
          </Text>
        </View>

        <View
          style={[
            s.sectionCard,
            {
              backgroundColor: theme.colors.primary,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <Text style={[s.sectionTitle, { color: theme.colors.text }]}>
            {currentMode === "tasks" ? "My Tasks" : "My Rewards"}
          </Text>

          {currentMode === "tasks"
            ? customTasks.map((task) => renderTaskCard(task, "CUSTOM_TASK", theme.colors.surfaceAlt))
            : customRewards.map((reward) =>
                renderRewardCard(reward, "CUSTOM_REWARD", theme.colors.surfaceAlt)
              )}

          {(currentMode === "tasks" ? customTasks.length === 0 : customRewards.length === 0) ? (
            <Text style={{ color: theme.colors.textMuted }}>
              {currentMode === "tasks"
                ? "No custom tasks available in My Tasks."
                : "No custom rewards available in My Rewards."}
            </Text>
          ) : null}
        </View>

        <View
          style={[
            s.sectionCard,
            {
              backgroundColor: theme.colors.primary,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <Text style={[s.sectionTitle, { color: theme.colors.text }]}>Packages</Text>

          {packageCards.length === 0 ? (
            <Text style={{ color: theme.colors.textMuted }}>
              No catalogue packages are available yet.
            </Text>
          ) : (
            packageCards.map((pkg) => {
              const isExpanded = expandedPackages.includes(pkg.id);
              const itemCount = currentMode === "tasks" ? pkg.tasks.length : pkg.rewards.length;

              return (
                <View
                  key={pkg.id}
                  style={[
                    s.packageCard,
                    {
                      backgroundColor: theme.colors.surfaceAlt,
                      borderColor: theme.colors.border,
                    },
                  ]}
                >
                  <Pressable style={s.packageHeader} onPress={() => togglePackage(pkg.id)}>
                    <View style={s.packageTextWrap}>
                      <Text style={[s.packageTitle, { color: theme.colors.text }]}>{pkg.title}</Text>
                      <Text style={{ color: theme.colors.textMuted }}>
                        {pkg.description || "No description provided."}
                      </Text>
                    </View>

                    <View style={s.packageRight}>
                      <View
                        style={[
                          s.countBadge,
                          { backgroundColor: theme.colors.tabIconActive },
                        ]}
                      >
                        <Text style={s.countBadgeText}>{itemCount}</Text>
                      </View>
                      <Ionicons
                        name={isExpanded ? "chevron-up" : "chevron-down"}
                        size={20}
                        color={theme.colors.text}
                      />
                    </View>
                  </Pressable>

                  {isExpanded ? (
                    <View style={s.packageItems}>
                      {currentMode === "tasks"
                        ? pkg.tasks.map((task) =>
                            renderTaskCard(task, "PACKAGE_TASK", theme.colors.surface)
                          )
                        : pkg.rewards.map((reward) =>
                            renderRewardCard(reward, "PACKAGE_REWARD", theme.colors.surface)
                          )}

                      {itemCount === 0 ? (
                        <Text style={{ color: theme.colors.textMuted }}>
                          {currentMode === "tasks"
                            ? "This package does not contain any tasks."
                            : "This package does not contain any rewards."}
                        </Text>
                      ) : null}
                    </View>
                  ) : null}
                </View>
              );
            })
          )}
        </View>

        <Pressable
          style={[
            s.confirmButton,
            {
              backgroundColor: theme.colors.tabIconActive,
              opacity: isSubmitting ? 0.7 : 1,
            },
          ]}
          onPress={handleConfirm}
          disabled={isSubmitting}
        >
          <Text style={s.confirmButtonText}>
            {isSubmitting ? "Saving..." : confirmButtonText}
          </Text>
        </Pressable>
      </ScrollView>

      <CalendarPickerModal
        visible={Boolean(calendarTarget)}
        selectedDate={
          calendarTarget
            ? selections[
                buildSelectionKey(calendarTarget.sourceType, calendarTarget.sourceId)
              ]?.[calendarTarget.field]
            : undefined
        }
        onClose={() => setCalendarTarget(null)}
        onSelect={(value) => {
          if (!calendarTarget) {
            return;
          }

          updateSelectionField(
            calendarTarget.sourceType,
            calendarTarget.sourceId,
            calendarTarget.field,
            value
          );
        }}
      />
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
  selectedText: {
    marginTop: 2,
    fontWeight: "700",
  },
  sectionCard: {
    borderRadius: 18,
    padding: 16,
    gap: 12,
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
  },
  itemCard: {
    borderRadius: 14,
    padding: 14,
    gap: 8,
    borderWidth: 1,
  },
  rewardCard: {
    borderRadius: 14,
    padding: 14,
    gap: 12,
    borderWidth: 1,
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
  itemHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  itemTitle: {
    fontSize: 17,
    fontWeight: "700",
    flex: 1,
  },
  selectButton: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 78,
    alignItems: "center",
  },
  selectButtonText: {
    color: "#FFFFFF",
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
  dateSection: {
    gap: 6,
  },
  dateRow: {
    flexDirection: "row",
    gap: 10,
  },
  dateInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 44,
    justifyContent: "center",
  },
  errorText: {
    fontSize: 12,
    fontWeight: "600",
  },
  packageCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    gap: 12,
  },
  packageHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  packageTextWrap: {
    flex: 1,
    gap: 4,
  },
  packageTitle: {
    fontSize: 18,
    fontWeight: "800",
  },
  packageRight: {
    alignItems: "center",
    gap: 8,
  },
  countBadge: {
    minWidth: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  countBadgeText: {
    color: "#FFFFFF",
    fontWeight: "800",
  },
  packageItems: {
    gap: 10,
  },
  confirmButton: {
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmButtonText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 16,
  },
});
