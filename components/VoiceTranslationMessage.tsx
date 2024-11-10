import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useSQLiteContext } from "expo-sqlite";
import FontAwesome from "@expo/vector-icons/FontAwesome";

import DBProvider from "@/utils/database";
import Translation from "@/models/Translation";

interface VoiceTranslationMessageProps {
  translation: Translation;
  className?: string;
  onUnFav?: (handleUndo: () => void) => void;
}

export default function VoiceTranslationMessage({
  translation,
  className,
  onUnFav,
}: VoiceTranslationMessageProps) {
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

  return (
    <View className={className}>
      <View className="relative px-7 py-4 bg-white rounded-xl shadow-sm gap-2">
        <View className="text-base">
          <Text className="text-[#036]">{source_text}</Text>
        </View>
        <View className="w-full h-px bg-[#969696]"></View>
        <View className="text-base">
          <Text className="text-[#060]">{translated_text}</Text>
        </View>
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
}
