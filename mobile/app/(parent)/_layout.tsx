import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function ParentTabs() {
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
        name="explore"
        options={{
          title: "Explore",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="search" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="distribution"
        options={{
          title: "Distribute",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="send" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="evaluation"
        options={{
          title: "Evaluate",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="analytics" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="aiSuperNanny"
        options={{
          title: "AI",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="sparkles" size={size} color={color} />
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