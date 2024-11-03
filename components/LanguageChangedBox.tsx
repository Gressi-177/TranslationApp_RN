import React, { useCallback } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Dropdown } from "react-native-element-dropdown";
import { Image, TouchableOpacity, View } from "react-native";

import Languages from "@/constants/Languages";
import useStoreGlobal from "@/stores/useStoreGlobal";

const LanguageChangedBox = () => {
  const sourceLanguage = useStoreGlobal((state) => state.sourceLang);
  const targetLanguage = useStoreGlobal((state) => state.targetLang);
  const setSourceLang = useStoreGlobal((state) => state.setSourceLang);
  const setTargetLang = useStoreGlobal((state) => state.setTargetLang);
  const swapLanguages = useStoreGlobal((state) => state.swapLanguages);

  const renderSourceIcon = useCallback(
    () => <Image source={sourceLanguage.img} className="w-6 h-6 mr-2" />,
    [sourceLanguage.img]
  );

  const renderTargetIcon = useCallback(
    () => <Image source={targetLanguage.img} className="w-6 h-6 mr-2" />,
    [targetLanguage.img]
  );

  return (
    <View
      className="flex flex-row items-center p-4 bg-[#FFFBFE] rounded-full shadow-md shadow-black/15"
      style={{ elevation: 3 }}
    >
      <Dropdown
        labelField="name"
        valueField="code"
        data={Languages}
        renderLeftIcon={renderSourceIcon}
        value={sourceLanguage.code}
        onChange={setSourceLang}
        style={{
          flexGrow: 1,
          paddingBottom: 2,
          borderBottomColor: "rgba(189, 189, 189, 1)",
          borderBottomWidth: 1,
        }}
      />

      <TouchableOpacity onPress={swapLanguages} className="px-4">
        <Ionicons name="swap-horizontal-outline" size={24} />
      </TouchableOpacity>

      <Dropdown
        labelField="name"
        valueField="code"
        data={Languages}
        renderLeftIcon={renderTargetIcon}
        value={targetLanguage.code}
        onChange={setTargetLang}
        style={{
          flexGrow: 1,
          paddingBottom: 2,
          borderBottomColor: "rgba(189, 189, 189, 1)",
          borderBottomWidth: 1,
        }}
      />
    </View>
  );
};

export default LanguageChangedBox;
