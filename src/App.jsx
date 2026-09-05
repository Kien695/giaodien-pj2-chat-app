import { useEffect, useMemo, useRef } from "react";
import { ThemeProvider } from "@mui/material/styles";
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
import { createAppTheme } from "./theme/appTheme";

function App() {
  const userId = useSelector((state) => state.user._id);
  const isLogin = useSelector((state) => state.user.isLogin);
  const theme = useSelector((state) => state.theme.mode);
  const dispatch = useDispatch();
  const currentRoomId = useSelector((state) => state.user.currentRoomId);
  const currentRoomIdRef = useRef(currentRoomId);
  const userIdRef = useRef(userId);
  const accountSyncInFlightRef = useRef(false);
  const reconnectPendingRef = useRef(false);
  const muiTheme = useMemo(() => createAppTheme(theme), [theme]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    root.dataset.theme = theme;
    root.style.colorScheme = theme;
  }, [theme]);

  useEffect(() => {
    currentRoomIdRef.current = currentRoomId;
  }, [currentRoomId]);

  useEffect(() => {
    userIdRef.current = userId;
  }, [userId]);

  useEffect(() => {
    // 1️ Fetch initial data
    const fetchData = async () => {
      if (accountSyncInFlightRef.current) return;
      const token = localStorage.getItem("accessToken");
      if (!token) return;
      accountSyncInFlightRef.current = true;
      try {
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
      } finally {
        accountSyncInFlightRef.current = false;
        if (reconnectPendingRef.current && socket.connected) {
          reconnectPendingRef.current = false;
          fetchData();
        }
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
    const handleDisconnect = () => {
      reconnectPendingRef.current = true;
    };
    const handleConnect = () => {
      if (!reconnectPendingRef.current) return;
      if (accountSyncInFlightRef.current) return;
      reconnectPendingRef.current = false;
      fetchData();
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
    socket.on("disconnect", handleDisconnect);
    socket.on("connect", handleConnect);

    return () => {
      socket.off("SERVER_UNFRIEND_SUCCESS", handleUnfriend);
      socket.off("SERVER_LEAVE_ROOM_PERSON", handleLeaveGroup);
      socket.off("SERVER_ROOM_UPDATED_SIDEBAR", handleRoomUpdateSideBar);
      socket.off("SERVER_RETURN_LIST_FRIEND", handleAcceptfriend);
      socket.off("SERVER_ONLINE_USERS", handleOnlineUsers);
      socket.off("SERVER_USER_ONLINE", handleUserOnline);
      socket.off("SERVER_USER_OFFLINE", handleUserOffline);
      socket.off("SERVER_RETURN_INFO_A", handleAdd);
      socket.off("SERVER_DELETE_INFO_A", handleDelete);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect", handleConnect);
    };
  }, [dispatch, isLogin]);

  return (
    <ThemeProvider theme={muiTheme}>
      <AllRouter />
      <ToastContainer
        theme={theme}
        position="top-right"
        autoClose={3000}
        closeButton={true}
        hideProgressBar={false}
      />
    </ThemeProvider>
  );
}

export default App;
