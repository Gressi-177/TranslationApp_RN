import Languages from "@/constants/Languages";
import Language from "@/models/Language";
import useStoreGlobal from "@/stores/useStoreGlobal";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { useCallback } from "react";
import { TouchableOpacity, View } from "react-native";
import { Dropdown } from "react-native-element-dropdown";

function VoiceLanguageBox() {
  const [voice, setVoice] = useState({
    sourceVoice: false,
    targetVoice: false,
  });

  const sourceLanguage = useStoreGlobal((state) => state.sourceLang);
  const targetLanguage = useStoreGlobal((state) => state.targetLang);
  const setSourceLang = useStoreGlobal((state) => state.setSourceLang);
  const setTargetLang = useStoreGlobal((state) => state.setTargetLang);
  const swapLanguages = useStoreGlobal((state) => state.swapLanguages);

  const onTouchOpenVoice = (lanaguage: Language) => {
    if (lanaguage.code === sourceLanguage.code) {
      setVoice((prev) => ({
        ...prev,
        sourceVoice: !prev.sourceVoice,
      }));
    } else {
      setVoice((prev) => ({
        ...prev,
        targetVoice: !prev.targetVoice,
      }));
    }
  };

  const renderSourceIcon = useCallback(
    () => (
      <TouchableOpacity
        className="p-2 rounded-full"
        style={{
          backgroundColor: voice.sourceVoice ? "#FF6600" : "#003366",
        }}
        onPress={() => onTouchOpenVoice(sourceLanguage)}
        disabled={voice.targetVoice}
      >
        <Ionicons name="mic" size={24} color={"white"} />
      </TouchableOpacity>
    ),
    [sourceLanguage.img, voice]
  );

  const renderTargetIcon = useCallback(
    () => (
      <TouchableOpacity
        className="p-2 rounded-full"
        style={{
          backgroundColor: voice.targetVoice ? "#FF6600" : "#003366",
        }}
        onPress={() => onTouchOpenVoice(targetLanguage)}
        disabled={voice.sourceVoice}
      >
        <Ionicons name="mic" size={24} color={"white"} />
      </TouchableOpacity>
    ),
    [targetLanguage.img, voice]
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
          renderLeftIcon={renderSourceIcon}
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
