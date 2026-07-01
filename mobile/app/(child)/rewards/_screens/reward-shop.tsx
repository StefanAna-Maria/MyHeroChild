import { useCallback, useEffect, useRef, useState } from "react";
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
import { useFocusEffect, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { formatItemTypeLabel } from "../../../../constants/itemTypes";
import { getRewardImage } from "../../../../constants/rewardImages";
import { api } from "../../../../src/services/api";
import { useTheme } from "../../../../src/context/ThemeContext";
import { useUser } from "../../../../src/context/UserContext";

type ChildReward = {
  id: number;
  title: string;
  price: number;
  type: string;
  endDate: string;
};

type RewardsData = {
  rewardShop: ChildReward[];
  notifications: {
    id: number;
    title: string;
    message: string;
  }[];
};

export default function ChildRewardShopScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { user, refreshUser } = useUser();
  const [data, setData] = useState<RewardsData>({ rewardShop: [], notifications: [] });
  const [refreshing, setRefreshing] = useState(false);
  const [pendingRewardIds, setPendingRewardIds] = useState<number[]>([]);
  const lastShownNotificationIds = useRef<number[]>([]);

  const loadRewardShop = useCallback(async () => {
    const response = await api.get("/child/rewards");
    setData({
      rewardShop: response.data.data.rewardShop ?? [],
      notifications: response.data.data.notifications ?? [],
    });
    await refreshUser();
  }, [refreshUser]);

  useFocusEffect(useCallback(() => { loadRewardShop(); }, [loadRewardShop]));

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadRewardShop();
    } finally {
      setRefreshing(false);
    }
  }, [loadRewardShop]);

  const buyReward = useCallback(async (reward: ChildReward) => {
    setPendingRewardIds((current) => [...current, reward.id]);
    try {
      await api.post(`/child/rewards/${reward.id}/buy`);
      await loadRewardShop();
      Alert.alert("Reward claimed", "The reward was added to My Rewards.");
    } catch (error: any) {
      Alert.alert("Buy failed", error?.response?.data?.message ?? "The reward could not be purchased.");
    } finally {
      setPendingRewardIds((current) => current.filter((id) => id !== reward.id));
    }
  }, [loadRewardShop]);

  useEffect(() => {
    const unseen = data.notifications.filter((n) => !lastShownNotificationIds.current.includes(n.id));
    if (unseen.length === 0) return;
    lastShownNotificationIds.current = [...lastShownNotificationIds.current, ...unseen.map((n) => n.id)];
    unseen.forEach((n) => Alert.alert(n.title, n.message));
  }, [data.notifications]);

  return (
    <View style={[s.screen, { backgroundColor: theme.colors.background }]}>
      <View style={[s.header, { backgroundColor: theme.colors.surface }]}>
        <Pressable onPress={() => router.back()} style={[s.backButton, { backgroundColor: theme.colors.surfaceAlt }]}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </Pressable>
        <View style={s.headerTextWrap}>
          <Text style={[s.headerTitle, { color: theme.colors.text }]}>Rewards Shop</Text>
          <Text style={[s.headerSubtitle, { color: theme.colors.textMuted }]}>
            Spend your points on active rewards.
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={s.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />}
      >
        {data.rewardShop.length === 0 ? (
          <View style={[s.emptyCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            <Text style={[s.emptyTitle, { color: theme.colors.text }]}>No rewards right now</Text>
            <Text style={[s.emptyText, { color: theme.colors.textMuted }]}>
              Ask your parent to activate some rewards for you.
            </Text>
          </View>
        ) : (
          data.rewardShop.map((reward) => {
            const isPending = pendingRewardIds.includes(reward.id);
            const canAfford = (user?.rewardPoints ?? 0) >= reward.price;
            return (
              <View key={reward.id} style={[s.rewardCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
                <Image source={getRewardImage(reward.type)} style={s.rewardImage} />
                <View style={s.rewardContent}>
                  <Text style={[s.rewardTitle, { color: theme.colors.text }]}>{reward.title}</Text>
                  <View style={s.rewardMetaRow}>
                    <View style={[s.typeBadge, { backgroundColor: "#E8C5FC" }]}>
                      <Text style={[s.typeBadgeText, { color: theme.colors.textMuted }]}>
                        {formatItemTypeLabel(reward.type)}
                      </Text>
                    </View>
                    <View style={s.metricItem}>
                      <Text style={[s.metricValue, { color: theme.colors.text }]}>{reward.price}</Text>
                      <Image source={require("../../../../assets/icons/reward_points.png")} style={s.metricIcon} />
                    </View>
                  </View>
                  <View style={s.rewardBottomRow}>
                    <Text style={[s.dateText, { color: theme.colors.textMuted }]}>Available until {reward.endDate}</Text>
                    <Pressable
                      onPress={() => buyReward(reward)}
                      disabled={!canAfford || isPending}
                      style={[s.buyButton, { backgroundColor: canAfford ? theme.colors.primary : "#A8AFB8", opacity: isPending ? 0.7 : 1 }]}
                    >
                      <Text style={s.buyButtonText}>Buy</Text>
                      {!canAfford ? (
                        <View style={s.lockOverlay}>
                          <Image source={require("../../../../assets/icons/padlock.png")} style={s.lockIcon} />
                        </View>
                      ) : null}
                    </Pressable>
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
  screen: { flex: 1 },
  header: { paddingTop: 60, paddingHorizontal: 20, paddingBottom: 18, flexDirection: "row", alignItems: "center", gap: 16 },
  backButton: { width: 52, height: 52, borderRadius: 26, alignItems: "center", justifyContent: "center" },
  headerTextWrap: { flex: 1, gap: 4 },
  headerTitle: {
    fontSize: 28,
    fontWeight: "900",
    textShadowColor: "rgba(255, 250, 240, 0.9)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  headerSubtitle: { fontSize: 15, lineHeight: 21 },
  content: { padding: 16, paddingBottom: 104, gap: 14 },
  emptyCard: { borderRadius: 22, borderWidth: 1, padding: 18, gap: 8 },
  emptyTitle: { fontSize: 20, fontWeight: "800" },
  emptyText: { fontSize: 15, lineHeight: 22 },
  rewardCard: { borderRadius: 22, borderWidth: 1, padding: 16, flexDirection: "row", alignItems: "center", gap: 12 },
  rewardImage: { width: 62, height: 62, borderRadius: 31, resizeMode: "cover" },
  rewardContent: { flex: 1, gap: 8 },
  rewardTitle: { fontSize: 17, fontWeight: "800" },
  rewardMetaRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  typeBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, alignSelf: "flex-start" },
  typeBadgeText: { fontSize: 12, fontWeight: "700", textTransform: "uppercase" },
  metricItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  metricValue: { fontSize: 16, fontWeight: "800" },
  metricIcon: { width: 18, height: 18, resizeMode: "contain" },
  rewardBottomRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  dateText: { flex: 1, fontSize: 13, fontWeight: "600" },
  buyButton: { minWidth: 88, borderRadius: 999, paddingHorizontal: 18, paddingVertical: 10, alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" },
  buyButtonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "800" },
  lockOverlay: { position: "absolute", top: 0, right: 0, bottom: 0, left: 0, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(70, 74, 82, 0.26)" },
  lockIcon: { width: 28, height: 28, resizeMode: "contain" },
});
