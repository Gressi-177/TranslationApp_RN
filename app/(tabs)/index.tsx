import React, { useState, useEffect } from "react";
import translate from "translate";
import * as Speech from "expo-speech";
import * as Clipboard from "expo-clipboard";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { useSQLiteContext } from "expo-sqlite";

import Language from "@/models/Language";
import DBProvider from "@/utils/database";
import Translation from "@/models/Translation";
import { Ionicons } from "@expo/vector-icons";
import Languages from "@/constants/Languages";
import LanguageChangedBox from "@/components/LanguageChangedBox";
import { useAppSelector } from "@/features/hook";

const HomePage = ({
  sourceText = "",
  sourceLanguage = Languages[0],
  targetLanguage = Languages[1],
}: {
  sourceText: string;
  sourceLanguage: Language;
  targetLanguage: Language;
}) => {
  const db = useSQLiteContext();

  const [isTranslated, setIsTranslated] = useState(false);
  const [prevLanguage, setPrevLanguage] = useState<string>();
  const [translatedText, setTranslatedText] = useState("");
  const [sourceInputText, setSourceInputText] = useState(sourceText);
  const [currentTranslation, setCurrentTranslation] = useState<Translation>();

  useEffect(() => {
    translate.engine = "google";
  }, []);

  useEffect(() => {
    setSourceInputText(sourceText);
    translateText(sourceText);
  }, [sourceText, sourceLanguage, targetLanguage]);

  const translateText = async (text: string) => {
    if (!text) return;

    setIsTranslated(false);
    const translation = await translate(text, {
      from: sourceLanguage.code,
      to: targetLanguage.code,
    });

    const result = await DBProvider.insertTranslation(db, {
      source_text: sourceInputText,
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
      is_marked: currentTranslation.is_marked,
    });

    if (!result) return;

    if (result.lastInsertRowId > 0) {
      setCurrentTranslation({
        ...currentTranslation,
        is_marked: currentTranslation.is_marked,
      });
    }
  };

  const voiceText = async (text: string, language: string) => {
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
    <ScrollView style={styles.container}>
      <View>
        <LanguageChangedBox />
      </View>
      <View style={styles.boxContainer}>
        <View style={styles.header}>
          <View style={styles.languageRow}>
            <Text style={styles.languageText}>{sourceLanguage.name}</Text>
            <TouchableOpacity
              onPress={() =>
                voiceText(sourceInputText, sourceLanguage.language)
              }
            >
              <Ionicons name="volume-low-outline" size={24} color="#003366" />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            onPress={() => {
              if (sourceInputText) {
                setSourceInputText("");
              }
              setIsTranslated(false);
              setTranslatedText("");
            }}
          >
            <Ionicons name="close" size={24} />
          </TouchableOpacity>
        </View>
        <TextInput
          style={styles.textInput}
          multiline
          numberOfLines={3}
          placeholder="Enter text here..."
          placeholderTextColor={"#bbbbbb"}
          value={sourceInputText}
          onChangeText={setSourceInputText}
        />
        <View style={styles.footer}>
          <TouchableOpacity
            onPress={() => {
              /* Handle STT here */
            }}
          >
            <Ionicons name="mic-outline" size={24} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.translateButton}
            onPress={() => translateText(sourceInputText)}
          >
            <Text style={styles.translateButtonText}>Translate</Text>
          </TouchableOpacity>
        </View>
      </View>
      {isTranslated && (
        <View style={styles.boxContainer}>
          <View style={styles.header}>
            <View style={styles.languageRow}>
              <Text style={styles.languageText}>{targetLanguage.name}</Text>
              <TouchableOpacity
                onPress={() =>
                  voiceText(translatedText, targetLanguage.language)
                }
              >
                <Ionicons name="volume-low-outline" size={24} color="#003366" />
              </TouchableOpacity>
            </View>
          </View>
          <TextInput
            style={styles.textInput}
            multiline
            placeholder="Enter text here..."
            placeholderTextColor={"#bbbbbb"}
            value={translatedText}
            editable={false}
          />
          <View style={styles.iconActions}>
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
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: "#FFF" },
  boxContainer: {
    borderRadius: 12,
    shadowColor: "rgba(0, 0, 0, 0.15)",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 3,
    elevation: 5,
    marginTop: 16,
    padding: 16,
    backgroundColor: "rgba(255, 251, 254, 1)",
  },
  languageBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  languageRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  languageText: {
    color: "rgba(0, 51, 102, 1)",
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 8,
  },
  textInput: {
    borderWidth: 0,
    marginTop: 8,
    marginBottom: 16,
    padding: 8,
    borderRadius: 8,
    minHeight: 80,
    color: "black",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  inputBox: {
    backgroundColor: "#FFF8FE",
    padding: 16,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 3,
    marginBottom: 16,
  },
  translateButtonText: {
    color: "white",
    fontSize: 14,
  },
  translateButton: {
    backgroundColor: "#FF6600",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 50,
  },
  buttonText: { color: "#FFF", fontSize: 14 },
  iconActions: { flexDirection: "row", justifyContent: "flex-end", gap: 16 },
});

export default HomePage;
