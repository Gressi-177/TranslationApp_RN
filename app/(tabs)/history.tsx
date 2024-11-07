import Translation from "@/models/Translation";
import DBProvider from "@/utils/database";
import { EventRegister } from "react-native-event-listeners";

import TranslationCard from "@/components/TranslationCard";
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
      if (isFocused) await fetchHistory();
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
