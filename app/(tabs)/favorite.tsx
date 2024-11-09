import { useEffect, useRef, useState } from "react";
import {
  Animated,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useIsFocused } from "@react-navigation/native";
import { useSQLiteContext } from "expo-sqlite";

import DBProvider from "@/utils/database";
import Translation from "@/models/Translation";
import TranslationCard from "@/components/TranslationCard";

export default function TabTwoScreen() {
  const db = useSQLiteContext();
  const isFocused = useIsFocused();
  const [translations, setTranslations] = useState<Translation[]>([]);

  const slideAnim = useRef(new Animated.Value(100)).current;
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [onUndoFav, setOnUndoFav] = useState<(() => void) | null>(null);

  const fetchFavourite = async () => {
    const result = await DBProvider.getFavorites(db);
    setTranslations(result);
  };

  useEffect(() => {
    if (isFocused) fetchFavourite();
  }, [isFocused]);

  const handleUnFav = (handleUndo: () => void) => {
    setIsModalVisible(true);
    setOnUndoFav(() => handleUndo);

    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      hidePopup();
    }, 3000);
  };

  const hidePopup = () => {
    Animated.timing(slideAnim, {
      toValue: 100,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setIsModalVisible(false);
    });
  };

  return (
    <View className="relative h-full">
      <ScrollView>
        <View className="p-5 flex flex-col gap-4">
          {translations?.map((translation) => (
            <TranslationCard
              key={translation.id}
              translation={translation}
              onUnFav={handleUnFav}
            />
          ))}
        </View>
      </ScrollView>
      {isModalVisible && (
        <Animated.View
          style={[
            {
              transform: [{ translateY: slideAnim }],
            },
          ]}
          className="absolute bottom-5 left-5 right-5 bg-gray-800 p-4 rounded-xl items-center"
        >
          <Text className="text-white text-base">
            Bạn vừa thực hiện một hành động.
          </Text>
          <TouchableOpacity
            onPress={() => {
              if (!onUndoFav) return;
              onUndoFav();
              hidePopup();
            }}
          >
            <Text className="text-green-500 text-base mt-2">Hoàn Tác</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
}
