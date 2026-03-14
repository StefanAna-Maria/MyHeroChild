import { View, Text, StyleSheet, Animated } from "react-native";
import { useEffect, useRef } from "react";

import { useTheme } from "../src/context/ThemeContext";
import { useUser } from "../src/context/UserContext";

export default function AppHeader() {

  const theme = useTheme();
  const { user } = useUser();

  const progressAnim = useRef(new Animated.Value(0)).current;

  const xp = user?.xp ?? 0;
  const xpNeeded = 100;

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

      <Text style={[s.username, { color: theme.colors.text }]}>
        {username}
      </Text>

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

    </View>
  );
}

const s = StyleSheet.create({

  container: {
    paddingTop: 60,
    paddingBottom: 18,
    paddingHorizontal: 20
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