import Ionicons from "@expo/vector-icons/Ionicons";
import { Tabs } from "expo-router";
import { useColorScheme } from "react-native";

import { getTheme } from "@/src/lib/theme";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textSoft,
        tabBarStyle: {
          backgroundColor: theme.card,
          borderTopColor: theme.border,
          height: 88,
          paddingBottom: 12,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "任务",
          tabBarIcon: ({ color, size }) => <Ionicons color={color} name="checkbox-outline" size={size} />,
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: "日历",
          tabBarIcon: ({ color, size }) => <Ionicons color={color} name="calendar-outline" size={size} />,
        }}
      />
      <Tabs.Screen
        name="pet"
        options={{
          title: "宠物",
          tabBarIcon: ({ color, size }) => <Ionicons color={color} name="paw-outline" size={size} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "设置",
          tabBarIcon: ({ color, size }) => <Ionicons color={color} name="settings-outline" size={size} />,
        }}
      />
    </Tabs>
  );
}
