import { Tabs } from "expo-router";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";

import DBProvider from "@/utils/database";
import { Colors } from "@/constants/Colors";
import { TabBarIcon } from "@/components/navigation/TabBarIcon";
import { EventRegister } from "react-native-event-listeners";
import { useSQLiteContext } from "expo-sqlite";
import {
  AppState,
  AppStateStatus,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function TabLayout() {
  // const [appState, setAppState] = useState(AppState.currentState);
  const colorScheme = "light";

  // useEffect(() => {
  //   const handleAppStateChange = (nextAppState: AppStateStatus) => {
  //     if (appState === "active" && nextAppState.match(/inactive|background/)) {
  //       return <ReactMotion />;
  //     }
  //     setAppState(nextAppState);
  //   };

  //   const subscription = AppState.addEventListener(
  //     "change",
  //     handleAppStateChange
  //   );

  //   return () => {
  //     subscription.remove();
  //   };
  // }, [appState]);

  const db = useSQLiteContext();
  const handleClearAll = async () => {
    await DBProvider.deleteAllTranslations(db);
    EventRegister.emit("clearAll");
  };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        tabBarStyle: {
          backgroundColor: Colors[colorScheme ?? "light"].background,
        },
      }}
    >
      {/* <Tabs.Screen
        name="index"
        options={{
          headerTitle: () => (
            <Text className="text-lg font-bold text-white">
              Translation App
            </Text>
          ),
          headerStyle: {
            backgroundColor: Colors[colorScheme ?? "light"].headerBackground,
          },
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? "mic" : "mic-outline"} color={color} />
          ),
        }}
      /> */}
      <Tabs.Screen
        name="camera"
        options={{
          headerTitle: () => (
            <Text className="text-lg font-bold text-white">Camera</Text>
          ),
          headerStyle: {
            backgroundColor: Colors[colorScheme ?? "light"].headerBackground,
          },
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              name={focused ? "camera" : "camera-outline"}
              color={color}
            />
          ),
          tabBarLabel: "Camera",
        }}
      />
      <Tabs.Screen
        name="conversation"
        options={{
          headerTitle: () => (
            <Text className="text-lg font-bold text-white">
              Voice conversation
            </Text>
          ),
          headerStyle: {
            backgroundColor: Colors[colorScheme ?? "light"].headerBackground,
          },
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? "mic" : "mic-outline"} color={color} />
          ),
          tabBarLabel: "Conversation",
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          headerTitle: () => (
            <Text className="text-lg font-bold text-white">
              Translation App
            </Text>
          ),
          headerStyle: {
            backgroundColor: Colors[colorScheme ?? "light"].headerBackground,
          },
          tabBarLabel: () => null,
          tabBarIcon: ({ color, focused }) => (
            <View
              style={{
                backgroundColor: "#2196f3",
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
          headerRight: () => (
            <TouchableOpacity onPress={handleClearAll}>
              <Text className="text-white text-base mr-5">Clear all</Text>
            </TouchableOpacity>
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
          tabBarLabel: "History",
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
          tabBarLabel: "Favorite",
        }}
      />
    </Tabs>
  );
}
