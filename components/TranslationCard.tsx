import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useRoute } from "@react-navigation/native";
import { useSQLiteContext } from "expo-sqlite";
import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

import Translation from "@/models/Translation";
import DBProvider from "@/utils/database";
interface TranslationCard {
  translation: Translation;
  className?: string;
  onUnFav?: (handleUndo: () => void) => void;
}
export default function TranslationCard({
  translation,
  className,
  onUnFav,
}: TranslationCard) {
  const route = useRoute();
  const db = useSQLiteContext();
  const [translationTemp, setTranslationTemp] = useState(translation);
  const {
    is_marked,
    source_language,
    source_text,
    target_language,
    translated_text,
  } = translationTemp;

  const handleFavoriteClick = async (curTranslation: Translation) => {
    const changes = (
      await DBProvider.updateTranslation(db, {
        ...curTranslation,
        is_marked: !curTranslation.is_marked,
      })
    )?.changes;

    if (!changes) return;

    setTranslationTemp({
      ...curTranslation,
      is_marked: !curTranslation.is_marked,
    });

    if (curTranslation.is_marked && onUnFav) {
      onUnFav(() =>
        handleFavoriteClick({
          ...curTranslation,
          is_marked: !curTranslation.is_marked,
        })
      );
    }
  };

  const handleViewTranslation = () => {
    console.log("Viewing Translation Details");
  };

  const renderCard = () => {
    return (
      <View className={className}>
        <View className="relative px-7 py-4 bg-white rounded-xl shadow-sm">
          <TouchableOpacity className="gap-2" onPress={handleViewTranslation}>
            <View className="flex flex-row items-center text-base pr-5">
              <Text className="font-semibold w-5">{source_language}</Text>
              <Text
                className="ml-4 text-[#036]"
                numberOfLines={3}
                ellipsizeMode="tail"
              >
                {source_text}
              </Text>
            </View>
            <View className="w-full h-px bg-[#969696]"></View>
            <View className="flex flex-row items-center text-base pr-5">
              <Text className="w-5 font-semibold">{target_language}</Text>
              <Text
                className="ml-4 text-[#060]"
                numberOfLines={3}
                ellipsizeMode="tail"
              >
                {translated_text}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleFavoriteClick(translationTemp)}
            className="absolute top-[8px] right-2"
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
  };

  if (route.name !== "favorite") return renderCard();
  else if (translationTemp.is_marked) return renderCard();
}
