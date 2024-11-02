import * as Speech from "expo-speech";

enum TTS {
  playing,
  stopped,
}

let ttsState: TTS = TTS.stopped;

const ExpoTTS = {
  isPlaying: () => {
    return ttsState == TTS.playing;
  },
  isStopped: () => {
    return ttsState == TTS.stopped;
  },
  speak: async (text: string, language: string) => {
    await Speech.stop();

    Speech.speak(text, {
      language: language,
      pitch: 1.0,
      onStart: () => {
        ttsState = TTS.playing;
      },
      onStopped: () => {
        ttsState = TTS.stopped;
      },
      onDone: () => {
        ttsState = TTS.stopped;
      },
      onError: () => {
        ttsState = TTS.stopped;
      },
    });
  },
  stop: async () => {
    await Speech.stop();
  },
};

export default ExpoTTS;
