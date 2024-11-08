import * as ImagePicker from "expo-image-picker";
import TextRecognition from "@react-native-ml-kit/text-recognition";
import React, { useEffect, useRef, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import { View, TouchableOpacity, Image, Text, Button } from "react-native";

import LanguageChangedBox from "@/components/LanguageChangedBox";
import useStoreGlobal from "@/stores/useStoreGlobal";

const CameraPage = () => {
  const cameraRef = useRef<CameraView>(null);
  const [isFlashOn, setIsFlashOn] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();

  const setSourceText = useStoreGlobal((state) => state.setSourceText);

  const toggleFlash = () => {
    setIsFlashOn((prev) => !prev);
  };

  const recognizeText = async (uri: string) => {
    const result = await TextRecognition.recognize(uri);

    console.log(result.text);

    setSourceText(result.text);
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (result.assets && result.assets.length > 0) {
      recognizeText(result.assets[0].uri);
    }
  };

  const takePicture = async () => {
    if (cameraRef.current) {
      const options = { quality: 0.5, base64: true, fixOrientation: true };
      const data = await cameraRef.current.takePictureAsync(options);

      if (!data) return;
      recognizeText(data.uri);
    }
  };

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View className="flex flex-1 justify-center">
        <Text className="text-center pb-2.5">
          We need your permission to show the camera
        </Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  return (
    <View className="flex-1">
      <CameraView
        ref={cameraRef}
        className="flex-1"
        style={{ flex: 1 }}
        facing="back"
        mode="picture"
        flash={isFlashOn ? "on" : "off"}
      >
        <View className="absolute top-0 left-4 right-4">
          <LanguageChangedBox />
        </View>

        <View className="absolute bottom-2 left-0 right-0 flex flex-row justify-around items-center">
          <TouchableOpacity onPress={pickImage} className="p-2">
            <Image
              source={require("@/assets/images/placeholder.jpg")}
              className="w-10 h-10 rounded-md"
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={takePicture}>
            <View className="w-20 h-20 border-4 border-white rounded-full flex items-center justify-center bg-blue-900"></View>
          </TouchableOpacity>

          <TouchableOpacity onPress={toggleFlash} className="p-2">
            <Ionicons
              name={isFlashOn ? "flash" : "flash-off"}
              size={28}
              color="white"
            />
          </TouchableOpacity>
        </View>
      </CameraView>
    </View>
  );
};

export default CameraPage;
