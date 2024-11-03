import Languages from "@/constants/Languages";
import Language from "@/models/Language";
import { create } from "zustand";

interface StoreGlobalType {
  sourceText: string;
  sourceLang: Language;
  targetLang: Language;
  setSourceText: (text: string) => void;
  setSourceLang: (lang: Language) => void;
  setTargetLang: (lang: Language) => void;
  swapLanguages: () => void;
}

const useStoreGlobal = create<StoreGlobalType>()((set) => ({
  sourceText: "",
  sourceLang: Languages[0],
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
