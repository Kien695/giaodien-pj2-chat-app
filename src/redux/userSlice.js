import { createSlice } from "@reduxjs/toolkit";
import { act } from "react";

const initialState = {
  name: "",
  email: "",
  avatar: "",
  avatar_public_id: "",
  mobile: "",
  date_of_birth: "",
  createdAt: "",
  _id: "",
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state._id = action.payload._id;
      state.name = action.payload.name;
      state.email = action.payload.email;
      state.mobile = action.payload.mobile;
      state.avatar = action.payload.avatar;
      state.avatar_public_id = action.payload.avatar_public_id;
      state.createdAt = action.payload.createdAt;
    },
    logout: (state, action) => {
      state._id = "";
      state.name = "";
      state.email = "";
      state.mobile = "";
      state.avatar = "";
      state.avatar_public_id = "";
      state.createdAt = "";
    },
  },
});

// Action creators are generated for each case reducer function
export const { setUser, logout } = userSlice.actions;

export default userSlice.reducer;
