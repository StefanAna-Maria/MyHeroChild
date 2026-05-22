import { useCallback, useState } from "react";
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { formatItemTypeLabel, REWARD_TYPE_OPTIONS } from "../../constants/itemTypes";
import { api } from "../../src/services/api";
import { useTheme } from "../../src/context/ThemeContext";

type WishlistReward = {
  id: number;
  title: string;
  type: string;
};

type WishlistResponse = {
  childId: number;
  childName: string;
  rewards: WishlistReward[];
};

const INTEGER_ERROR = "This area must contain an integer number";
const isNaturalNumber = (value: string) => /^(0|[1-9]\d*)$/.test(value.trim());

export default function ParentChildWishlistScreen() {
  const theme = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ childId?: string; childName?: string }>();
  const childId = Number(params.childId);
  const [data, setData] = useState<WishlistResponse | null>(null);
  const [rewardToAdd, setRewardToAdd] = useState<WishlistReward | null>(null);
  const [price, setPrice] = useState("");
  const [type, setType] = useState("");
  const [errors, setErrors] = useState<{ price?: string; type?: string }>({});
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  const [savingRewardId, setSavingRewardId] = useState<number | null>(null);

  const loadWishlist = useCallback(async () => {
    if (!Number.isFinite(childId)) return;
    const response = await api.get(`/parent/profile/children/${childId}/wishlist`);
    setData(response.data.data);
  }, [childId]);

  useFocusEffect(useCallback(() => { loadWishlist(); }, [loadWishlist]));

  const closeAddModal = () => {
    setRewardToAdd(null);
    setPrice("");
    setType("");
    setErrors({});
    setIsTypeDropdownOpen(false);
  };

  const saveToCatalogue = async () => {
    if (!data || !rewardToAdd) return;

    const nextErrors: { price?: string; type?: string } = {};
    if (!isNaturalNumber(price)) {
      nextErrors.price = INTEGER_ERROR;
    }
    if (!type.trim()) {
      nextErrors.type = "This field is required.";
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    try {
      setSavingRewardId(rewardToAdd.id);
      await api.post(
        `/parent/profile/children/${data.childId}/wishlist/${rewardToAdd.id}/catalog-reward`,
        { price: Number(price), type }
      );
      await loadWishlist();
      closeAddModal();
    } catch (error: any) {
      Alert.alert("Save failed", error?.response?.data?.message ?? "The wishlist reward could not be added.");
    } finally {
      setSavingRewardId(null);
    }
  };

  return (
    <View style={[s.screen, { backgroundColor: theme.colors.background }]}>
      <View style={[s.header, { backgroundColor: theme.colors.surface }]}>
        <Pressable onPress={() => router.back()} style={[s.backButton, { backgroundColor: theme.colors.surfaceAlt }]}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </Pressable>
        <View style={s.headerTextWrap}>
          <Text style={[s.headerTitle, { color: theme.colors.text }]}>
            {data?.childName ?? params.childName ?? "Child"}&apos;s Wishlist
          </Text>
          <Text style={[s.headerSubtitle, { color: theme.colors.textMuted }]}>
            Choose which wishes you want to add to My Rewards.
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={s.content}>
        {!data || data.rewards.length === 0 ? (
          <View style={[s.emptyCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            <Text style={[s.emptyTitle, { color: theme.colors.text }]}>No wishlist items right now</Text>
            <Text style={[s.emptyText, { color: theme.colors.textMuted }]}>
              New wishes from this child will appear here automatically.
            </Text>
          </View>
        ) : (
          data.rewards.map((reward) => (
            <View key={reward.id} style={[s.rewardCard, { backgroundColor: theme.colors.primary, borderColor: theme.colors.border }]}>
              <View style={s.rewardContent}>
                <Text style={[s.rewardTitle, { color: theme.colors.text }]}>{reward.title}</Text>
              </View>
              <Pressable onPress={() => setRewardToAdd(reward)} style={[s.addButton, { backgroundColor: theme.colors.accent }]}>
                <Text style={s.addButtonText}>Add</Text>
              </Pressable>
            </View>
          ))
        )}
      </ScrollView>

      <Modal visible={Boolean(rewardToAdd)} transparent animationType="fade" onRequestClose={closeAddModal}>
        <View style={s.modalBackdrop}>
          <View style={[s.modalCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            <Pressable onPress={closeAddModal} style={s.modalCloseButton} hitSlop={8}>
              <Ionicons name="close" size={22} color={theme.colors.text} />
            </Pressable>
            <Text style={[s.modalTitle, { color: theme.colors.text }]}>Save to My Catalogue</Text>
            <Text style={[s.modalSubtitle, { color: theme.colors.textMuted }]}>
              {rewardToAdd?.title ?? "This reward"} will be added to your custom rewards.
            </Text>

            <TextInput
              value={price}
              onChangeText={(value) => {
                setPrice(value);
                setErrors((current) => ({ ...current, price: undefined }));
              }}
              placeholder={errors.price && !price ? INTEGER_ERROR : "Price"}
              placeholderTextColor={errors.price ? theme.colors.error : theme.colors.textMuted}
              keyboardType="number-pad"
              style={[
                s.input,
                {
                  backgroundColor: theme.colors.surfaceAlt,
                  color: theme.colors.text,
                  borderColor: errors.price ? theme.colors.error : "transparent",
                },
              ]}
            />
            {errors.price && price ? <Text style={[s.errorText, { color: theme.colors.error }]}>{errors.price}</Text> : null}

            <View>
              <Pressable
                onPress={() => setIsTypeDropdownOpen((current) => !current)}
                style={[
                  s.selectField,
                  {
                    backgroundColor: theme.colors.surfaceAlt,
                    borderColor: errors.type ? theme.colors.error : "transparent",
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
                <View style={[s.dropdown, { backgroundColor: theme.colors.surfaceAlt, borderColor: theme.colors.border }]}>
                  {REWARD_TYPE_OPTIONS.map((option) => (
                    <Pressable
                      key={option}
                      onPress={() => {
                        setType(option);
                        setErrors((current) => ({ ...current, type: undefined }));
                        setIsTypeDropdownOpen(false);
                      }}
                      style={[s.dropdownOption, option === type && { backgroundColor: theme.colors.primaryLight }]}
                    >
                      <Text style={{ color: theme.colors.text, fontWeight: "700" }}>
                        {formatItemTypeLabel(option)}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              ) : null}
              {errors.type ? <Text style={[s.errorText, { color: theme.colors.error }]}>{errors.type}</Text> : null}
            </View>

            <Pressable
              onPress={saveToCatalogue}
              disabled={savingRewardId === rewardToAdd?.id}
              style={[s.saveButton, { backgroundColor: theme.colors.tabIconActive }]}
            >
              <Text style={s.saveButtonText}>
                {savingRewardId === rewardToAdd?.id ? "Saving..." : "Save to My Catalogue"}
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1 },
  header: { paddingTop: 60, paddingHorizontal: 20, paddingBottom: 18, flexDirection: "row", alignItems: "center", gap: 16 },
  backButton: { width: 52, height: 52, borderRadius: 26, alignItems: "center", justifyContent: "center" },
  headerTextWrap: { flex: 1, gap: 4 },
  headerTitle: { fontSize: 24, fontWeight: "800" },
  headerSubtitle: { fontSize: 15, lineHeight: 21 },
  content: { padding: 16, paddingBottom: 32, gap: 14 },
  emptyCard: { borderRadius: 22, borderWidth: 1, padding: 18, gap: 8 },
  emptyTitle: { fontSize: 20, fontWeight: "800" },
  emptyText: { fontSize: 15, lineHeight: 22 },
  rewardCard: { borderRadius: 18, borderWidth: 1, padding: 16, flexDirection: "row", alignItems: "center", gap: 12 },
  rewardContent: { flex: 1 },
  rewardTitle: { fontSize: 18, fontWeight: "800" },
  addButton: { borderRadius: 999, paddingHorizontal: 14, paddingVertical: 10, alignItems: "center", justifyContent: "center" },
  addButtonText: { color: "#FFFFFF", fontWeight: "800", fontSize: 14 },
  modalBackdrop: { flex: 1, backgroundColor: "rgba(15, 23, 42, 0.38)", justifyContent: "center", paddingHorizontal: 20 },
  modalCard: { borderRadius: 22, borderWidth: 1, padding: 18, gap: 14 },
  modalCloseButton: { position: "absolute", top: 14, right: 14, width: 30, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center", zIndex: 2 },
  modalTitle: { fontSize: 22, fontWeight: "800" },
  modalSubtitle: { fontSize: 14, lineHeight: 21 },
  input: { borderWidth: 1, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 13, fontSize: 16 },
  errorText: { marginTop: -6, fontSize: 12, fontWeight: "600" },
  selectField: { minHeight: 52, borderWidth: 1, borderRadius: 14, paddingHorizontal: 14, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  dropdown: { marginTop: 8, borderRadius: 14, borderWidth: 1, overflow: "hidden" },
  dropdownOption: { paddingHorizontal: 14, paddingVertical: 12 },
  saveButton: { borderRadius: 14, paddingVertical: 14, alignItems: "center" },
  saveButtonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "800" },
});
