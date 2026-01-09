import { configureStore } from "@reduxjs/toolkit";
import useReducer from "./userSlice";
import onlineReducer from "./socketSlice";
import themeReducer from "./themeSlice";
export const store = configureStore({
  reducer: {
    user: useReducer,
    online: onlineReducer,
    theme: themeReducer,
  },
});
