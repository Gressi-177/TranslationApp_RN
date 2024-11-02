import TranslationCard from "@/components/TranslationCard";
import Translation from "@/models/Translation";
import DBProvider from "@/utils/database";
import { useIsFocused } from "@react-navigation/native";
import { useSQLiteContext } from "expo-sqlite";
import { useEffect, useState } from "react";
import { ScrollView, View } from "react-native";

export default function TabTwoScreen() {
  const db = useSQLiteContext();
  const isFocused = useIsFocused();
  const [translations, setTranslations] = useState<Translation[]>([]);
  const fetchFavourite = async () => {
    const result = await DBProvider.getFavorites(db);
    setTranslations(result);
  };
  const handleFavoriteClick = async (translation: Translation) => {
    await DBProvider.updateTranslation(db, {
      ...translation,
      is_marked: !translation.is_marked,
    });

    await fetchFavourite();
  };
  useEffect(() => {
    if (isFocused) fetchFavourite();
  }, [isFocused]);
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
