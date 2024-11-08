import React, { useEffect, useRef, useState } from "react";
import { ScrollView, View } from "react-native";
import { useSQLiteContext } from "expo-sqlite";

import DBProvider from "@/utils/database";
import Translation from "@/models/Translation";
import TranslationCard from "@/components/TranslationCard";
import VoiceTranslation from "@/models/VoiceTranslation";
import VoiceLanguageBox from "@/components/VoiceLanguageBox";

const ConversationPage = () => {
  const db = useSQLiteContext();
  const scrollViewRef = useRef<ScrollView>(null);
  const [voiceTranslations, setVoiceTranslations] = useState<Translation[]>([]);

  useEffect(() => {
    // const fetchVoiceTranslations = async () => {
    //   const defVoiceTranslations = await DBProvider.getVoiceConversation(db, {
    //     limit: 10,
    //   });

    //   setVoiceTranslations(defVoiceTranslations);
    // };
    const fetchVoiceTranslations = async () => {
      const defVoiceTranslations = await DBProvider.getTranslations(db);

      setVoiceTranslations(defVoiceTranslations);
    };

    fetchVoiceTranslations();
  }, []);

  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: false });
    }
  }, [voiceTranslations]);

  const handleFavoriteClick = async (translation: Translation) => {
    await DBProvider.updateTranslation(db, {
      ...translation,
      is_marked: !translation.is_marked,
    });
  };

  return (
    <View className="flex-1 relative ">
      <ScrollView ref={scrollViewRef} className="p-4 pb-0 h-full mb-4">
        <View>
          {voiceTranslations?.map((t, index) => (
            <View
              key={t.id}
              className={`mb-4 ${
                index % 2 === 0 ? "items-start" : "items-end"
              }`}
            >
              <TranslationCard
                translation={t}
                handleFavoriteClick={handleFavoriteClick}
                className={index % 2 === 0 ? "self-start" : "self-end"}
              />
            </View>
          ))}
        </View>
      </ScrollView>
      <View className="fixed bottom-0 left-0 right-0 p-2 pt-0 ">
        <VoiceLanguageBox />
      </View>
    </View>
  );
};

export default ConversationPage;
