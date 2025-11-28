import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  name: "",
  email: "",
  avatar: "",
  avatar_public_id: "",
  background: "",
  background_public_id: "",
  mobile: "",
  date_of_birth: "",
  createdAt: "",
  _id: "",
  isLogin: false,
  onlineUser: [],
  socketConnection: null,
  lengthAcceptFriend: 0,
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action) => {
      Object.assign(state, action.payload);
    },
    setLogin: (state, action) => {
      state.isLogin = action.payload; // true/false
    },
    logout: (state) => {
      state.name = "";
      state.email = "";
      state.avatar = "";
      state.avatar_public_id = "";
      state.background = "";
      state.background_public_id = "";
      state.mobile = "";
      state.date_of_birth = "";
      state.createdAt = "";
      state._id = "";
      state.isLogin = false;
      state.socketConnection = null;
      state.lengthAcceptFriend = 0;
    },
    setOnlineUser: (state, action) => {
      state.onlineUser = action.payload;
    },
    setSocketConnection: (state, action) => {
      state.socketConnection = action.payload;
    },
    setLengthAcceptFriend: (state, action) => {
      state.lengthAcceptFriend = action.payload;
    },
    resetAcceptFriends: (state) => {
      state.lengthAcceptFriend = 0;
    },
  },
});

// Action creators are generated for each case reducer function
export const {
  setUser,
  logout,
  setLogin,
  setOnlineUser,
  setSocketConnection,
  setLengthAcceptFriend,
  resetAcceptFriends,
} = userSlice.actions;

export default userSlice.reducer;
