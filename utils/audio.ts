import { Audio } from "expo-av";
import * as Device from "expo-device";
import * as FileSystem from "expo-file-system";
import { Dispatch, MutableRefObject, SetStateAction } from "react";
import { Platform } from "react-native";

export const readBlobAsBase64 = async (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

export const recordSpeech = async (
  audioRecordingRef: MutableRefObject<Audio.Recording>,
  setIsRecording: Dispatch<SetStateAction<boolean>>,
  alreadyReceivedPermission: boolean
) => {
  try {
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });
    const doneRecording = audioRecordingRef?.current?._isDoneRecording;
    if (doneRecording) audioRecordingRef.current = new Audio.Recording();

    let permissionResponse: Audio.PermissionResponse | null = null;

    if (Platform.OS !== "web")
      permissionResponse = await Audio.requestPermissionsAsync();

    if (alreadyReceivedPermission || permissionResponse?.status === "granted") {
      const recordingStatus =
        await audioRecordingRef?.current?.getStatusAsync();
      setIsRecording(true);
      if (!recordingStatus?.canRecord) {
        audioRecordingRef.current = new Audio.Recording();

        const recordingOptions = {
          ...Audio.RecordingOptionsPresets.HIGH_QUALITY,
          android: {
            extension: ".amr",
            outputFormat: Audio.AndroidOutputFormat.AMR_WB,
            audioEncoder: Audio.AndroidAudioEncoder.AMR_WB,
            sampleRate: 16000,
            numberOfChannels: 1,
            bitRate: 128000,
          },
          ios: {
            extension: ".wav",
            audioQuality: Audio.IOSAudioQuality.HIGH,
            sampleRate: 44100,
            numberOfChannels: 1,
            bitRate: 128000,
            linearPCMBitDepth: 16,
            linearPCMIsBigEndian: false,
            linearPCMIsFloat: false,
          },
          web: {
            mimeType:
              Platform.OS === "web" &&
              window.navigator.userAgent.includes("Safari")
                ? "audio/mp4"
                : "audio/webm;codecs=opus",
            bitsPerSecond: 128000,
          },
        };

        await audioRecordingRef?.current
          ?.prepareToRecordAsync(recordingOptions)
          .then(() => console.log("✅ Prepared recording instance"))
          .catch((e) => {
            console.error("Failed to prepare recording", e);
          });
      }
      await audioRecordingRef?.current?.startAsync();
    } else {
      console.error("Permission to record audio is required!");
      return;
    }
  } catch (err) {
    console.error("Failed to start recording", err);
    return;
  }
};

export const transcribeSpeech = async (
  audioRecordingRef: MutableRefObject<Audio.Recording>
) => {
  try {
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: false,
    });
    const isPrepared = audioRecordingRef?.current?._canRecord;
    if (isPrepared) {
      await audioRecordingRef?.current?.stopAndUnloadAsync();

      const recordingUri = audioRecordingRef?.current?.getURI() || "";
      let base64Uri = "";

      if (Platform.OS === "web") {
        const blob = await fetch(recordingUri).then((res) => res.blob());
        const foundBase64 = (await readBlobAsBase64(blob)) as string;
        // Example: data:audio/wav;base64,asdjfioasjdfoaipsjdf
        const removedPrefixBase64 = foundBase64.split("base64,")[1];
        base64Uri = removedPrefixBase64;
      } else {
        base64Uri = await FileSystem.readAsStringAsync(recordingUri, {
          encoding: FileSystem.EncodingType.Base64,
        });
      }

      const dataUrl = base64Uri;

      audioRecordingRef.current = new Audio.Recording();

      const audioConfig = {
        encoding:
          Platform.OS === "android"
            ? "AMR_WB"
            : Platform.OS === "web"
            ? "WEBM_OPUS"
            : "LINEAR16",
        sampleRateHertz:
          Platform.OS === "android"
            ? 16000
            : Platform.OS === "web"
            ? 48000
            : 41000,
        languageCode: "en-US",
      };

      if (recordingUri && dataUrl) {
        const rootOrigin =
          Platform.OS === "android"
            ? "10.0.2.2"
            : Device.isDevice
            ? process.env.LOCAL_DEV_IP || "localhost"
            : "localhost";
        const serverUrl = `http://${rootOrigin}:4000`;
        const serverResponse = await fetch(`${serverUrl}/speech-to-text`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ audioUrl: dataUrl, config: audioConfig }),
        })
          .then((res) => res.json())
          .catch((e: Error) => console.error(e));

        const results = serverResponse?.results;
        if (results) {
          const transcript = results?.[0].alternatives?.[0].transcript;
          if (!transcript) return undefined;
          return transcript;
        } else {
          console.error("No transcript found");
          return undefined;
        }
      }
    } else {
      console.error("Recording must be prepared prior to unloading");
      return undefined;
    }
  } catch (e) {
    console.error("Failed to transcribe speech!", e);
    return undefined;
  }
};
