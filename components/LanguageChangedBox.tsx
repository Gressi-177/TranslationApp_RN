import Languages from "@/constants/Languages";
import useStoreGlobal from "@/stores/useStoreGlobal";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback } from "react";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";
import { Dropdown } from "react-native-element-dropdown";

const LanguageChangedBox = () => {
  const sourceLanguage = useStoreGlobal((state) => state.sourceLang);
  const targetLanguage = useStoreGlobal((state) => state.targetLang);
  const setSourceLang = useStoreGlobal((state) => state.setSourceLang);
  const setTargetLang = useStoreGlobal((state) => state.setTargetLang);
  const swapLanguages = useStoreGlobal((state) => state.swapLanguages);

  const renderSourceIcon = useCallback(
    () => (
      <Image
        source={sourceLanguage.img}
        style={styles.flagImage}
        width={24}
        height={24}
      />
    ),
    [sourceLanguage.img]
  );

  const renderTargetIcon = useCallback(
    () => (
      <Image
        source={targetLanguage.img}
        style={styles.flagImage}
        width={24}
        height={24}
      />
    ),
    [targetLanguage.img]
  );

  return (
    <View style={styles.container}>
      <View style={styles.languageContainer}>
        <Dropdown
          labelField="name"
          valueField="code"
          data={Languages}
          renderLeftIcon={renderSourceIcon}
          value={sourceLanguage.code}
          onChange={setSourceLang}
          style={styles.picker}
        />
      </View>

      <TouchableOpacity onPress={swapLanguages} style={styles.swapButton}>
        <Ionicons name="swap-horizontal-outline" size={24} />
      </TouchableOpacity>

      <View style={styles.languageContainer}>
        <Dropdown
          labelField="name"
          valueField="code"
          data={Languages}
          renderLeftIcon={renderTargetIcon}
          value={targetLanguage.code}
          onChange={setTargetLang}
          style={styles.picker}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#FFFBFE",
    borderRadius: 50,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  languageContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  flagImage: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  picker: {
    flex: 1,
    height: "auto",
  },
  swapButton: {
    paddingHorizontal: 16,
  },
});

export default LanguageChangedBox;
