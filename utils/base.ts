import * as FileSystem from "expo-file-system";
import * as ImageManipulator from "expo-image-manipulator";

export const uriToBase64 = async (uri: string) => {
  return await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  });
};

export const optimizeImage = async (uri: string) => {
  const manipResult = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: 800 } }],
    { compress: 0.5, format: ImageManipulator.SaveFormat.JPEG }
  );

  return manipResult.uri;
};
