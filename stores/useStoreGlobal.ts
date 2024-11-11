import Languages from "@/constants/Languages";
import Language from "@/models/Language";
import { create } from "zustand";

interface StoreGlobalType {
  sourceText: string;
  sourceLang: Language;
  targetText: string;
  targetLang: Language;
  setSourceText: (text: string) => void;
  setSourceLang: (lang: Language) => void;
  setTargetText: (text: string) => void;
  setTargetLang: (lang: Language) => void;
  swapLanguages: () => void;
}

const useStoreGlobal = create<StoreGlobalType>()((set) => ({
  sourceText: "",
  sourceLang: Languages[0],
  targetText: "",
  targetLang: Languages[1],

  setSourceText: (text: string) =>
    set((state) => {
      return { sourceText: text };
    }),

  setSourceLang: (lang: Language) =>
    set((state) => {
      if (lang.code === state.targetLang.code) {
        return {
          sourceLang: lang,
          targetLang: state.sourceLang,
        };
      }
      return { sourceLang: lang };
    }),

  setTargetText: (text: string) =>
    set((state) => {
      return { targetText: text };
    }),

  setTargetLang: (lang: Language) =>
    set((state) => {
      if (lang.code === state.sourceLang.code) {
        return {
          sourceLang: state.targetLang,
          targetLang: lang,
        };
      }
      return { targetLang: lang };
    }),

  swapLanguages: () =>
    set((state) => ({
      sourceLang: state.targetLang,
      targetLang: state.sourceLang,
    })),
}));

export default useStoreGlobal;
