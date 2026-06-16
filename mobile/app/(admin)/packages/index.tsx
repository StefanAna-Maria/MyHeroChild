import { useCallback, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { api } from "@/src/services/api";
import { useTheme } from "@/src/context/ThemeContext";
import AppHeader from "@/components/AppHeader";
import CurvedScreenBody from "@/components/CurvedScreenBody";
import { formatItemTypeLabel } from "@/constants/itemTypes";

type PackageListItem = {
  id: number;
  title: string;
  ageGroup: string;
  description: string;
  tasks: { id: number; type?: string }[];
  rewards: { id: number }[];
};

const taskTypeIcons: Record<string, any> = {
  default: require("../../../assets/icons/Homework.png"),
  school_work: require("../../../assets/icons/Homework.png"),
  reading: require("../../../assets/icons/Homework.png"),
  hygiene: require("../../../assets/icons/Hygiene.png"),
  neat_tidy: require("../../../assets/icons/NeatTidy.png"),
  chores: require("../../../assets/icons/Chores.png"),
  family_help: require("../../../assets/icons/FamilyHelp.png"),
  responsibility: require("../../../assets/icons/FamilyHelp.png"),
  respect_kindness: require("../../../assets/icons/FamilyHelp.png"),
  health: require("../../../assets/icons/Hygiene.png"),
  life_skills: require("../../../assets/icons/FamilyHelp.png"),
  self_improvement: require("../../../assets/icons/Homework.png"),
  digital_balance: require("../../../assets/icons/Homework.png"),
  social_skills: require("../../../assets/icons/FamilyHelp.png"),
  creativity: require("../../../assets/icons/Homework.png"),
};

const getDominantTaskType = (tasks: { type?: string }[]) => {
  if (tasks.length === 0) {
    return "default";
  }

  const counts = new Map<string, number>();

  tasks.forEach((task) => {
    const type = task.type || "default";
    counts.set(type, (counts.get(type) ?? 0) + 1);
  });

  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "default";
};

export default function Packages() {
  const [packages, setPackages] = useState<PackageListItem[]>([]);
  const router = useRouter();
  const theme = useTheme();

  const fetchPackages = async () => {
    const res = await api.get("/packages");
    setPackages(res.data.data);
  };

  const handleDeletePackage = (id: number) => {
    Alert.alert(
      "Delete package",
      "This package and all its tasks and rewards will be removed.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await api.delete(`/packages/${id}`);
              fetchPackages();
            } catch {
              Alert.alert("Delete failed", "The package could not be deleted.");
            }
          },
        },
      ]
    );
  };

  useFocusEffect(
    useCallback(() => {
      fetchPackages();
    }, [])
  );

  return (
    <View style={[s.screen, { backgroundColor: theme.colors.background }]}>
      <AppHeader />

      <CurvedScreenBody>
        <FlatList
          data={packages}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={s.content}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => router.push(`/(admin)/packages/_screens/package-detail?id=${item.id}`)}
              style={[
                s.card,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                },
              ]}
            >
              {(() => {
                const dominantTaskType = getDominantTaskType(item.tasks);
                const dominantTaskIcon =
                  taskTypeIcons[dominantTaskType] ?? taskTypeIcons.default;

                return (
                  <>
                    <View style={s.cardHeaderRow}>
                      <View style={s.visualAndTitleWrap}>
                        <View style={s.packageTopVisualRow}>
                          <View style={s.packageTypeIconBubble}>
                            <Image source={dominantTaskIcon} style={s.packageTypeIconImage} />
                          </View>

                          <View style={s.ageBadge}>
                            <Text style={s.ageBadgeText}>Ages:</Text>
                            <Text style={s.ageBadgeValue}>{item.ageGroup}</Text>
                          </View>
                        </View>

                        <Text style={[s.title, { color: theme.colors.text }]} numberOfLines={2}>
                          {item.title}
                        </Text>
                      </View>

                      <View style={s.iconActions}>
                        <Pressable
                          onPress={() =>
                            router.push(`/(admin)/packages/_screens/package-detail?id=${item.id}&edit=1`)
                          }
                          style={s.iconButton}
                          hitSlop={8}
                        >
                          <Image
                            source={require("../../../assets/button_icons/edit.png")}
                            style={s.iconImage}
                          />
                        </Pressable>

                        <Pressable
                          onPress={() => handleDeletePackage(item.id)}
                          style={s.iconButton}
                          hitSlop={8}
                        >
                          <Image
                            source={require("../../../assets/button_icons/delete.png")}
                            style={s.iconImage}
                          />
                        </Pressable>
                      </View>
                    </View>

                    <Text
                      style={[s.description, { color: theme.colors.textMuted }]}
                      numberOfLines={3}
                    >
                      {item.description || "No description provided."}
                    </Text>

                    <View style={s.metricsRow}>
                      <View style={[s.metricBadge, { backgroundColor: "#C7E9FF" }]}>
                        <Text style={[s.metricValue, { color: "#1B2A41" }]}>
                          {item.tasks.length} tasks
                        </Text>
                      </View>

                      <View style={[s.metricBadge, { backgroundColor: "#D6F2C7" }]}>
                        <Text style={[s.metricValue, { color: "#1B2A41" }]}>
                          {item.rewards.length} rewards
                        </Text>
                      </View>
                    </View>

                    {item.tasks.length > 0 ? (
                      <Text style={[s.typeSummary, { color: theme.colors.textMuted }]} numberOfLines={1}>
                        {formatItemTypeLabel(dominantTaskType)}
                      </Text>
                    ) : null}
                  </>
                );
              })()}
            </Pressable>
          )}
          ListFooterComponent={
            <Pressable
              style={[s.addBtn, { backgroundColor: theme.colors.primary }]}
              onPress={() => router.push("/(admin)/packages/_screens/package-create")}
            >
              <Text style={s.addText}>+ Add New Package</Text>
            </Pressable>
          }
        />
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
    paddingBottom: 32,
    gap: 14,
  },
  card: {
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    gap: 12,
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  visualAndTitleWrap: {
    flex: 1,
    gap: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    paddingRight: 4,
  },
  description: {
    lineHeight: 21,
  },
  metricsRow: {
    flexDirection: "row",
    gap: 10,
  },
  metricBadge: {
    flex: 1,
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignItems: "center",
  },
  metricValue: {
    fontSize: 15,
    fontWeight: "800",
  },
  iconActions: {
    flexDirection: "row",
    gap: 8,
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
  packageTopVisualRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  packageTypeIconBubble: {
    width: 86,
    height: 86,
    borderRadius: 22,
    backgroundColor: "#163447",
    alignItems: "center",
    justifyContent: "center",
  },
  packageTypeIconImage: {
    width: 62,
    height: 62,
    resizeMode: "contain",
  },
  ageBadge: {
    minWidth: 72,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#D9A8FF",
    alignItems: "center",
    justifyContent: "center",
  },
  ageBadgeText: {
    color: "#40285C",
    fontSize: 12,
    fontWeight: "800",
  },
  ageBadgeValue: {
    color: "#40285C",
    fontSize: 18,
    fontWeight: "800",
    lineHeight: 20,
  },
  typeSummary: {
    fontSize: 15,
    fontWeight: "600",
  },
  addBtn: {
    marginTop: 4,
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
  },
  addText: {
    color: "white",
    fontWeight: "700",
  },
});
