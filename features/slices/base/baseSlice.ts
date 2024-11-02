import Languages from "@/constants/Languages";
import Language from "@/models/Language";
import { createSlice } from "@reduxjs/toolkit";

interface BaseState {
  sourceLang: Language;
  targetLang: Language;
}

const initialState: BaseState = {
  sourceLang: Languages[0],
  targetLang: Languages[1],
};

const baseSlice = createSlice({
  name: "base",
  initialState,
  reducers: {
    setSourceLang(state, action: { payload: Language }) {
      state.sourceLang = action.payload;
    },
    setTargetLang(state, action: { payload: Language }) {
      state.targetLang = action.payload;
    },
  },
});

export const { setSourceLang, setTargetLang } = baseSlice.actions;
export default baseSlice.reducer;
