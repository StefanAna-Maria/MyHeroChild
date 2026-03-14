import { View, Text, StyleSheet, Animated } from "react-native";
import { useEffect, useRef, useState } from "react";

import { useTheme } from "../src/context/ThemeContext";
import { useUser } from "../src/context/UserContext";
import { Image, Pressable } from "react-native";
import { avatars, AvatarType } from "../constants/avatars";
import AvatarPicker from "./AvatarPicker";

export default function AppHeader() {

  const theme = useTheme();
  const { user } = useUser();

  const progressAnim = useRef(new Animated.Value(0)).current;
  const [avatarPickerVisible, setAvatarPickerVisible] = useState(false);

  const xp = user?.xp ?? 0;
  const xpNeeded = 100;

  const openAvatarSelector = () => {
    console.log("Open avatar selector");
    setAvatarPickerVisible(true);
  };

  useEffect(() => {

    const progress = xp / xpNeeded;

    Animated.spring(progressAnim, {
      toValue: progress,
      useNativeDriver: false
    }).start();

  }, [xp]);

  if (!user) return null;

  const { username, role, level } = user;

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"]
  });

  return (
    <View style={[s.container, { backgroundColor: theme.colors.surface }]}>

        <View style={s.topRow}>
            <Pressable onPress={openAvatarSelector}>
            <Image
                source={avatars[user.avatar as AvatarType]}
                style={s.avatar}
            />
            </Pressable>

            <Text style={[s.username, { color: theme.colors.text }]}>
            {username}
            </Text>
        </View>

      {role === "CHILD" && (

        <View style={s.progressSection}>

          <Text style={[s.levelText, { color: theme.colors.textMuted }]}>
            Level {level}
          </Text>

          <View style={s.progressBarContainer}>

            <Animated.View
              style={[
                s.progressBar,
                {
                  backgroundColor: theme.colors.primary,
                  width: progressWidth
                }
              ]}
            />

          </View>

          <Text style={[s.xpText, { color: theme.colors.textMuted }]}>
            {xp}/{xpNeeded} XP
          </Text>

        </View>

      )}

        <AvatarPicker
            visible={avatarPickerVisible}
            onClose={() => setAvatarPickerVisible(false)}
            onSelect={(avatar) => {
                console.log("Selected avatar:", avatar);
                setAvatarPickerVisible(false);
            }}
        />

    </View>
  );
}

const s = StyleSheet.create({

  container: {
    paddingTop: 60,
    paddingBottom: 18,
    paddingHorizontal: 20
  },

  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },

  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21
  },

  username: {
    fontSize: 22,
    fontWeight: "800"
  },

  progressSection: {
    marginTop: 10
  },

  levelText: {
    fontWeight: "600",
    marginBottom: 4
  },

  progressBarContainer: {
    height: 12,
    borderRadius: 10,
    backgroundColor: "#e5e7eb",
    overflow: "hidden"
  },

  progressBar: {
    height: "100%",
    borderRadius: 10
  },

  xpText: {
    marginTop: 4,
    fontSize: 12,
    textAlign: "center"
  }

});