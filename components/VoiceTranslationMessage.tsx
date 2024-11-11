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
import translate from "translate";
import FontAwesome from "@expo/vector-icons/FontAwesome";

import DBProvider from "@/utils/database";
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
    text: string,
    isSource: boolean
  ) => {
    const { selection } = event.nativeEvent;
    const sourceLang = isSource ? source_language : target_language;
    const targetLang = isSource ? target_language : source_language;

    if (selection.start !== selection.end) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(async () => {
        const translation = await translate(
          text.slice(selection.start, selection.end),
          {
            from: sourceLang,
            to: targetLang,
          }
        );

        if (!translation) return;

        setSelectedTranslation({
          source_text: text.slice(selection.start, selection.end),
          source_language: sourceLang,
          translated_text: translation,
          target_language: targetLang,
        });

        setShowContextMenu(true);
      }, 500);
    }
  };

  return (
    <View className={className}>
      <View className="relative px-7 py-4 bg-white rounded-xl shadow-sm gap-2">
        <View className="text-base relative">
          <TextInput
            ref={textInputRef}
            className="text-[#036]"
            value={source_text}
            onSelectionChange={(e) =>
              handleSelectionChange(e, source_text, true)
            }
          />
        </View>
        <View className="w-full h-px bg-[#969696]"></View>
        <View className="text-base">
          <TextInput
            ref={textInputRef}
            className="text-[#060]"
            value={translated_text}
            onSelectionChange={(e) =>
              handleSelectionChange(e, translated_text, false)
            }
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
