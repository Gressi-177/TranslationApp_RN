import TranslationCard from "@/components/TranslationCard";
import Translation from "@/models/Translation";
import DBProvider from "@/utils/database";
import { EventRegister } from "react-native-event-listeners";

import { useIsFocused } from "@react-navigation/native";
import { useSQLiteContext } from "expo-sqlite";
import { useEffect, useState } from "react";
import { ScrollView, View } from "react-native";

export default function TabTwoScreen() {
  const db = useSQLiteContext();
  const isFocused = useIsFocused();

  const [translations, setTranslations] = useState<Translation[]>([]);
  const fetchHistory = async () => {
    const result = await DBProvider.getTranslations(db);
    setTranslations(result);
  };
  const handleFavoriteClick = async (translation: Translation) => {
    await DBProvider.updateTranslation(db, {
      ...translation,
      is_marked: !translation.is_marked,
    });

    await fetchHistory();
  };
  useEffect(() => {
    if (isFocused) fetchHistory();
  }, [isFocused]);

  useEffect(() => {
    EventRegister.addEventListener("clearAll", async () => {
      try {
        await fetchHistory(); // Gọi hàm bất đồng bộ
      } catch (error) {
        console.error("Error fetching history: ", error); // Xử lý lỗi
      }
    });
    return () => {
      EventRegister.removeEventListener("clearAll");
    };
  }, []);
  return (
    <ScrollView>
      <View className="p-5 flex flex-col gap-4">
        {translations?.map((translation) => (
          <TranslationCard
            key={translation.id}
            translation={translation}
            handleFavoriteClick={handleFavoriteClick}
          />
        ))}
      </View>
    </ScrollView>
  );
}
