import { useState, useRef, useEffect } from "react";
import { View, StyleSheet, Button, ScrollView, Text } from "react-native";
import { Audio } from "expo-av";

export default function AudioRecord() {
  const [recording, setRecording] = useState<Audio.Recording>();
  const [isRecording, setIsRecording] = useState(false);
  const [transcripts, setTranscripts] = useState<string[]>([]);
  const [permissionResponse, requestPermission] = Audio.usePermissions();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Function to send audio file and get transcript
  const sendAudioAndGetTranscript = async (uri: string) => {
    try {
      // Create form data
      const formData = new FormData();
      formData.append("audio", {
        uri: uri,
        type: "audio/m4a",
        name: "recording.m4a",
      } as unknown as Blob);

      // Send to your API
      const response = await fetch(
        "http://127.0.0.1:8000/api/v1/upload-audio",
        {
          method: "POST",
          body: formData,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const data = await response.json();
      if (data.transcript) {
        setTranscripts((prev) => [...prev, data.transcript]);
      }
    } catch (error) {
      console.error("Error sending audio:", error);
    }
  };

  // Function to handle recording cycle
  const handleRecordingCycle = async () => {
    if (recording) {
      console.log("Stopping current 5s segment...");
      const uri = recording.getURI();
      await recording.stopAndUnloadAsync();

      // Send the audio file
      if (uri) {
        sendAudioAndGetTranscript(uri);
      }

      // Start new recording if still in recording state
      if (isRecording) {
        startNewRecording();
      }
    }
  };

  // Function to start a new recording
  const startNewRecording = async () => {
    try {
      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(newRecording);
    } catch (err) {
      console.error("Failed to start new recording segment", err);
    }
  };

  async function startRecording() {
    try {
      if (permissionResponse?.status !== "granted") {
        console.log("Requesting permission..");
        await requestPermission();
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      console.log("Starting recording..");
      setIsRecording(true);
      await startNewRecording();

      // Set up interval for 5-second segments
      intervalRef.current = setInterval(handleRecordingCycle, 5000);
    } catch (err) {
      console.error("Failed to start recording", err);
    }
  }

  async function stopRecording() {
    try {
      console.log("Stopping recording..");
      setIsRecording(false);

      if (intervalRef.current) clearInterval(intervalRef.current);

      if (recording) {
        const uri = recording.getURI();
        await recording.stopAndUnloadAsync();
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
        });

        // Send final segment if it exists
        if (uri) {
          sendAudioAndGetTranscript(uri);
        }
      }

      setRecording(undefined);
    } catch (err) {
      console.error("Failed to stop recording", err);
    }
  }

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (recording) {
        recording.stopAndUnloadAsync();
      }
    };
  }, []);

  return (
    <View style={styles.container}>
      <Button
        title={isRecording ? "Stop Recording" : "Start Recording"}
        onPress={isRecording ? stopRecording : startRecording}
      />
      <ScrollView style={styles.transcriptContainer}>
        {transcripts.map((transcript, index) => (
          <Text key={index} style={styles.transcript}>
            {transcript}
          </Text>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#ecf0f1",
    padding: 10,
  },
  transcriptContainer: {
    marginTop: 20,
    maxHeight: 200,
  },
  transcript: {
    padding: 10,
    marginVertical: 5,
    backgroundColor: "#fff",
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#ddd",
  },
});
