import { useEffect, useRef } from "react";
import { socket } from "./socket.js";

//toastyfy
import { ToastContainer } from "react-toastify";
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
  const userId = useSelector((state) => state.user._id);
  const isLogin = useSelector((state) => state.user.isLogin);
  const dispatch = useDispatch();
  const currentRoomId = useSelector((state) => state.user.currentRoomId);
  const currentRoomIdRef = useRef(currentRoomId);
  const userIdRef = useRef(userId);

  useEffect(() => {
    currentRoomIdRef.current = currentRoomId;
  }, [currentRoomId]);

  useEffect(() => {
    userIdRef.current = userId;
  }, [userId]);

  useEffect(() => {
    // 1️ Fetch initial data
    const fetchData = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) return;
      socket.auth = { token };
      socket.connect();
      const [userResult, friendResult, requestResult, groupResult] =
        await Promise.allSettled([
          getData("/auth/getUser"),
          getData("/auth/friendList"),
          getData("/auth/getAcceptFriend"),
          getData("/auth/getRoom"),
        ]);

      if (userResult.status === "fulfilled" && userResult.value.success) {
        dispatch(setUser(userResult.value.data));
      }
      if (friendResult.status === "fulfilled" && friendResult.value.success) {
        dispatch(setListFriend(friendResult.value.data));
        dispatch(setCountFriend(friendResult.value.count));
      }
      if (requestResult.status === "fulfilled" && requestResult.value.success) {
        dispatch(setListAddFriend(requestResult.value.data));
      }
      if (groupResult.status === "fulfilled" && groupResult.value.success) {
        dispatch(setListGroup(groupResult.value.data));
      }
    };

    fetchData();

    // 2️ socket listeners
    const handleUnfriend = ({ friendId, roomChatId }) => {
      dispatch(unfriendSuccess(friendId));
      if (currentRoomIdRef.current === roomChatId) {
        dispatch(setCurrentRoom(null));
      }
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
      if (userIdRef.current === data.userId) {
        dispatch(addInvite(data.infoUserA));
        dispatch(setIncreaseAcceptFriend());
      }
    };
    const handleDelete = (data) => {
      if (userIdRef.current === data.userIdB) {
        dispatch(removeInvite(data.userIdA));
        dispatch(decreaseAcceptFriend());
      }
    };
    const handleOnlineUsers = (users) => {
      dispatch(setOnlineUsers(users));
    };
    const handleUserOnline = ({ userId }) => {
      dispatch(setUserOnline(userId));
    };
    const handleUserOffline = ({ userId, lastActive }) => {
      dispatch(setUserOffline({ userId, lastActive }));
    };
    socket.on("SERVER_RETURN_INFO_A", handleAdd);
    socket.on("SERVER_DELETE_INFO_A", handleDelete);
    socket.on("SERVER_RETURN_LIST_FRIEND", handleAcceptfriend);
    socket.on("SERVER_UNFRIEND_SUCCESS", handleUnfriend);
    socket.on("SERVER_LEAVE_ROOM_PERSON", handleLeaveGroup);
    socket.on("SERVER_ROOM_UPDATED_SIDEBAR", handleRoomUpdateSideBar);

    socket.on("SERVER_ONLINE_USERS", handleOnlineUsers);
    socket.on("SERVER_USER_ONLINE", handleUserOnline);
    socket.on("SERVER_USER_OFFLINE", handleUserOffline);

    return () => {
      socket.off("SERVER_UNFRIEND_SUCCESS", handleUnfriend);
      socket.off("SERVER_LEAVE_ROOM_PERSON", handleLeaveGroup);
      socket.off("SERVER_ROOM_UPDATED_SIDEBAR", handleRoomUpdateSideBar);
      socket.off("SERVER_ONLINE_USERS", handleOnlineUsers);
      socket.off("SERVER_USER_ONLINE", handleUserOnline);
      socket.off("SERVER_USER_OFFLINE", handleUserOffline);
      socket.off("SERVER_RETURN_INFO_A", handleAdd);
      socket.off("SERVER_DELETE_INFO_A", handleDelete);
    };
  }, [dispatch, isLogin]);

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
