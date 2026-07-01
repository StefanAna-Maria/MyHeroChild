import { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Image,
  ImageBackground,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";

import AppHeader from "../../../components/AppHeader";
import CurvedScreenBody from "../../../components/CurvedScreenBody";
import { formatItemTypeLabel } from "../../../constants/itemTypes";
import { getRewardImage } from "../../../constants/rewardImages";
import { api } from "../../../src/services/api";
import { useTheme } from "../../../src/context/ThemeContext";
import { useUser } from "../../../src/context/UserContext";

type ChildReward = {
  id: number;
  title: string;
  price: number;
  type: string;
  endDate: string;
  grantedAt?: string | null;
};

type WishlistReward = {
  id: number;
  title: string;
};

type RewardsPageData = {
  rewardShop: ChildReward[];
  myRewards: ChildReward[];
  rewardHistory: ChildReward[];
  wishlist: WishlistReward[];
  notifications: {
    id: number;
    type: string;
    title: string;
    message: string;
  }[];
};

const initialData: RewardsPageData = {
  rewardShop: [],
  myRewards: [],
  rewardHistory: [],
  wishlist: [],
  notifications: [],
};

const shopStripeColors = ["#D85B50", "#F7E8EC", "#D85B50", "#F7E8EC", "#D85B50", "#F7E8EC"] as const;

export default function ChildRewardsPage() {
  const theme = useTheme();
  const router = useRouter();
  const { user, refreshUser } = useUser();
  const [data, setData] = useState<RewardsPageData>(initialData);
  const [refreshing, setRefreshing] = useState(false);
  const [pendingRewardIds, setPendingRewardIds] = useState<number[]>([]);
  const lastShownNotificationIds = useRef<number[]>([]);

  const loadRewards = useCallback(async () => {
    const response = await api.get("/child/rewards");
    const payload = response.data.data ?? {};
    const wishlist = Array.isArray(payload.wishlist) ? payload.wishlist : [];

    setData({
      rewardShop: Array.isArray(payload.rewardShop) ? payload.rewardShop : [],
      myRewards: Array.isArray(payload.myRewards) ? payload.myRewards : [],
      rewardHistory: Array.isArray(payload.rewardHistory) ? payload.rewardHistory : [],
      wishlist: wishlist.map((reward: any) => ({
        id: Number(reward.id),
        title: String(reward.title ?? ""),
      })),
      notifications: Array.isArray(payload.notifications) ? payload.notifications : [],
    });

    await refreshUser();
  }, [refreshUser]);

  useFocusEffect(
    useCallback(() => {
      loadRewards();
    }, [loadRewards])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadRewards();
    } finally {
      setRefreshing(false);
    }
  }, [loadRewards]);

  const buyReward = useCallback(
    async (reward: ChildReward) => {
      setPendingRewardIds((current) => [...current, reward.id]);

      try {
        await api.post(`/child/rewards/${reward.id}/buy`);
        await loadRewards();
        Alert.alert("Reward claimed", "The reward was added to My Rewards.");
      } catch (error: any) {
        Alert.alert(
          "Buy failed",
          error?.response?.data?.message ?? "The reward could not be purchased."
        );
      } finally {
        setPendingRewardIds((current) => current.filter((id) => id !== reward.id));
      }
    },
    [loadRewards]
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

      <CurvedScreenBody>
        <ScrollView
          contentContainerStyle={s.content}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.colors.primary}
            />
          }
        >
        <View style={s.pageHeader}>
          <Text style={[s.pageTitle, { color: theme.colors.text }]}>Rewards</Text>
          <Text style={[s.pageSubtitle, { color: theme.colors.textMuted }]}>
            Browse active rewards, open your collection, or save future wishes.
          </Text>
        </View>

        <View
          style={[
            s.shopSectionCard,
            {
              borderColor: theme.colors.border,
            },
          ]}
        >
          <ImageBackground
            source={require("../../../assets/backgrounds/rewardShop.png")}
            resizeMode="cover"
            imageStyle={s.shopCardBackgroundImage}
            style={s.shopCardBackground}
          >
            <View style={s.shopAwningWrap}>
              <View style={s.shopAwningOverlay} />

              <View style={s.shopStripeRow}>
                {shopStripeColors.map((color, index) => (
                  <View key={index} style={[s.shopStripePillar, { backgroundColor: color }]} />
                ))}
              </View>

              <View style={s.sectionHeaderOverlay}>
                <Text style={[s.sectionTitle, s.shopSectionTitle]}>Rewards Shop</Text>
                <View style={[s.countBadge, { backgroundColor: theme.colors.primary }]}>
                  <Text style={s.countBadgeText}>{data.rewardShop.length}</Text>
                </View>
              </View>
            </View>

            <View style={s.shopContent}>
            {data.rewardShop.length === 0 ? (
              <View style={[s.emptyCard, { backgroundColor: theme.colors.surfaceAlt }]}>
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
                  <View
                    key={reward.id}
                    style={[s.rewardCard, { backgroundColor: theme.colors.surfaceAlt }]}
                  >
                    <View style={s.rewardTopRow}>
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
                            <Text style={[s.metricValue, { color: theme.colors.text }]}>
                              {reward.price}
                            </Text>
                            <Image
                              source={require("../../../assets/icons/reward_points.png")}
                              style={s.metricIcon}
                            />
                          </View>
                        </View>
                      </View>
                    </View>

                    <View style={s.rewardBottomRow}>
                      <Text numberOfLines={1} style={[s.dateText, { color: theme.colors.textMuted }]}>
                        Available until {reward.endDate}
                      </Text>

                      <Pressable
                        onPress={() => buyReward(reward)}
                        disabled={!canAfford || isPending}
                        style={[
                          s.buyButton,
                          {
                            backgroundColor: canAfford ? theme.colors.primary : "#A8AFB8",
                            opacity: isPending ? 0.7 : 1,
                          },
                        ]}
                      >
                        <Text style={s.buyButtonText}>Buy</Text>
                        {!canAfford ? (
                          <View style={s.lockOverlay}>
                            <Image
                              source={require("../../../assets/icons/padlock.png")}
                              style={s.lockIcon}
                            />
                          </View>
                        ) : null}
                      </Pressable>
                    </View>
                  </View>
                );
              })
            )}
            </View>
          </ImageBackground>
        </View>

        <View style={s.shortcutsRow}>
          <Pressable
            onPress={() => router.push("/(child)/rewards/_screens/my-rewards" as never)}
            style={[
              s.shortcutButton,
              {
                backgroundColor: "#2A9D8F",
                borderColor: "#58B8A8",
              },
            ]}
          >
            <Text style={s.shortcutButtonTitle}>My Rewards</Text>
            <View style={[s.countBadge, { backgroundColor: theme.colors.accent }]}>
              <Text style={s.countBadgeText}>
                {data.myRewards.length + data.rewardHistory.length}
              </Text>
            </View>
          </Pressable>

          <Pressable
            onPress={() => router.push("/(child)/rewards/_screens/wishlist" as never)}
            style={[
              s.shortcutButton,
              {
                backgroundColor: "#F4A261",
                borderColor: "#F7B78B",
              },
            ]}
          >
            <Text style={s.shortcutButtonTitle}>Wishlist</Text>
            <View style={[s.countBadge, { backgroundColor: theme.colors.primary }]}>
              <Text style={s.countBadgeText}>{data.wishlist.length}</Text>
            </View>
          </Pressable>
        </View>
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
    paddingBottom: 104,
    gap: 16,
  },
  pageHeader: {
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
    gap: 14,
  },
  shopSectionCard: {
    borderRadius: 22,
    borderWidth: 1,
    overflow: "hidden",
  },
  shopCardBackground: {
    flex: 1,
  },
  shopCardBackgroundImage: {
    borderRadius: 22,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionHeaderOverlay: {
    position: "absolute",
    left: 18,
    right: 18,
    top: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "800",
  },
  shopAwningWrap: {
    height: 118,
    position: "relative",
    justifyContent: "flex-start",
  },
  shopAwningOverlay: {
    position: "absolute",
    inset: 0,
    backgroundColor: "transparent",
  },
  shopStripeRow: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: 104,
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "flex-start",
  },
  shopStripePillar: {
    flex: 1,
    height: 98,
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
  },
  shopContent: {
    paddingHorizontal: 18,
    paddingBottom: 18,
    paddingTop: 22,
    gap: 14,
  },
  shopSectionTitle: {
    color: "#1F2937",
    fontSize: 26,
    fontWeight: "900",
    textShadowColor: "rgba(255, 250, 240, 0.9)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  shortcutsRow: {
    flexDirection: "row",
    gap: 12,
  },
  shortcutButton: {
    flex: 1,
    minHeight: 84,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  shortcutButtonTitle: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
    lineHeight: 24,
    textShadowColor: "rgba(31, 41, 55, 0.32)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  countBadge: {
    minWidth: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  countBadgeText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
  emptyCard: {
    borderRadius: 20,
    padding: 16,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "800",
  },
  emptyText: {
    fontSize: 15,
    lineHeight: 22,
  },
  rewardCard: {
    borderRadius: 20,
    padding: 16,
    gap: 10,
  },
  rewardTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  rewardImage: {
    width: 62,
    height: 62,
    borderRadius: 31,
    resizeMode: "cover",
    marginTop: 4,
  },
  rewardContent: {
    flex: 1,
    gap: 8,
  },
  rewardTitle: {
    fontSize: 17,
    fontWeight: "800",
  },
  rewardMetaRow: {
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
  rewardBottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  dateText: {
    fontSize: 13,
    fontWeight: "600",
    flexShrink: 1,
  },
  buyButton: {
    minWidth: 84,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    overflow: "hidden",
  },
  buyButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
  lockOverlay: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(70, 74, 82, 0.26)",
  },
  lockIcon: {
    width: 28,
    height: 28,
    resizeMode: "contain",
  },
});
