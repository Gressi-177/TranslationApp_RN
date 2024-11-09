import { uriToBase64 } from "@/utils/base";
import { Audio } from "expo-av";
import { useEffect, useState } from "react";
import { postAudio } from "../apis/translations";

interface UseAudioRecorderReturn {
  isRecording: boolean;
  transcription: string;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<void>;
}

export const useAudioRecorder = (): UseAudioRecorderReturn => {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [transcription, setTranscription] = useState<string>("");

  useEffect(() => {
    const requestPermission = async () => {
      const { status } = await Audio.requestPermissionsAsync();
      setHasPermission(status === "granted");
    };

    requestPermission();
  }, []);

  const startRecording = async () => {
    if (hasPermission) {
      try {
        const { recording } = await Audio.Recording.createAsync(
          Audio.RecordingOptionsPresets.HIGH_QUALITY
        );
        setRecording(recording);
        setIsRecording(true);
        console.log("Recording started");
      } catch (error) {
        console.error("Failed to start recording:", error);
      }
    } else {
      console.warn("Recording permission not granted.");
    }
  };

  const stopRecording = async () => {
    if (recording) {
      try {
        await recording.stopAndUnloadAsync();
        const uri = recording.getURI();
        setIsRecording(false);

        if (uri) {
          const base64 = await uriToBase64(uri);
          const response = await postAudio(base64);
          setTranscription(response.transcription);
        }
        console.log("Recording stopped");
      } catch (error) {
        console.error("Failed to stop recording:", error);
      }
    }
  };

  return {
    isRecording,
    transcription,
    startRecording,
    stopRecording,
  };
};
