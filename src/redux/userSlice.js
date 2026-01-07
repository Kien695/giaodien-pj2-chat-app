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
  listFriend: [],
  countFriend: 0,
  listGroup: [],

  currentRoomId: null,
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
    setListFriend: (state, action) => {
      state.listFriend = action.payload;
    },
    // friendSlice.js
    unfriendSuccess: (state, action) => {
      const friendId = action.payload;
      state.listFriend = state.listFriend.filter(
        (item) => item._id !== friendId
      );
    },

    setCountFriend: (state, action) => {
      state.countFriend = action.payload;
    },

    setListGroup: (state, action) => {
      state.listGroup = action.payload;
    },

    setCurrentRoom: (state, action) => {
      state.currentRoomId = action.payload;
    },
    removeGroup: (state, action) => {
      state.listGroup = state.listGroup.filter(
        (room) => room._id.toString() !== action.payload.toString()
      );
    },
    removeUserFromRoom: (state, action) => {
      const { roomChatId, userId } = action.payload;
      const room = state.listGroup.find((r) => r._id === roomChatId);
      if (room) {
        room.users = room.users.filter((u) => u.user_id !== userId);
      }
    },
    addGroup: (state, action) => {
      const exists = state.listGroup.some((r) => r._id === action.payload._id);
      if (!exists) {
        state.listGroup.unshift(action.payload);
      }
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
  setListFriend,
  setCountFriend,
  setListGroup,

  unfriendSuccess,
  setCurrentRoom,
  removeGroup,
  removeUserFromRoom,
  addGroup,
} = userSlice.actions;

export default userSlice.reducer;
