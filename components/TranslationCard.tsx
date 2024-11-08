import Translation from "@/models/Translation";
import DBProvider from "@/utils/database";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useSQLiteContext } from "expo-sqlite";
import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
interface TranslationCard {
  translation: Translation;
  className?: string;
}
export default function TranslationCard({
  translation,
  className,
}: TranslationCard) {
  const db = useSQLiteContext();
  const [translationTemp, setTranslationTemp] = useState(translation);
  const {
    is_marked,
    source_language,
    source_text,
    target_language,
    translated_text,
  } = translationTemp;

  const handleFavoriteClick = async () => {
    const changes = (
      await DBProvider.updateTranslation(db, {
        ...translationTemp,
        is_marked: !translationTemp.is_marked,
      })
    )?.changes;

    if (changes)
      setTranslationTemp((prev) => ({
        ...prev,
        is_marked: !prev.is_marked,
      }));
  };

  return (
    <View className={className}>
      <View className="relative px-7 py-4 bg-white rounded-xl shadow-sm gap-2">
        <View className="flex flex-row items-center text-base">
          <Text className="font-semibold">{source_language}</Text>
          <Text className="ml-4 text-[#036]">{source_text}</Text>
        </View>
        <View className="w-full h-px bg-[#969696]"></View>
        <View className="flex flex-row items-center text-base">
          <Text className=" font-semibold">{target_language}</Text>
          <Text className="ml-4 text-[#060]">{translated_text}</Text>
        </View>
        <TouchableOpacity
          onPress={() => handleFavoriteClick()}
          className="absolute top-[6px] right-2"
        >
          {is_marked ? (
            <FontAwesome name="star" size={20} color="black" />
          ) : (
            <FontAwesome name="star-o" size={20} color="black" />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
