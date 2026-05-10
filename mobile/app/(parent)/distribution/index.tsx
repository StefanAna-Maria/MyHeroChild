import { useCallback, useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AppHeader from "../../../components/AppHeader";
import { avatars, AvatarType } from "../../../constants/avatars";
import { api } from "../../../src/services/api";
import { useTheme } from "../../../src/context/ThemeContext";

type DistributionChild = {
  id: number;
  username: string;
  avatar: AvatarType;
  level: number;
  assignedTasksCount: number;
  availableRewardsCount: number;
};

export default function DistributionIndex() {
  const router = useRouter();
  const theme = useTheme();
  const [children, setChildren] = useState<DistributionChild[]>([]);
  const [onlyToday, setOnlyToday] = useState(true);

  const fetchChildren = useCallback(async () => {
    const response = await api.get("/parent/distribution/children", {
      params: { onlyToday },
    });
    setChildren(response.data.data);
  }, [onlyToday]);

  useFocusEffect(
    useCallback(() => {
      fetchChildren();
    }, [fetchChildren])
  );

  const openSelectionFlow = (child: DistributionChild, mode: "tasks" | "rewards") => {
    router.push({
      pathname: "/(parent)/distribution/_screens/assign-items",
      params: {
        childId: String(child.id),
        mode,
        childName: child.username,
      },
    });
  };

  const openChildItems = (child: DistributionChild, mode: "tasks" | "rewards") => {
    router.push({
      pathname: "/(parent)/distribution/_screens/child-items",
      params: {
        childId: String(child.id),
        mode,
        childName: child.username,
      },
    });
  };

  return (
    <View style={[s.screen, { backgroundColor: theme.colors.background }]}>
      <AppHeader />

      <ScrollView contentContainerStyle={s.content}>
        <Text style={[s.pageTitle, { color: theme.colors.text }]}>Distribute</Text>
        <Text style={[s.pageSubtitle, { color: theme.colors.textMuted }]}>
          Select one of your children to assign tasks or activate rewards from your catalogue.
        </Text>

        <Pressable style={s.checkboxRow} onPress={() => setOnlyToday((current) => !current)}>
          <Ionicons
            name={onlyToday ? "checkbox" : "square-outline"}
            size={22}
            color={theme.colors.tabIconActive}
          />
          <Text style={[s.checkboxLabel, { color: theme.colors.text }]}>Only Today&apos;s</Text>
        </Pressable>

        {children.length === 0 ? (
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
              No children are linked to this parent account yet.
            </Text>
          </View>
        ) : (
          children.map((child) => (
            <View
              key={child.id}
              style={[
                s.childCard,
                {
                  backgroundColor: theme.colors.primary,
                  borderColor: theme.colors.border,
                },
              ]}
            >
              <View style={s.childTopRow}>
                <Image source={avatars[child.avatar] ?? avatars.robot} style={s.avatar} />

                <View style={s.childInfo}>
                  <Text style={[s.childName, { color: theme.colors.text }]}>{child.username}</Text>
                  <Text style={{ color: theme.colors.textMuted }}>Level {child.level}</Text>
                </View>
              </View>

              <View style={s.metricsRow}>
                <Pressable
                  style={[s.metricCard, { backgroundColor: theme.colors.surfaceAlt }]}
                  onPress={() => openChildItems(child, "tasks")}
                >
                  <Text style={[s.metricValue, { color: theme.colors.text }]}>
                    {child.assignedTasksCount}
                  </Text>
                  <Text style={{ color: theme.colors.textMuted }}>Assigned Tasks</Text>
                </Pressable>

                <Pressable
                  style={[s.metricCard, { backgroundColor: theme.colors.surfaceAlt }]}
                  onPress={() => openChildItems(child, "rewards")}
                >
                  <Text style={[s.metricValue, { color: theme.colors.text }]}>
                    {child.availableRewardsCount}
                  </Text>
                  <Text style={{ color: theme.colors.textMuted }}>Available Rewards</Text>
                </Pressable>
              </View>

              <View style={s.actionsRow}>
                <Pressable
                  style={[s.actionButton, { backgroundColor: theme.colors.tabIconActive }]}
                  onPress={() => openSelectionFlow(child, "tasks")}
                >
                  <Text style={s.actionButtonText}>Assign Tasks</Text>
                </Pressable>

                <Pressable
                  style={[s.actionButton, { backgroundColor: theme.colors.accent }]}
                  onPress={() => openSelectionFlow(child, "rewards")}
                >
                  <Text style={s.actionButtonText}>Activate Rewards</Text>
                </Pressable>
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
  content: {
    padding: 16,
    paddingBottom: 32,
    gap: 14,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: "800",
  },
  pageSubtitle: {
    marginTop: 8,
    marginBottom: 10,
    lineHeight: 20,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 4,
  },
  checkboxLabel: {
    fontSize: 15,
    fontWeight: "700",
  },
  emptyCard: {
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
  },
  childCard: {
    borderRadius: 22,
    padding: 16,
    gap: 14,
    borderWidth: 1,
    shadowColor: "#8F7AD8",
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  childTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
  },
  childInfo: {
    flex: 1,
    gap: 4,
  },
  childName: {
    fontSize: 20,
    fontWeight: "800",
  },
  metricsRow: {
    flexDirection: "row",
    gap: 12,
  },
  metricCard: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 2,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: "800",
  },
  actionsRow: {
    flexDirection: "row",
    gap: 10,
  },
  actionButton: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 16,
  },
});
