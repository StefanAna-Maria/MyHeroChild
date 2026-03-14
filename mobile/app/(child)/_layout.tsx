import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function ChildTabs() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>

      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="tasks"
        options={{
          title: "Tasks",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="checkbox" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="rewards"
        options={{
          title: "Rewards",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="gift" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />

    </Tabs>
  );
}