// themeSlice.js
import { createSlice } from "@reduxjs/toolkit";

const storedTheme = localStorage.getItem("theme");
const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
  ? "dark"
  : "light";
const savedTheme =
  storedTheme === "dark" || storedTheme === "light" ? storedTheme : systemTheme;
const savedAvatarBg = JSON.parse(localStorage.getItem("useAvatarBg")) ?? false;
const themeSlice = createSlice({
  name: "theme",
  initialState: { mode: savedTheme, useAvatarBg: savedAvatarBg },
  reducers: {
    setTheme: (state, action) => {
      const nextTheme = action.payload === "dark" ? "dark" : "light";
      state.mode = nextTheme;
      localStorage.setItem("theme", nextTheme);
    },
    setUseAvatarBg: (state, action) => {
      state.useAvatarBg = action.payload;
      localStorage.setItem("useAvatarBg", JSON.stringify(action.payload));
    },
  },
});

export const { setTheme, setUseAvatarBg } = themeSlice.actions;
export default themeSlice.reducer;
