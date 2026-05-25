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

import { getRewardImage } from "../../../../constants/rewardImages";
import { api } from "../../../../src/services/api";
import { useTheme } from "../../../../src/context/ThemeContext";

type ChildReward = {
  id: number;
  title: string;
  price: number;
  type: string;
  startDate: string;
  endDate: string;
  claimed: boolean;
  granted: boolean;
  grantedAt?: string | null;
};

type RewardsData = {
  rewardShop: ChildReward[];
  myRewards: ChildReward[];
  rewardHistory: ChildReward[];
  notifications: {
    id: number;
    type: string;
    title: string;
    message: string;
  }[];
};

export default function ChildMyRewardsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [data, setData] = useState<RewardsData>({
    rewardShop: [],
    myRewards: [],
    rewardHistory: [],
    notifications: [],
  });
  const [refreshing, setRefreshing] = useState(false);
  const lastShownNotificationIds = useRef<number[]>([]);

  const loadRewards = useCallback(async () => {
    const response = await api.get("/child/rewards");
    setData(response.data.data);
  }, []);

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
      <View style={[s.header, { backgroundColor: theme.colors.surface }]}>
        <Pressable
          onPress={() => router.back()}
          style={[s.backButton, { backgroundColor: theme.colors.surfaceAlt }]}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </Pressable>

        <View style={s.headerTextWrap}>
          <Text style={[s.headerTitle, { color: theme.colors.text }]}>My Rewards</Text>
          <Text style={[s.headerSubtitle, { color: theme.colors.textMuted }]}>
            Your purchased reward collection.
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={s.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />
        }
      >
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
            <Text style={[s.sectionTitle, { color: theme.colors.text }]}>Ready To Enjoy</Text>
            <View style={[s.countBadge, { backgroundColor: theme.colors.primary }]}>
              <Text style={s.countBadgeText}>{data.myRewards.length}</Text>
            </View>
          </View>

        {data.myRewards.length === 0 ? (
          <View
            style={[
              s.emptyCard,
              {
                backgroundColor: theme.colors.surfaceAlt,
                borderColor: "transparent",
              },
            ]}
          >
            <Text style={[s.emptyTitle, { color: theme.colors.text }]}>No active purchased rewards</Text>
            <Text style={[s.emptyText, { color: theme.colors.textMuted }]}>
              Buy rewards from the shop and wait for your parent to offer them.
            </Text>
          </View>
        ) : (
          data.myRewards.map((reward) => (
            <View
              key={reward.id}
              style={[s.rewardCard, { backgroundColor: theme.colors.surfaceAlt }]}
            >
              <Image source={getRewardImage(reward.type)} style={s.rewardImage} />

              <View style={s.rewardContent}>
                <Text style={[s.rewardTitle, { color: theme.colors.text }]}>{reward.title}</Text>

                <View style={s.rewardMetaRow}>
                  <View style={[s.typeBadge, { backgroundColor: theme.colors.surfaceAlt }]}>
                    <Text style={[s.typeBadgeText, { color: theme.colors.textMuted }]}>
                      {reward.type || "Reward"}
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

                <Text style={[s.dateText, { color: theme.colors.textMuted }]}>
                  Available until {reward.endDate}
                </Text>
                <View style={[s.statusBadge, { backgroundColor: theme.colors.primary }]}>
                  <Text style={s.statusBadgeText}>Waiting for parent to offer it</Text>
                </View>
              </View>
            </View>
          ))
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
            <Text style={[s.sectionTitle, { color: theme.colors.text }]}>Granted History</Text>
            <View style={[s.countBadge, { backgroundColor: theme.colors.accent }]}>
              <Text style={s.countBadgeText}>{data.rewardHistory.length}</Text>
            </View>
          </View>

          {data.rewardHistory.length === 0 ? (
            <View
              style={[
                s.emptyCard,
                {
                  backgroundColor: theme.colors.surfaceAlt,
                  borderColor: "transparent",
                },
              ]}
            >
              <Text style={[s.emptyTitle, { color: theme.colors.text }]}>No granted rewards yet</Text>
              <Text style={[s.emptyText, { color: theme.colors.textMuted }]}>
                Rewards offered by your parent will move here automatically.
              </Text>
            </View>
          ) : (
            data.rewardHistory.map((reward) => (
              <View
                key={reward.id}
                style={[s.rewardCard, { backgroundColor: theme.colors.surfaceAlt }]}
              >
                <Image source={getRewardImage(reward.type)} style={s.rewardImage} />

                <View style={s.rewardContent}>
                  <Text style={[s.rewardTitle, { color: theme.colors.text }]}>{reward.title}</Text>

                  <View style={s.rewardMetaRow}>
                    <View style={[s.typeBadge, { backgroundColor: theme.colors.surface }]}>
                      <Text style={[s.typeBadgeText, { color: theme.colors.textMuted }]}>
                        {reward.type || "Reward"}
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

                  <Text style={[s.dateText, { color: theme.colors.textMuted }]}>
                    Granted on{" "}
                    {reward.grantedAt
                      ? new Date(reward.grantedAt).toLocaleDateString("en-GB")
                      : "recently"}
                  </Text>
                  <View style={[s.statusBadge, { backgroundColor: theme.colors.accent }]}>
                    <Text style={s.statusBadgeText}>Granted by parent</Text>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  backButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTextWrap: {
    flex: 1,
    gap: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
  },
  headerSubtitle: {
    fontSize: 15,
    lineHeight: 21,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
    gap: 14,
  },
  sectionCard: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 18,
    gap: 14,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
  },
  countBadge: {
    minWidth: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  countBadgeText: {
    color: "#FFFFFF",
    fontWeight: "800",
  },
  emptyCard: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 18,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "800",
  },
  emptyText: {
    fontSize: 15,
    lineHeight: 22,
  },
  rewardCard: {
    borderRadius: 20,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  rewardImage: {
    width: 62,
    height: 62,
    borderRadius: 31,
    resizeMode: "cover",
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
  dateText: {
    fontSize: 13,
    fontWeight: "600",
  },
  statusBadge: {
    alignSelf: "flex-start",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  statusBadgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },
});
