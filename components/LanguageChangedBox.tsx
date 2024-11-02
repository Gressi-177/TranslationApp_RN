import React from "react";
import { View, Image, TouchableOpacity, StyleSheet } from "react-native";

import Languages from "@/constants/Languages";
import { Dropdown } from "react-native-element-dropdown";
import { Ionicons } from "@expo/vector-icons";
import { setSourceLang, setTargetLang } from "@/features/slices/base";
import { useDispatch } from "react-redux";
import { useAppSelector } from "@/features/hook";

const LanguageChangedBox = () => {
  const sourceLanguage = useAppSelector((state) => state.base.sourceLang);
  const targetLanguage = useAppSelector((state) => state.base.targetLang);

  const dispatch = useDispatch();

  const swapLanguages = () => {
    dispatch(setSourceLang(targetLanguage));
    dispatch(setTargetLang(sourceLanguage));
  };

  return (
    <View style={styles.container}>
      <View style={styles.languageContainer}>
        <Dropdown
          labelField={"name"}
          valueField={"code"}
          data={Languages}
          renderLeftIcon={(visible) => (
            <Image
              source={sourceLanguage.img}
              style={{ marginRight: 5 }}
              width={24}
              height={24}
            />
          )}
          value={sourceLanguage.code}
          onChange={(itemValue) => {
            if (itemValue.code !== targetLanguage.code) {
              dispatch(setSourceLang(itemValue));
            } else {
              dispatch(setTargetLang(sourceLanguage));
              dispatch(setSourceLang(itemValue));
            }
          }}
          style={styles.picker}
        />
      </View>

      <TouchableOpacity onPress={swapLanguages} style={styles.swapButton}>
        <Ionicons name="swap-horizontal-outline" size={24} />
      </TouchableOpacity>

      <View style={styles.languageContainer}>
        <Dropdown
          labelField={"name"}
          valueField={"code"}
          data={Languages}
          renderLeftIcon={(visible) => (
            <Image
              source={targetLanguage.img}
              style={{ marginRight: 5 }}
              width={24}
              height={24}
            />
          )}
          value={targetLanguage.code}
          onChange={(itemValue) => {
            if (itemValue.code !== sourceLanguage.code) {
              dispatch(setTargetLang(itemValue));
            } else {
              dispatch(setSourceLang(targetLanguage));
              dispatch(setTargetLang(itemValue));
            }
          }}
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
  swapText: {
    fontSize: 24,
  },
});

export default LanguageChangedBox;
