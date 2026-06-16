import { View, Text, StyleSheet, Animated, Image, Pressable, Alert, ImageBackground } from "react-native";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTheme } from "../src/context/ThemeContext";
import { useUser } from "../src/context/UserContext";
import { useAuth } from "../src/auth/AuthContext";
import { getUsernameFromToken } from "../src/auth/jwt";
import { getAvatarSource } from "../constants/avatars";
import AvatarPicker from "./AvatarPicker";
import { api } from "../src/services/api";

const headerBackgrounds = {
  ADMIN: require("../assets/images/AdminAppHeader.png"),
  PARENT: require("../assets/images/ParentAppHeader.png"),
  CHILD: require("../assets/images/ChildAppHeader.png"),
} as const;

export default function AppHeader() {

  const theme = useTheme();
  const { user, isLoading, refreshUser } = useUser();
  const { token, role: authRole, logout } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const progressAnim = useRef(new Animated.Value(0)).current;
  const [avatarPickerVisible, setAvatarPickerVisible] = useState(false);

  const xp = user?.xp ?? 0;
  const currentLevelMinTotalXp = user?.currentLevelMinTotalXp ?? 0;
  const nextLevelMinTotalXp = user?.nextLevelMinTotalXp ?? null;
  const xpIntoCurrentLevel = Math.max(xp - currentLevelMinTotalXp, 0);
  const xpNeededForNextLevel =
    nextLevelMinTotalXp == null ? 0 : Math.max(nextLevelMinTotalXp - currentLevelMinTotalXp, 1);

  const openAvatarSelector = () => {
    setAvatarPickerVisible(true);
  };

  const openLogout = () => {
    Alert.alert("Log out", "Do you want to log out of your account?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Log out",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/(auth)/login");
        },
      },
    ]);
  };

  useEffect(() => {

    const progress =
      nextLevelMinTotalXp == null
        ? 1
        : Math.min(xpIntoCurrentLevel / xpNeededForNextLevel, 1);

    Animated.spring(progressAnim, {
      toValue: progress,
      useNativeDriver: false
    }).start();

  }, [nextLevelMinTotalXp, progressAnim, xpIntoCurrentLevel, xpNeededForNextLevel]);

  const role = user?.role ?? authRole;
  const username = user?.username ?? (token ? getUsernameFromToken(token) : null) ?? "User";
  const level = user?.level ?? 1;
  const avatar = user?.avatar;

  if (!role) return null;

  const backgroundSource = headerBackgrounds[role as keyof typeof headerBackgrounds] ?? headerBackgrounds.PARENT;

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"]
  });

  return (
    <ImageBackground
      source={backgroundSource}
      resizeMode="cover"
      style={[s.container, { paddingTop: insets.top + 14 }]}
      imageStyle={s.backgroundImage}
    >
        <View style={s.topRow}>
          {(role === "PARENT" || role === "CHILD" || role === "ADMIN") ? (
            <Pressable
              onPress={openLogout}
              style={[s.logoutButton, { backgroundColor: theme.colors.surfaceAlt }]}
            >
              <Ionicons name="log-out-outline" size={20} color={theme.colors.text} />
            </Pressable>
          ) : null}

          {role === "CHILD" ? (
            <View
              style={[
                s.rewardPointsBadge,
                {
                  backgroundColor: theme.colors.surfaceAlt,
                  right: role === "CHILD" ? 46 : 0,
                },
              ]}
            >
              <Image
                source={require("../assets/icons/reward_points.png")}
                style={s.rewardPointsIcon}
              />
              <Text style={[s.rewardPointsText, { color: theme.colors.text }]}>
                {user?.rewardPoints ?? 0}
              </Text>
            </View>
          ) : null}

          <View style={s.identityRow}>
            <Pressable
              onPress={openAvatarSelector}
              disabled={!user || isLoading}
              style={[s.avatarToggleButton, { backgroundColor: theme.colors.surfaceAlt }]}
            >
              <Ionicons name="caret-down" size={14} color={theme.colors.text} />
            </Pressable>

            <Image
              source={getAvatarSource(avatar)}
              style={s.avatar}
            />

            <Text style={[s.username, { color: role === "CHILD" ? "#FFFFFF" : theme.colors.text }]}>
              {username}
            </Text>
          </View>
        </View>

      {role === "CHILD" && user && (

        <View style={s.progressSection}>

          <Text style={s.levelText}>
            Level {level}
          </Text>

          <View style={s.progressBarContainer}>

            <Animated.View
              style={[
                s.progressBar,
                {
                  backgroundColor: "#FACC15",
                  width: progressWidth
                }
              ]}
            />

            <Text style={s.progressTextInside}>
              {nextLevelMinTotalXp == null
                ? `${xp} XP`
                : `${xpIntoCurrentLevel}/${xpNeededForNextLevel} XP`}
            </Text>
          </View>

        </View>

      )}

        <AvatarPicker
            visible={avatarPickerVisible}
            onClose={() => setAvatarPickerVisible(false)}
            placement="left"
            currentAvatar={user?.avatar ?? "robot"}
            options={user?.avatarOptions ?? []}
            onSelect={ async (avatar) => {
                try {
                  await api.patch("/users/me/avatar", { avatar });
                  await refreshUser();
                } catch (e) {
                  console.log("Avatar update failed", e);
                } finally {
                  setAvatarPickerVisible(false);
                }
            }}
            onClaim={async (avatar) => {
              try {
                await api.post(`/users/me/avatars/${avatar}/claim`);
                await refreshUser();
              } catch (e) {
                console.log("Avatar claim failed", e);
              }
            }}
        />
    </ImageBackground>
  );
}

const s = StyleSheet.create({

  container: {
    paddingBottom: 36,
    paddingHorizontal: 20,
    overflow: "hidden",
  },

  backgroundImage: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },

  topRow: {
    position: "relative",
    minHeight: 42,
    justifyContent: "center",
  },

  identityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  avatarToggleButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21
  },

  username: {
    fontSize: 22,
    fontWeight: "800",
    textShadowColor: "rgba(255,255,255,0.95)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },

  progressSection: {
    marginTop: 10
  },

  levelText: {
    fontWeight: "700",
    marginBottom: 4,
    color: "#FFFFFF",
  },

  progressBarContainer: {
    height: 18,
    borderRadius: 10,
    backgroundColor: "#E6F2EA",
    overflow: "hidden",
    justifyContent: "center",
  },

  progressBar: {
    height: "100%",
    borderRadius: 10
  },

  progressTextInside: {
    fontSize: 12,
    textAlign: "center",
    color: "#FFFFFF",
    fontWeight: "800",
    position: "absolute",
    width: "100%",
  },

  rewardPointsBadge: {
    position: "absolute",
    right: 0,
    top: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },

  rewardPointsIcon: {
    width: 18,
    height: 18,
    resizeMode: "contain",
  },

  rewardPointsText: {
    fontSize: 14,
    fontWeight: "800",
  },

  logoutButton: {
    position: "absolute",
    right: 0,
    top: 0,
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },

});
