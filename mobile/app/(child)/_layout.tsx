import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, View } from "react-native";

import { HapticTab } from "../../components/haptic-tab";
import { useTheme } from "../../src/context/ThemeContext";

export default function ChildTabs() {
  const theme = useTheme();

  const renderIcon =
    (name: keyof typeof Ionicons.glyphMap) =>
    ({ color, size, focused }: { color: string; size: number; focused: boolean }) => (
      <View
        style={[
          s.iconWrap,
          focused
            ? {
                backgroundColor: "#FEEBC8",
                borderColor: "#FBD38D",
                width: 40,
                height: 40,
                borderRadius: 20,
              }
            : null,
        ]}
      >
        <Ionicons name={name} size={focused ? 23 : 22} color={color} />
      </View>
    );

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: (props) => <HapticTab {...props} />,
        tabBarActiveTintColor: "#F97316",
        tabBarInactiveTintColor: "#8A7AA8",
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: 76,
          paddingTop: 8,
          paddingBottom: 10,
          backgroundColor: "rgba(255, 250, 255, 0.96)",
          borderTopWidth: 0,
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
          shadowColor: "#8B5CF6",
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.12,
          shadowRadius: 14,
          elevation: 10,
        },
        tabBarItemStyle: {
          borderRadius: 20,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "700",
          marginTop: 2,
        },
        sceneStyle: {
          backgroundColor: theme.colors.background,
        },
      }}
    >

      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: renderIcon("home"),
        }}
      />

      <Tabs.Screen
        name="tasks"
        options={{
          title: "Tasks",
          tabBarIcon: renderIcon("checkmark-done"),
        }}
      />

      <Tabs.Screen
        name="rewards"
        options={{
          title: "Rewards",
          tabBarIcon: renderIcon("gift-outline"),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: renderIcon("person-outline"),
        }}
      />

    </Tabs>
  );
}

const s = StyleSheet.create({
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "transparent",
    overflow: "visible",
  },
});
