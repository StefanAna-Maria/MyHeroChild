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

type PackageListItem = {
  id: number;
  title: string;
  ageGroup: string;
  description: string;
  tasks: { id: number }[];
  rewards: { id: number }[];
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
            <View style={s.cardHeaderRow}>
              <View style={s.cardTextWrap}>
                <Text style={[s.title, { color: theme.colors.text }]}>{item.title}</Text>
                <Text style={[s.metaText, { color: theme.colors.textMuted }]}>
                  Age Group {item.ageGroup}
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
              <View style={[s.metricBadge, { backgroundColor: theme.colors.surfaceAlt }]}>
                <Text style={[s.metricValue, { color: theme.colors.text }]}>
                  {item.tasks.length}
                </Text>
                <Text style={[s.metricLabel, { color: theme.colors.textMuted }]}>Tasks</Text>
              </View>

              <View style={[s.metricBadge, { backgroundColor: theme.colors.surfaceAlt }]}>
                <Text style={[s.metricValue, { color: theme.colors.text }]}>
                  {item.rewards.length}
                </Text>
                <Text style={[s.metricLabel, { color: theme.colors.textMuted }]}>Rewards</Text>
              </View>
            </View>
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
  cardTextWrap: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    paddingRight: 8,
  },
  metaText: {
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.4,
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
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
    gap: 2,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: "800",
  },
  metricLabel: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
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
