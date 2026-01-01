import { useEffect, useState } from "react";
//toastyfy
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import "./App.css";
import AllRouter from "./Components/AllRouter";
import { useDispatch, useSelector } from "react-redux";
import { getData } from "./utils/api";
import {
  setListFriend,
  setUser,
  setCountFriend,
  setListGroup,
  setCountGroup,
  setCurrentRoom,
  unfriendSuccess,
} from "./redux/userSlice";
import {
  setOnlineUsers,
  setUserOffline,
  setUserOnline,
} from "./redux/socketSlice";

function App() {
  const state = useSelector((state) => state.user);
  const socketConnection = state.socketConnection;
  const isLogin = useSelector((state) => state.user.isLogin);
  const dispatch = useDispatch();
  const currentRoomId = useSelector((state) => state.user.currentRoomId);
  useEffect(() => {
    if (!socketConnection) return;

    // 1️ Fetch initial data
    const fetchData = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) return;

      const resUser = await getData("/auth/getUser");
      if (resUser.success) dispatch(setUser(resUser.data));

      const resListFriend = await getData("/auth/friendList");
      if (resListFriend.success) {
        dispatch(setListFriend(resListFriend.data));
        dispatch(setCountFriend(resListFriend.count));
      }

      const resListGroup = await getData("/auth/getRoom");
      if (resListGroup.success) {
        dispatch(setListGroup(resListGroup.data));
        dispatch(setCountGroup(resListGroup.count));
      }
    };

    fetchData();

    // 2️ Socket listener: unfriend
    const handleUnfriend = ({ friendId, roomChatId }) => {
      dispatch(unfriendSuccess(friendId));

      if (currentRoomId === roomChatId) {
        dispatch(setCurrentRoom(null));
      }

      // Tải lại list + count từ BE
      fetchData();
    };
    socketConnection.on("SERVER_UNFRIEND_SUCCESS", handleUnfriend);

    //socket online/offline user

    socketConnection.on("SERVER_ONLINE_USERS", (users) => {
      dispatch(setOnlineUsers(users));
    });

    socketConnection.on("SERVER_USER_ONLINE", ({ userId }) => {
      dispatch(setUserOnline(userId));
    });

    socketConnection.on("SERVER_USER_OFFLINE", ({ userId, lastActive }) => {
      dispatch(setUserOffline({ userId, lastActive }));
    });

    return () => {
      socketConnection.off("SERVER_UNFRIEND_SUCCESS", handleUnfriend);
      socketConnection.off("SERVER_USER_ONLINE");
      socketConnection.off("SERVER_USER_OFFLINE");
    };
  }, [dispatch, socketConnection]);

  return (
    <>
      <AllRouter />
      <ToastContainer
        position="top-right"
        autoClose={3000}
        closeButton={true}
        hideProgressBar={false}
      />
    </>
  );
}

export default App;
