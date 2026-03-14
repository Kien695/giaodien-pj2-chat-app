import { useEffect, useState } from "react";
import { socket } from "./socket.js";

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
  setCurrentRoom,
  unfriendSuccess,
  removeGroup,
  removeUserFromRoom,
  addGroup,
  acceptFriendSuccess,
  setIncreaseAcceptFriend,
  decreaseAcceptFriend,
  setListAddFriend,
  addInvite,
  removeInvite,
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
  const listGroup = useSelector((state) => state.user.listGroup);

  useEffect(() => {
    // 1️ Fetch initial data
    const fetchData = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) return;
      socket.auth = { token };
      socket.connect();
      const resUser = await getData("/auth/getUser");
      if (resUser.success) dispatch(setUser(resUser.data));

      const resListFriend = await getData("/auth/friendList");
      if (resListFriend.success) {
        dispatch(setListFriend(resListFriend.data));
        dispatch(setCountFriend(resListFriend.count));
      }
      const resListAddFriend = await getData("/auth/getAcceptFriend");
      if (resListAddFriend.success) {
        dispatch(setListAddFriend(resListAddFriend.data));
      }
      const resListGroup = await getData("/auth/getRoom");
      if (resListGroup.success) {
        dispatch(setListGroup(resListGroup.data));
      }
    };

    fetchData();

    // 2️ socket listeners
    const handleUnfriend = ({ friendId, roomChatId }) => {
      dispatch(unfriendSuccess(friendId));
      if (currentRoomId === roomChatId) {
        dispatch(setCurrentRoom(null));
      }
      fetchData();
    };
    const handleAcceptfriend = ({ friend }) => {
      dispatch(acceptFriendSuccess(friend));
    };
    const handleLeaveGroup = ({ roomChatId }) => {
      dispatch(removeGroup(roomChatId));
    };

    const handleRoomUpdateSideBar = ({ roomChat }) => {
      dispatch(addGroup(roomChat));
    };
    const handleAdd = (data) => {
      if (state._id === data.userId) {
        dispatch(addInvite(data.infoUserA));
        dispatch(setIncreaseAcceptFriend());
      }
    };
    const handleDelete = (data) => {
      if (state._id === data.userIdB) {
        dispatch(removeInvite(data.userIdA));
        dispatch(decreaseAcceptFriend());
      }
    };
    socket.on("SERVER_RETURN_INFO_A", handleAdd);
    socket.on("SERVER_DELETE_INFO_A", handleDelete);
    socket.on("SERVER_RETURN_LIST_FRIEND", handleAcceptfriend);
    socket.on("SERVER_UNFRIEND_SUCCESS", handleUnfriend);
    socket.on("SERVER_LEAVE_ROOM_PERSON", handleLeaveGroup);
    socket.on("SERVER_ROOM_UPDATED_SIDEBAR", handleRoomUpdateSideBar);

    socket.on("SERVER_ONLINE_USERS", (users) => {
      dispatch(setOnlineUsers(users));
    });

    socket.on("SERVER_USER_ONLINE", ({ userId }) => {
      dispatch(setUserOnline(userId));
    });

    socket.on("SERVER_USER_OFFLINE", ({ userId, lastActive }) => {
      dispatch(setUserOffline({ userId, lastActive }));
    });

    return () => {
      socket.off("SERVER_UNFRIEND_SUCCESS", handleUnfriend);
      socket.off("SERVER_LEAVE_ROOM_PERSON", handleLeaveGroup);
      socket.off("SERVER_ROOM_UPDATED_SIDEBAR", handleRoomUpdateSideBar);
      socket.off("SERVER_ONLINE_USERS");
      socket.off("SERVER_USER_ONLINE");
      socket.off("SERVER_USER_OFFLINE");
      socket.off("SERVER_RETURN_INFO_A", handleAdd);
      socket.off("SERVER_DELETE_INFO_A", handleDelete);
    };
  }, [dispatch, currentRoomId, state._id, isLogin]);

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
