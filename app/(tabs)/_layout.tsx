import { Tabs } from "expo-router";
import React from "react";

import { TabBarIcon } from "@/components/navigation/TabBarIcon";
import { Colors } from "@/constants/Colors";
import { Text, View } from "react-native";

export default function TabLayout() {
  const colorScheme = "light";

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        tabBarStyle: {
          backgroundColor: Colors[colorScheme ?? "light"].background,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Translation App",
          headerStyle: {
            backgroundColor: Colors[colorScheme ?? "light"].headerBackground,
          },
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? "mic" : "mic-outline"} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="camera"
        options={{
          title: "Camera",
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              name={focused ? "camera" : "camera-outline"}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="bubbles"
        options={{
          title: undefined,
          tabBarLabel: () => null,
          tabBarIcon: ({ color, focused }) => (
            <View
              style={{
                backgroundColor: "rgba(33, 150, 243, 1)",
                padding: 10,
                borderRadius: 100,
              }}
            >
              <TabBarIcon
                name={focused ? "language" : "language-outline"}
                color={Colors.white}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          headerTitle: () => (
            <Text className="text-lg font-bold text-white">History</Text>
          ),
          headerStyle: {
            backgroundColor: Colors[colorScheme ?? "light"].headerBackground,
          },
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              name={focused ? "time" : "time-outline"}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="favorite"
        options={{
          headerTitle: () => (
            <Text className="text-lg font-bold text-white">Favorite</Text>
          ),
          headerStyle: {
            backgroundColor: Colors[colorScheme ?? "light"].headerBackground,
          },
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              name={focused ? "star" : "star-outline"}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
