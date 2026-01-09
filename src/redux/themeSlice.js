// themeSlice.js
import { createSlice } from "@reduxjs/toolkit";

const savedTheme = localStorage.getItem("theme") || "light";

const themeSlice = createSlice({
  name: "theme",
  initialState: { mode: savedTheme },
  reducers: {
    setTheme: (state, action) => {
      state.mode = action.payload;               // update Redux state
      localStorage.setItem("theme", action.payload); // lưu localStorage
    },
  },
});

export const { setTheme } = themeSlice.actions;
export default themeSlice.reducer;
