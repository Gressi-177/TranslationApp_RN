import { Audio } from "expo-av";
import * as Speech from "expo-speech";
import { useSQLiteContext } from "expo-sqlite";
import React, { useEffect, useRef, useState } from "react";

import {
  ActivityIndicator,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";
import translate from "translate";

import { postQuestion } from "@/apis/translations";
import VoiceLanguageBox from "@/components/VoiceLanguageBox";
import VoiceTranslationMessage from "@/components/VoiceTranslationMessage";
import VoiceTranslation, {
  VoiceTranslationRoom,
} from "@/models/VoiceTranslation";
import useStoreGlobal from "@/stores/useStoreGlobal";
import DBProvider from "@/utils/database";

const ConversationPage = () => {
  const db = useSQLiteContext();
  const scrollViewRef = useRef<ScrollView>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [voiceTranslationRoom, setVoiceTranslationRoom] =
    useState<VoiceTranslationRoom>();
  const [voiceTranslations, setVoiceTranslations] = useState<
    VoiceTranslation[]
  >([]);

  const sourceLanguage = useStoreGlobal((state) => state.sourceLang);
  const targetLanguage = useStoreGlobal((state) => state.targetLang);

  useEffect(() => {
    const fetchVoiceTranslations = async () => {
      setIsLoading(true);

      let defVoiceTranslationRoom = await DBProvider.getVoiceConversationRoom(
        db,
        {
          sourceLanguage: sourceLanguage.code,
          targetLanguage: targetLanguage.code,
        }
      );

      if (!defVoiceTranslationRoom) {
        const id = (
          await DBProvider.insertVoiceConversationRoom(
            db,
            sourceLanguage.code,
            targetLanguage.code
          )
        ).lastInsertRowId;

        if (id) {
          defVoiceTranslationRoom = {
            id: id,
            source_language: sourceLanguage.code,
            target_language: targetLanguage.code,
          };
        }
      }

      if (!defVoiceTranslationRoom?.id) {
        setIsLoading(false);
        return;
      }

      const defVoiceTranslations =
        await DBProvider.getVoiceConversationMessages(db, {
          roomId: defVoiceTranslationRoom.id,
          limit: 10,
        });

      setVoiceTranslationRoom(defVoiceTranslationRoom);
      setVoiceTranslations(defVoiceTranslations);
      setIsLoading(false);
    };

    fetchVoiceTranslations();
  }, [sourceLanguage, targetLanguage]);

  const voiceText = async (text: string, language: string) => {
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
    });
    const isSpeaking = await Speech.isSpeakingAsync();

    if (isSpeaking) {
      await Speech.stop();
    }

    Speech.speak(text, {
      language: language,
      pitch: 1.0,
    });
  };

  const handleUpdate = async (voiceTranslation: VoiceTranslation) => {
    if (!voiceTranslationRoom?.id) return;

    const changes = (
      await DBProvider.insertVoiceConversationMessage(
        db,
        voiceTranslationRoom.id,
        voiceTranslation
      )
    ).changes;

    if (!changes) return;

    if (!voiceTranslations || voiceTranslations.length <= 0)
      setVoiceTranslations([voiceTranslation]);
    else {
      setVoiceTranslations((prev) => [voiceTranslation, ...prev]);
    }

    updateAITranslationAnswer(voiceTranslation);
  };

  const updateAITranslationAnswer = async (
    voiceTranslation: VoiceTranslation
  ) => {
    if (!voiceTranslationRoom?.id) return;

    const questionPrefix = await translate(
      "Answer the following question briefly in maximum 50 characters",
      {
        from: "en",
        to: voiceTranslation.source_language,
      }
    );

    const AIResponse = await postQuestion(
      `${questionPrefix}: ${voiceTranslation.source_text}`
    );

    if (!AIResponse) return;

    const AISourceText =
      AIResponse["candidates"][0]["content"]["parts"][0]["text"];

    const AITranslatedText = await translate(AISourceText, {
      from: voiceTranslation.source_language,
      to: voiceTranslation.target_language,
    });

    const AITransaltion = {
      source_text: AISourceText.trim(),
      source_language: voiceTranslation.source_language,
      translated_text: AITranslatedText.trim(),
      target_language: voiceTranslation.target_language,
      is_mine: false,
    };

    const changes = (
      await DBProvider.insertVoiceConversationMessage(
        db,
        voiceTranslationRoom.id,
        AITransaltion
      )
    ).changes;

    if (!changes) return;

    voiceText(AITransaltion.source_text, AITransaltion.source_language);
    setVoiceTranslations((prev) => [AITransaltion, ...prev]);
  };

  return (
    <View className={`flex-1 relative ${Platform.OS === "ios" && "bg-white"}`}>
      <ScrollView
        ref={scrollViewRef}
        scrollEventThrottle={400}
        onContentSizeChange={() =>
          scrollViewRef.current?.scrollToEnd({ animated: true })
        }
        className="p-4 pb-0 h-full"
      >
        <View className="py-4">
          {isLoading && (
            <View className="p-4 items-center">
              <ActivityIndicator size="large" color="#2196f3" />
              <Text>Loading more...</Text>
            </View>
          )}
          {!isLoading &&
            voiceTranslations &&
            [...voiceTranslations].reverse().map((t, index) => (
              <View
                key={`${t.id}${index}`}
                className={`mb-4 ${t.is_mine ? "items-end" : "items-start"}`}
              >
                <VoiceTranslationMessage
                  translation={t}
                  className={t.is_mine ? "self-end" : "self-start"}
                />
              </View>
            ))}
        </View>
      </ScrollView>
      <View className="fixed bottom-0 left-0 right-0 p-2 pt-0">
        <VoiceLanguageBox onUpdate={handleUpdate} />
      </View>
    </View>
  );
};

export default ConversationPage;
