import { uriToBase64 } from "@/utils/base";
import { Audio } from "expo-av";
import { useEffect, useState } from "react";
import { postAudio } from "../apis/translations";

interface UseAudioRecorderReturn {
  isRecording: boolean;
  transcription: string;
  isPending: boolean;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<void>;
}

export const useAudioRecorder = (): UseAudioRecorderReturn => {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [transcription, setTranscription] = useState<string>("");
  const [isPending, setIsPending] = useState(false);

  const resetRecording = () => {
    setRecording(null);
    setIsRecording(false);
  };

  useEffect(() => {
    const requestPermission = async () => {
      const { status } = await Audio.requestPermissionsAsync();
      setHasPermission(status === "granted");
    };

    requestPermission();
  }, []);

  const startRecording = async () => {
    if (!hasPermission) return;
    try {
      setIsPending(true);
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      setIsRecording(true);
    } catch (error) {
      console.error("Failed to start recording:", error);
    } finally {
      setIsPending(false);
      console.log("Recording started");
    }
  };

  const stopRecording = async () => {
    if (!recording) return;
    try {
      setIsPending(true);
      await recording.stopAndUnloadAsync();
      resetRecording();
      const uri = recording.getURI();
      setIsRecording(false);

      if (uri) {
        const base64 = await uriToBase64(uri);
        const response = await postAudio(base64);
        setTranscription(response?.transcription);
      }
    } catch (error) {
      console.error("Failed to stop recording:", error);
    } finally {
      setTranscription("");
      setIsPending(false);
      console.log("Recording stopped");
    }
  };

  return {
    isRecording,
    transcription,
    isPending,
    startRecording,
    stopRecording,
  };
};
