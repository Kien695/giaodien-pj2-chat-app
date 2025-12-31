import { configureStore } from "@reduxjs/toolkit";
import useReducer from "./userSlice";
import onlineReducer from "./socketSlice";
export const store = configureStore({
  reducer: {
    user: useReducer,
    online: onlineReducer,
  },
});
