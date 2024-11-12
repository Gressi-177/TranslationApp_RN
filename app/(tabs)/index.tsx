import { Audio } from "expo-av";
import * as Clipboard from "expo-clipboard";
import * as Speech from "expo-speech";
import { useSQLiteContext } from "expo-sqlite";
import React, { useEffect, useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import translate from "translate";

import LanguageChangedBox from "@/components/LanguageChangedBox";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";
import Translation from "@/models/Translation";
import useStoreGlobal from "@/stores/useStoreGlobal";
import DBProvider from "@/utils/database";
import { Ionicons } from "@expo/vector-icons";
import { useIsFocused } from "@react-navigation/native";

const HomePage = () => {
  const db = useSQLiteContext();

  const [isTranslated, setIsTranslated] = useState(false);
  const [prevLanguage, setPrevLanguage] = useState<string>();
  const [translatedText, setTranslatedText] = useState("");
  const [currentTranslation, setCurrentTranslation] = useState<Translation>();

  const sourceText = useStoreGlobal((state) => state.sourceText);
  const sourceLanguage = useStoreGlobal((state) => state.sourceLang);
  const targetLanguage = useStoreGlobal((state) => state.targetLang);
  const setSourceText = useStoreGlobal((state) => state.setSourceText);

  const { isRecording, transcription, startRecording, stopRecording } =
    useAudioRecorder();

  const isFocused = useIsFocused();

  useEffect(() => {
    translate.engine = "google";
  }, []);

  useEffect(() => {
    if (transcription) {
      setSourceText(transcription);
      // translateText(transcription);
    }
  }, [transcription]);

  useEffect(() => {
    if (isFocused && sourceText) {
      translateText(sourceText);
    }
  }, [isFocused]);

  const translateText = async (text: string) => {
    if (!text) return;

    setIsTranslated(false);
    const translation = await translate(text, {
      from: sourceLanguage.code,
      to: targetLanguage.code,
    });

    const result = await DBProvider.insertTranslation(db, {
      source_text: sourceText,
      source_language: sourceLanguage.code,
      translated_text: translation,
      target_language: targetLanguage.code,
    });

    const fetchedTranslation = await DBProvider.getTranslation(
      db,
      result.lastInsertRowId
    );

    if (fetchedTranslation) setCurrentTranslation(fetchedTranslation);

    setTranslatedText(translation);
    setIsTranslated(true);
  };

  const updateMarkTranslation = async () => {
    if (!currentTranslation) return;

    const result = await DBProvider.updateTranslation(db, {
      ...currentTranslation,
      is_marked: !currentTranslation.is_marked,
    });

    if (!result) return;

    if (result.lastInsertRowId > 0) {
      setCurrentTranslation({
        ...currentTranslation,
        is_marked: !currentTranslation.is_marked,
      });
    }
  };

  const voiceText = async (text: string, language: string) => {
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
    });
    const isSpeaking = await Speech.isSpeakingAsync();

    if (isSpeaking) {
      await Speech.stop();

      if (prevLanguage === language) return;
    }

    setPrevLanguage(language);
    Speech.speak(text, {
      language: language,
      pitch: 1.0,
    });
  };

  return (
    <ScrollView className="bg-[#fff]">
      <View className="py-4">
        <LanguageChangedBox />
        <View className="px-5 py-[2px] mt-5">
          <View style={styles.box} className="p-5 rounded-2xl bg-[#fff]">
            <View className="flex flex-row justify-between items-center">
              <View className="flex flex-row items-center">
                <Text className="text-[#003366] text-[16px] font-bold mr-2">
                  {sourceLanguage.name}
                </Text>
                <TouchableOpacity
                  onPress={() => voiceText(sourceText, sourceLanguage.language)}
                >
                  <Ionicons
                    name="volume-low-outline"
                    size={24}
                    color="#003366"
                  />
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                onPress={() => {
                  if (sourceText) {
                    setSourceText("");
                  }
                  setIsTranslated(false);
                  setTranslatedText("");
                }}
              >
                <Ionicons name="close" size={24} />
              </TouchableOpacity>
            </View>
            <ScrollView
              style={{ minHeight: 105, maxHeight: 160, marginBottom: 16 }}
            >
              <View className="py-2">
                <TextInput
                  className="border-0 text-black"
                  multiline
                  numberOfLines={1}
                  placeholder="Enter text here..."
                  placeholderTextColor={"#bbbbbb"}
                  value={sourceText}
                  onChangeText={setSourceText}
                />
              </View>
            </ScrollView>

            <View className="flex flex-row justify-between items-center">
              <TouchableOpacity
                className="bg-[#003366] p-2 rounded-full"
                onPress={isRecording ? stopRecording : startRecording}
              >
                <Ionicons
                  name={isRecording ? "stop" : "mic"}
                  size={22}
                  color={"white"}
                />
              </TouchableOpacity>
              <TouchableOpacity
                className="bg-[#FF6600] py-2 px-4 rounded-full"
                onPress={() => translateText(sourceText)}
              >
                <Text className="text-white text-[14px]">Translate</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {isTranslated && (
          <View className="px-5 py-[2px] mt-5">
            <View style={styles.box} className="p-5 rounded-2xl bg-[#fff]">
              <View className="flex flex-row justify-between items-center">
                <View className="flex flex-row items-center">
                  <Text className="text-[#003366] text-[16px] font-bold mr-2">
                    {targetLanguage.name}
                  </Text>
                  <TouchableOpacity
                    onPress={() =>
                      voiceText(translatedText, targetLanguage.language)
                    }
                  >
                    <Ionicons
                      name="volume-low-outline"
                      size={24}
                      color="#003366"
                    />
                  </TouchableOpacity>
                </View>
              </View>
              <ScrollView
                style={{ minHeight: 105, maxHeight: 160, marginBottom: 16 }}
              >
                <View className="py-2">
                  <TextInput
                    className="border-0 text-black"
                    multiline
                    placeholder="Enter text here..."
                    placeholderTextColor={"#bbbbbb"}
                    value={translatedText}
                    editable={false}
                  />
                </View>
              </ScrollView>

              <View className="flex flex-row justify-end space-x-4 gap-4">
                <TouchableOpacity
                  onPress={() => Clipboard.setStringAsync(translatedText)}
                >
                  <Ionicons name="copy-outline" size={24} color="#003366" />
                </TouchableOpacity>
                <TouchableOpacity onPress={updateMarkTranslation}>
                  <Ionicons
                    name={
                      currentTranslation && currentTranslation.is_marked
                        ? "star"
                        : "star-outline"
                    }
                    size={24}
                    color="#003366"
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

export default HomePage;
const styles = StyleSheet.create({
  box: {
    ...Platform.select({
      ios: {
        shadowColor: "#000000",
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.17,
        shadowRadius: 2.54,
      },
      android: {
        elevation: 3,
      },
    }),
  },
});
