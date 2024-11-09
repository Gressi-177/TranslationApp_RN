import * as FileSystem from "expo-file-system";

export const uriToBase64 = async (uri: string) => {
  return await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  });
};
