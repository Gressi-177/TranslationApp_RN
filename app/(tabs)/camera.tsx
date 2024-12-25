import { Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Button,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { postImageNew } from "@/apis/translations";
import LanguageChangedBox from "@/components/LanguageChangedBox";
import useStoreGlobal from "@/stores/useStoreGlobal";
import { optimizeImage } from "@/utils/base";
import { useRouter } from "expo-router";

const CameraPage = () => {
  const router = useRouter();
  const cameraRef = useRef<CameraView>(null);
  const [isFlashOn, setIsFlashOn] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const setSourceText = useStoreGlobal((state) => state.setSourceText);

  const toggleFlash = () => {
    setIsFlashOn((prev) => !prev);
  };

  const recognizeText = async (uri: string) => {
    try {
      setIsLoading(true);
      const optimizedUri = await optimizeImage(uri);
      const result = await postImageNew(optimizedUri);
      setSourceText(result.text);
      setCapturedImage(null);
      router.replace("/(tabs)/?ref=camera");
    } catch (error) {
      console.error("Lỗi:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      quality: 1,
    });

    if (result.assets && result.assets.length > 0) {
      recognizeText(result.assets[0].uri);
    }
  };

  const takePicture = async () => {
    if (cameraRef.current) {
      const options = { quality: 1, base64: true, fixOrientation: true };
      const data = await cameraRef.current.takePictureAsync(options);

      if (!data) return;
      setCapturedImage(data.uri);
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
      {capturedImage ? (
        <View className="flex-1 items-center justify-center">
          <Image
            source={{ uri: capturedImage }}
            style={{ width: "100%", height: "80%" }}
          />
          <View className="flex flex-row justify-around w-full mt-4">
            {isLoading ? (
              <ActivityIndicator size="large" color="#0000ff" />
            ) : (
              <Button
                title="Use Photo"
                onPress={() => recognizeText(capturedImage)}
              />
            )}
            <Button title="Retake" onPress={() => setCapturedImage(null)} />
          </View>
        </View>
      ) : (
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
      )}
    </View>
  );
};

export default CameraPage;
