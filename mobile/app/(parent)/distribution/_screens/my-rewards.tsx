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
import { RewardItem } from "../../../../constants/parentCatalogue";
import { formatItemTypeLabel, REWARD_TYPE_OPTIONS } from "../../../../constants/itemTypes";
import { getRewardImage } from "../../../../constants/rewardImages";

type FormErrors = {
  title?: string;
  price?: string;
  type?: string;
};

const INTEGER_ERROR = "This area must contain an integer number";

const isNaturalNumber = (value: string) => /^(0|[1-9]\d*)$/.test(value.trim());

export default function DistributionMyRewardsScreen() {
  const router = useRouter();
  const theme = useTheme();
  const [rewards, setRewards] = useState<RewardItem[]>([]);
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [type, setType] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  const visibleRewards = editingId
    ? rewards.filter((reward) => reward.id !== editingId)
    : rewards;

  const loadRewards = useCallback(async () => {
    const res = await api.get("/parent/catalog/rewards");
    setRewards(res.data.data);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadRewards();
    }, [loadRewards])
  );

  const resetForm = () => {
    setTitle("");
    setPrice("");
    setType("");
    setEditingId(null);
    setIsFormVisible(false);
    setErrors({});
    setIsTypeDropdownOpen(false);
  };

  const validateForm = () => {
    const nextErrors: FormErrors = {};

    if (!title.trim()) {
      nextErrors.title = "This field is required.";
    }

    if (!type.trim()) {
      nextErrors.type = "This field is required.";
    }

    if (!isNaturalNumber(price)) {
      nextErrors.price = INTEGER_ERROR;
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleCreate = () => {
    setTitle("");
    setPrice("");
    setType("");
    setEditingId(null);
    setErrors({});
    setIsFormVisible(true);
    setIsTypeDropdownOpen(false);
  };

  const handleEdit = (reward: RewardItem) => {
    setTitle(reward.title);
    setPrice(String(reward.price));
    setType(reward.type ?? "");
    setEditingId(reward.id);
    setErrors({});
    setIsFormVisible(true);
    setIsTypeDropdownOpen(false);
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    const payload = {
      title: title.trim(),
      price: Number(price),
      type: type.trim(),
    };

    if (editingId) {
      await api.put(`/parent/catalog/rewards/${editingId}`, payload);
    } else {
      await api.post("/parent/catalog/rewards", payload);
    }

    await loadRewards();
    resetForm();
  };

  const handleDelete = (reward: RewardItem) => {
    Alert.alert(
      "Delete reward",
      `Delete "${reward.title}" from My Rewards?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await api.delete(`/parent/catalog/rewards/${reward.id}`);
            await loadRewards();
            if (editingId === reward.id) {
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

        <Text style={[s.topBarTitle, { color: theme.colors.text }]}>My Rewards</Text>
      </View>

      <ScrollView contentContainerStyle={s.content}>
        <Pressable
          style={[s.newButton, { backgroundColor: theme.colors.tabIconActive }]}
          onPress={handleCreate}
        >
          <Text style={s.newButtonText}>New Custom Reward</Text>
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
              {editingId ? "Edit Custom Reward" : "Create Custom Reward"}
            </Text>

            <View>
              <TextInput
                placeholder="Reward title"
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
                placeholder={errors.price && !price ? INTEGER_ERROR : "Price"}
                placeholderTextColor={errors.price ? theme.colors.error : theme.colors.textMuted}
                value={price}
                onChangeText={(value) => {
                  setPrice(value);
                  setErrors((current) => ({ ...current, price: undefined }));
                }}
                keyboardType="number-pad"
                style={[
                  s.input,
                  {
                    color: theme.colors.text,
                    borderColor: errors.price ? theme.colors.error : theme.colors.border,
                  },
                ]}
              />
              {errors.price && price ? (
                <Text style={[s.errorText, { color: theme.colors.error }]}>{errors.price}</Text>
              ) : null}
            </View>

            <View>
              <Pressable
                onPress={() => setIsTypeDropdownOpen((current) => !current)}
                style={[
                  s.selectField,
                  {
                    borderColor: errors.type ? theme.colors.error : theme.colors.border,
                  },
                ]}
              >
                <Text style={{ color: type ? theme.colors.text : theme.colors.textMuted, fontSize: 16 }}>
                  {type ? formatItemTypeLabel(type) : "Select type"}
                </Text>
                <Ionicons
                  name={isTypeDropdownOpen ? "chevron-up" : "chevron-down"}
                  size={18}
                  color={theme.colors.textMuted}
                />
              </Pressable>
              {isTypeDropdownOpen ? (
                <View
                  style={[
                    s.dropdown,
                    {
                      backgroundColor: theme.colors.surfaceAlt,
                      borderColor: theme.colors.border,
                    },
                  ]}
                >
                  {REWARD_TYPE_OPTIONS.map((option) => (
                    <Pressable
                      key={option}
                      onPress={() => {
                        setType(option);
                        setErrors((current) => ({ ...current, type: undefined }));
                        setIsTypeDropdownOpen(false);
                      }}
                      style={[
                        s.dropdownOption,
                        option === type && { backgroundColor: theme.colors.tabIconActive },
                      ]}
                    >
                      <Text style={{ color: theme.colors.text, fontWeight: option === type ? "700" : "500" }}>
                        {formatItemTypeLabel(option)}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              ) : null}
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

        {visibleRewards.length === 0 ? (
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
              No custom rewards yet. Create your first one from the button above.
            </Text>
          </View>
        ) : (
          visibleRewards.map((reward) => {
            const rewardImage = getRewardImage(reward.type);

            return (
              <View
                key={reward.id}
                style={[
                  s.itemCard,
                  {
                    backgroundColor: theme.colors.primary,
                    borderColor: theme.colors.border,
                  },
                ]}
              >
                <View style={s.iconActions}>
                  <Pressable onPress={() => handleEdit(reward)} style={s.iconButton} hitSlop={8}>
                    <Image
                      source={require("../../../../assets/button_icons/edit.png")}
                      style={s.iconImage}
                    />
                  </Pressable>
                  <Pressable onPress={() => handleDelete(reward)} style={s.iconButton} hitSlop={8}>
                    <Image
                      source={require("../../../../assets/button_icons/delete.png")}
                      style={s.iconImage}
                    />
                  </Pressable>
                </View>

                <View style={s.rewardTopRow}>
                  <Image source={rewardImage} style={s.rewardImage} />
                  <View style={s.rewardTextWrap}>
                    <Text style={[s.itemTitle, { color: theme.colors.text }]}>
                      {reward.title}
                    </Text>
                  </View>
                </View>

                <View style={s.infoRow}>
                  <View style={[s.typeBadge, { backgroundColor: theme.colors.surfaceAlt }]}>
                    <Text style={[s.typeBadgeText, { color: theme.colors.textMuted }]}>
                      {formatItemTypeLabel(reward.type)}
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
            );
          })
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
  selectField: {
    minHeight: 64,
    borderRadius: 18,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#ffffff",
    borderWidth: 1,
  },
  dropdown: {
    marginTop: 10,
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  dropdownOption: {
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  itemCard: {
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    gap: 10,
    position: "relative",
  },
  rewardTopRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    paddingRight: 60,
  },
  rewardImage: {
    width: 56,
    height: 56,
    resizeMode: "cover",
    borderRadius: 28,
  },
  rewardTextWrap: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: "800",
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
