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

  lengthAcceptFriend: 0,
  listFriend: [],
  listAddFriend: [],
  countFriend: 0,
  listGroup: [],
  invite: [],
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
    logout: () => ({ ...initialState }),

    setIncreaseAcceptFriend: (state) => {
      state.lengthAcceptFriend += 1;
    },
    decreaseAcceptFriend: (state) => {
      state.lengthAcceptFriend = Math.max(state.lengthAcceptFriend - 1, 0);
    },

    resetAcceptFriends: (state) => {
      state.lengthAcceptFriend = 0;
    },
    setListFriend: (state, action) => {
      state.listFriend = action.payload;
    },
    setListAddFriend: (state, action) => {
      state.listAddFriend = action.payload;
    },
    // friendSlice.js
    unfriendSuccess: (state, action) => {
      const friendId = action.payload;
      state.listFriend = state.listFriend.filter(
        (item) => item._id !== friendId,
      );
    },
    acceptFriendSuccess: (state, action) => {
      const newFriend = action.payload;

      const exists = state.listFriend.some((f) => f._id === newFriend._id);
      if (!exists) {
        state.listFriend.unshift(newFriend);
        state.countFriend += 1;
      }
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
        (room) => room._id.toString() !== action.payload.toString(),
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
    addInvite: (state, action) => {
      const exists = state.listAddFriend.find(
        (u) => u._id === action.payload._id,
      );
      if (!exists) {
        state.listAddFriend.push(action.payload);
      }
    },
    removeInvite: (state, action) => {
      state.listAddFriend = state.listAddFriend.filter(
        (u) => u._id !== action.payload,
      );
    },
  },
});

// Action creators are generated for each case reducer function
export const {
  setUser,
  logout,
  setLogin,
  setIncreaseAcceptFriend,
  decreaseAcceptFriend,
  resetAcceptFriends,
  setListFriend,
  setListAddFriend,
  setCountFriend,
  setListGroup,
  addInvite,
  removeInvite,
  unfriendSuccess,
  acceptFriendSuccess,
  setCurrentRoom,
  removeGroup,
  removeUserFromRoom,
  addGroup,
} = userSlice.actions;

export default userSlice.reducer;
