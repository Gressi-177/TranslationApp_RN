import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React, { useCallback } from "react";
import {
  Image,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";

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
    () => <Image source={targetLanguage.img} className="w-6 h-6 ml-2" />,
    [targetLanguage.img]
  );

  return (
    <View className="px-4 py-[2px] mt-5">
      <View style={styles.box} className="bg-[#fff] rounded-[50px]">
        <View className="flex flex-row items-center p-4">
          <Dropdown
            labelField="name"
            valueField="code"
            data={Languages}
            renderLeftIcon={renderSourceIcon}
            renderRightIcon={() => <></>}
            value={sourceLanguage.code}
            onChange={setSourceLang}
            selectedTextProps={{
              style: {
                fontSize: 16,
                fontWeight: "bold",
              },
            }}
            style={{
              alignItems: "flex-start",
              flexGrow: 1,
              height: 24,
            }}
          />

          <TouchableOpacity onPress={swapLanguages}>
            <MaterialIcons name="swap-horiz" size={24} color="black" />
          </TouchableOpacity>

          <Dropdown
            labelField="name"
            valueField="code"
            data={Languages}
            renderRightIcon={renderTargetIcon}
            value={targetLanguage.code}
            onChange={setTargetLang}
            selectedTextProps={{
              style: {
                fontSize: 16,
                fontWeight: "bold",
              },
            }}
            style={{
              alignItems: "flex-end",
              flexGrow: 1,
              height: 24,
            }}
          />
        </View>
      </View>
    </View>
  );
};

export default LanguageChangedBox;
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
