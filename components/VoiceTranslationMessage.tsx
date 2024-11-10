import { useRef, useState } from "react";
import {
  Modal,
  NativeSyntheticEvent,
  Text,
  TextInput,
  TextInputSelectionChangeEventData,
  TouchableOpacity,
  View,
} from "react-native";
import { useSQLiteContext } from "expo-sqlite";
import FontAwesome from "@expo/vector-icons/FontAwesome";

import DBProvider from "@/utils/database";
import Translation from "@/models/Translation";
import translate from "translate";
import VoiceTranslation from "@/models/VoiceTranslation";

interface VoiceTranslationMessageProps {
  translation: VoiceTranslation;
  className?: string;
  onUnFav?: (handleUndo: () => void) => void;
}

export default function VoiceTranslationMessage({
  translation,
  className,
  onUnFav,
}: VoiceTranslationMessageProps) {
  const db = useSQLiteContext();
  const textInputRef = useRef<TextInput>(null);
  const [selectedTranslation, setSelectedTranslation] =
    useState<VoiceTranslation>();
  const [showContextMenu, setShowContextMenu] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [translationTemp, setTranslationTemp] =
    useState<VoiceTranslation>(translation);
  const {
    is_marked,
    source_language,
    source_text,
    target_language,
    translated_text,
  } = translationTemp;

  const handleFavoriteClick = async (curTranslation: VoiceTranslation) => {
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

  const handleSelectionChange = (
    event: NativeSyntheticEvent<TextInputSelectionChangeEventData>,
    text: string
  ) => {
    const { selection } = event.nativeEvent;

    if (selection.start !== selection.end) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(async () => {
        const translation = await translate(
          text.slice(selection.start, selection.end),
          {
            from: source_language,
            to: target_language,
          }
        );

        if (!translation) return;

        setSelectedTranslation({
          source_text: text.slice(selection.start, selection.end),
          source_language: source_language,
          translated_text: translation,
          target_language: target_language,
          is_mine: true,
        });

        setShowContextMenu(true);
      }, 500);
    }
  };

  const handleCopy = () => {
    setShowContextMenu(false);
    console.log("Đã sao chép văn bản!");
  };

  return (
    <View className={className}>
      <View className="relative px-7 py-4 bg-white rounded-xl shadow-sm gap-2">
        <View className="text-base relative">
          <TextInput
            ref={textInputRef}
            className="text-[#036]"
            value={source_text}
            onSelectionChange={(e) => handleSelectionChange(e, source_text)}
          />
        </View>
        <View className="w-full h-px bg-[#969696]"></View>
        <View className="text-base">
          <TextInput
            ref={textInputRef}
            className="text-[#060]"
            value={translated_text}
            onSelectionChange={(e) => handleSelectionChange(e, translated_text)}
          />
        </View>
        <Modal
          transparent={true}
          visible={showContextMenu}
          animationType="fade"
          onRequestClose={() => setShowContextMenu(false)}
        >
          <View className="flex-1 justify-center items-center bg-black/30">
            <View>
              <TouchableOpacity
                onPress={() => setShowContextMenu(false)}
                className="py-2"
              >
                <Text className="text-center">Đóng</Text>
              </TouchableOpacity>
              {selectedTranslation && (
                <VoiceTranslationMessage translation={selectedTranslation} />
              )}
            </View>
          </View>
        </Modal>
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
