import Languages from "@/constants/Languages";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";
import Language from "@/models/Language";
import VoiceTranslation from "@/models/VoiceTranslation";
import useStoreGlobal from "@/stores/useStoreGlobal";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { useCallback } from "react";
import { TouchableOpacity, View } from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import translate from "translate";

interface VoiceLanguageBoxProps {
  onUpdate: (voiceTransition: VoiceTranslation) => Promise<void>;
}

function VoiceLanguageBox({ onUpdate }: VoiceLanguageBoxProps) {
  const { isRecording, transcription, startRecording, stopRecording } =
    useAudioRecorder();

  const sourceLanguage = useStoreGlobal((state) => state.sourceLang);
  const targetLanguage = useStoreGlobal((state) => state.targetLang);
  const setSourceLang = useStoreGlobal((state) => state.setSourceLang);
  const setTargetLang = useStoreGlobal((state) => state.setTargetLang);
  const swapLanguages = useStoreGlobal((state) => state.swapLanguages);

  useEffect(() => {
    if (transcription) {
      const saveTranslatedText = async () => {
        const translation = await translate(transcription, {
          from: sourceLanguage.code,
          to: targetLanguage.code,
        });

        onUpdate({
          source_text: transcription,
          source_language: sourceLanguage.code,
          translated_text: translation,
          target_language: targetLanguage.code,
          is_mine: true,
        });
      };

      saveTranslatedText();
    }
  }, [transcription]);

  const renderTargetIcon = useCallback(
    () => (
      <TouchableOpacity
        className="p-2 rounded-full"
        style={{
          backgroundColor: isRecording ? "#FF6600" : "#003366",
        }}
        onPress={isRecording ? stopRecording : startRecording}
      >
        <Ionicons name="mic" size={24} color={"white"} />
      </TouchableOpacity>
    ),
    [targetLanguage.img, isRecording]
  );

  return (
    <View
      className="bg-[rgba(255,251,254,1)] shadow-2xl rounded-full shadow-black/30"
      style={{ elevation: 3 }}
    >
      <View className="flex flex-row items-center p-2">
        <Dropdown
          labelField="name"
          valueField="code"
          data={Languages}
          renderRightIcon={() => <></>}
          value={sourceLanguage.code}
          onChange={setSourceLang}
          selectedTextStyle={{
            textAlign: "center",
            fontWeight: "400",
          }}
          style={{
            flexGrow: 1,
          }}
        />
        <TouchableOpacity onPress={swapLanguages} className="px-4">
          <Ionicons name="swap-horizontal-outline" size={24} />
        </TouchableOpacity>
        <Dropdown
          labelField="name"
          valueField="code"
          data={Languages}
          renderRightIcon={renderTargetIcon}
          value={targetLanguage.code}
          onChange={setTargetLang}
          selectedTextStyle={{
            textAlign: "center",
            fontWeight: "400",
          }}
          style={{
            flexGrow: 1,
          }}
        />
      </View>
    </View>
  );
}

export default VoiceLanguageBox;
