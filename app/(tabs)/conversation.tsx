import React, { useEffect, useRef, useState } from "react";
import { Platform, ScrollView, View } from "react-native";
import { useSQLiteContext } from "expo-sqlite";

import DBProvider from "@/utils/database";
import TranslationCard from "@/components/TranslationCard";
import VoiceTranslation from "@/models/VoiceTranslation";
import VoiceLanguageBox from "@/components/VoiceLanguageBox";
import { postQuestion } from "@/apis/translations";
import translate from "translate";
import useStoreGlobal from "@/stores/useStoreGlobal";

const ConversationPage = () => {
  const db = useSQLiteContext();
  const scrollViewRef = useRef<ScrollView>(null);
  const [voiceTranslations, setVoiceTranslations] = useState<
    VoiceTranslation[]
  >([]);

  useEffect(() => {
    const fetchVoiceTranslations = async () => {
      const defVoiceTranslations = await DBProvider.getVoiceConversation(db, {
        limit: 10,
      });

      setVoiceTranslations(defVoiceTranslations);
    };

    fetchVoiceTranslations();
  }, []);

  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [voiceTranslations]);

  const handleUpdate = async (voiceTranslation: VoiceTranslation) => {
    const changes = (
      await DBProvider.insertVoiceConversation(db, voiceTranslation)
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
      await DBProvider.insertVoiceConversation(db, AITransaltion)
    ).changes;

    if (!changes) return;

    setVoiceTranslations((prev) => [AITransaltion, ...prev]);
  };

  return (
    <View className={`flex-1 relative ${Platform.OS === "ios" && "bg-white"}`}>
      <ScrollView ref={scrollViewRef} className="p-4 pb-0 h-full mb-4">
        {voiceTranslations &&
          [...voiceTranslations].reverse().map((t, index) => (
            <View
              key={index}
              className={`mb-4 ${t.is_mine ? "items-end" : "items-start"}`}
            >
              <TranslationCard
                translation={t}
                className={t.is_mine ? "self-end" : "self-start"}
              />
            </View>
          ))}
      </ScrollView>
      <View className="fixed bottom-0 left-0 right-0 p-2 pt-0">
        <VoiceLanguageBox onUpdate={handleUpdate} />
      </View>
    </View>
  );
};

export default ConversationPage;
