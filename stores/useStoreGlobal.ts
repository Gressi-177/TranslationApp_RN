import Languages from "@/constants/Languages";
import Language from "@/models/Language";
import { create } from "zustand";

interface StoreGlobalType {
  sourceLang: Language;
  targetLang: Language;
  setSourceLang: (lang: Language) => void;
  setTargetLang: (lang: Language) => void;
  swapLanguages: () => void;
}

const useStoreGlobal = create<StoreGlobalType>()((set) => ({
  sourceLang: Languages[0],
  targetLang: Languages[1],

  setSourceLang: (lang: Language) =>
    set((state) => {
      if (lang.code === state.targetLang.code) {
        return {
          sourceLang: state.targetLang,
          targetLang: lang,
        };
      }
      return { sourceLang: lang };
    }),

  setTargetLang: (lang: Language) =>
    set((state) => {
      if (lang.code === state.sourceLang.code) {
        return {
          sourceLang: lang,
          targetLang: state.sourceLang,
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
