import { createSlice } from "@reduxjs/toolkit";

const onlineSlice = createSlice({
  name: "online",
  initialState: {
    users: {}, // userId -> { status, lastActive }
  },
  reducers: {
    //  SET DANH SÁCH ONLINE BAN ĐẦU
    setOnlineUsers: (state, action) => {
      state.users = action.payload;
    },

    // realtime online
    setUserOnline: (state, action) => {
      state.users[action.payload] = {
        status: "online",
        lastActive: null,
      };
    },

    // realtime offline
    setUserOffline: (state, action) => {
      const { userId, lastActive } = action.payload;
      state.users[userId] = {
        status: "offline",
        lastActive,
      };
    },
  },
});

export const { setOnlineUsers, setUserOnline, setUserOffline } =
  onlineSlice.actions;

export default onlineSlice.reducer;
