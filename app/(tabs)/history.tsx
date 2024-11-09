import { useEffect, useState } from "react";
import { useIsFocused } from "@react-navigation/native";
import { EventRegister } from "react-native-event-listeners";
import { useSQLiteContext } from "expo-sqlite";
import { ScrollView, View } from "react-native";

import DBProvider from "@/utils/database";
import Translation from "@/models/Translation";
import TranslationCard from "@/components/TranslationCard";

export default function TabTwoScreen() {
  const db = useSQLiteContext();
  const isFocused = useIsFocused();
  const [translations, setTranslations] = useState<Translation[]>([]);

  const fetchHistory = async () => {
    const result = await DBProvider.getTranslations(db);
    setTranslations(result);
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
      <View className="p-5 flex flex-col gap-4 relative">
        {translations?.map((translation) => (
          <TranslationCard key={translation.id} translation={translation} />
        ))}
      </View>
    </ScrollView>
  );
}
