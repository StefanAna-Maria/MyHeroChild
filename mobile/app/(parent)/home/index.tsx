import { Image, ImageBackground, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AppHeader from "../../../components/AppHeader";
import CurvedScreenBody from "../../../components/CurvedScreenBody";
import { useTheme } from "../../../src/context/ThemeContext";
import { useUser } from "../../../src/context/UserContext";

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
  const { user } = useUser();

  return (
    <View style={[s.screen, { backgroundColor: theme.colors.background }]}>
      <AppHeader />

      <CurvedScreenBody>
      <ScrollView contentContainerStyle={s.content}>
        <View style={s.heroBlock}>
          <Text style={[s.heroTitle, { color: theme.colors.text }]}>
            Welcome back, {user?.username ?? "Parent"}!
          </Text>
          <Text style={[s.heroSubtitle, { color: theme.colors.textMuted }]}>
            Bring a little more joy, structure, and motivation into your family&apos;s routine.
            Discover inspiring packages, organize your catalogue, manage your children&apos;s
            activities, and ask AI SuperNanny for thoughtful support whenever you need it.
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

        <View style={[s.footerIllustrationCard, { backgroundColor: theme.colors.background }]}>
          <Image
            source={require("../../../assets/images/ParentHomePage_cutout.png")}
            style={s.footerImage}
          />
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
    fontSize: 34,
    fontWeight: "800",
    lineHeight: 40,
  },
  heroSubtitle: {
    fontSize: 18,
    lineHeight: 27,
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
  footerImage: {
    width: "100%",
    height: 180,
    resizeMode: "contain",
    marginTop: 6,
  },
  footerIllustrationCard: {
    width: "100%",
    minHeight: 200,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "flex-end",
    paddingHorizontal: 14,
    paddingTop: 18,
    paddingBottom: 8,
    overflow: "hidden",
    marginTop: 2,
  },
});
