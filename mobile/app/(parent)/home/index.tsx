import { ImageBackground, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AppHeader from "../../../components/AppHeader";
import CurvedScreenBody from "../../../components/CurvedScreenBody";
import { useTheme } from "../../../src/context/ThemeContext";

const quickActions = [
  {
    key: "discover",
    title: "Discover Packages",
    route: "/(parent)/explore",
    icon: "search",
    background: require("../../../assets/backgrounds/todayTasks.png"),
  },
  {
    key: "catalogue",
    title: "My Catalogue",
    route: "/(parent)/home/_screens/my-catalogue",
    icon: "albums",
    background: require("../../../assets/backgrounds/thisWeekTasks.png"),
  },
  {
    key: "children",
    title: "Manage Children",
    route: "/(parent)/distribution",
    icon: "people",
    background: require("../../../assets/backgrounds/nextWeekTasks.png"),
  },
  {
    key: "ai",
    title: "Consult AISuperNanny",
    route: "/(parent)/aiSuperNanny",
    icon: "sparkles",
    background: require("../../../assets/backgrounds/wishes.png"),
  },
] as const;

export default function ParentHomeIndex() {
  const router = useRouter();
  const theme = useTheme();

  return (
    <View style={[s.screen, { backgroundColor: theme.colors.background }]}>
      <AppHeader />

      <CurvedScreenBody>
      <ScrollView contentContainerStyle={s.content}>
        <View style={s.heroBlock}>
          <Text style={[s.heroTitle, { color: theme.colors.text }]}>Welcome back, Parent!</Text>
          <Text style={[s.heroSubtitle, { color: theme.colors.textMuted }]}>
            Guide your family with intention. Discover ready-made packages, manage your catalogue,
            assign meaningful activities, and ask AI SuperNanny for tailored ideas.
          </Text>
        </View>

        <View style={s.quickActionsGrid}>
          {quickActions.map((action) => (
            <Pressable
              key={action.key}
              onPress={() => router.push(action.route as never)}
              style={s.quickActionCard}
            >
              <ImageBackground
                source={action.background}
                resizeMode="cover"
                imageStyle={s.quickActionBackgroundImage}
                style={s.quickActionFill}
              >
                <View style={s.quickActionOverlay}>
                  <Text style={s.quickActionTitle}>{action.title}</Text>
                  <Ionicons
                    name={action.icon as keyof typeof Ionicons.glyphMap}
                    size={30}
                    color="#FFFFFF"
                  />
                </View>
              </ImageBackground>
            </Pressable>
          ))}
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
    paddingBottom: 32,
    gap: 18,
  },
  heroBlock: {
    gap: 8,
  },
  heroTitle: {
    fontSize: 30,
    fontWeight: "800",
  },
  heroSubtitle: {
    fontSize: 16,
    lineHeight: 24,
  },
  quickActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 14,
  },
  quickActionCard: {
    width: "48%",
    minHeight: 118,
    borderRadius: 22,
    overflow: "hidden",
  },
  quickActionFill: {
    flex: 1,
  },
  quickActionBackgroundImage: {
    borderRadius: 22,
  },
  quickActionOverlay: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "rgba(52, 36, 84, 0.34)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  quickActionTitle: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "800",
    lineHeight: 26,
    textShadowColor: "rgba(31, 41, 55, 0.28)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
});
