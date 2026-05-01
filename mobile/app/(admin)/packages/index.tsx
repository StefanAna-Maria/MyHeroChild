import { useEffect, useState } from "react";
import { View, Text, FlatList, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { api } from "@/src/services/api";
import { useTheme } from "@/src/context/ThemeContext";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";
import { useCallback } from "react";
import AppHeader from "@/components/AppHeader";

export default function Packages() {
  const [packages, setPackages] = useState([]);
  const router = useRouter();
  const theme = useTheme();

  const fetchPackages = async () => {
    const res = await api.get("/packages");
    setPackages(res.data.data);
  };

  useFocusEffect(
    useCallback(() => {
      fetchPackages();
    }, [])
  );

  return (
    //<SafeAreaView style={{ flex: 1 }}>

      //<SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={{ flex: 1, backgroundColor: theme.colors.background }}>

        <AppHeader />

        <FlatList
          data={packages}
          keyExtractor={(item: any) => item.id.toString()}
          contentContainerStyle={{ gap: 14 }}
          renderItem={({ item }: any) => (
            <Pressable
              onPress={() => router.push(`/(admin)/packages/_screens/package-detail?id=${item.id}`)}
              style={[s.card, { backgroundColor: theme.colors.surface }]}
            >
              <Text style={[s.title, { color: theme.colors.text }]}>
                {item.title}
              </Text>

              <Text style={{ color: theme.colors.textMuted }}>
                Age: {item.ageGroup}
              </Text>

              <Text style={{ color: theme.colors.textMuted }}>
                {item.description}
              </Text>
            </Pressable>
          )}
        />

        <Pressable
          style={[s.addBtn, { backgroundColor: theme.colors.primary }]}
          onPress={() => router.push("/(admin)/packages/_screens/package-create")}
        >
          <Text style={s.addText}>+ Add New Package</Text>
        </Pressable>

      </View>
    //</SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16
  },
  card: {
    padding: 16,
    borderRadius: 16
  },
  title: {
    fontSize: 18,
    fontWeight: "700"
  },
  addBtn: {
    marginTop: 16,
    padding: 16,
    borderRadius: 14,
    alignItems: "center"
  },
  addText: {
    color: "white",
    fontWeight: "700"
  }
});