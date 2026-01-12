// themeSlice.js
import { createSlice } from "@reduxjs/toolkit";

const savedTheme = localStorage.getItem("theme") || "light";
const savedAvatarBg = JSON.parse(localStorage.getItem("useAvatarBg")) ?? false;
const themeSlice = createSlice({
  name: "theme",
  initialState: { mode: savedTheme, useAvatarBg: savedAvatarBg },
  reducers: {
    setTheme: (state, action) => {
      state.mode = action.payload;
      localStorage.setItem("theme", action.payload);
    },
    setUseAvatarBg: (state, action) => {
      state.useAvatarBg = action.payload;
      localStorage.setItem("useAvatarBg", JSON.stringify(action.payload));
    },
  },
});

export const { setTheme, setUseAvatarBg } = themeSlice.actions;
export default themeSlice.reducer;
