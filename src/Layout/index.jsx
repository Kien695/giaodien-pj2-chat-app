import React, { useEffect, useRef } from "react";
import SideBar from "../Components/SidebarInfo";
import { Outlet, useParams } from "react-router-dom";
import SideBarUser from "../Components/SidebarUser";
import { useDispatch, useSelector } from "react-redux";
import { io } from "socket.io-client";
import { setOnlineUser, setSocketConnection } from "../redux/userSlice";
export default function Layout() {
  const dispatch = useDispatch();
  const { roomChatId } = useParams();
  const { socketConnection } = useSelector((state) => state.user);
  const socketRef = useRef(null);

  useEffect(() => {
    const socket = io(import.meta.env.VITE_SOCKET_URL, {
      auth: {
        token: localStorage.getItem("accessToken"),
      },
    });

    socketRef.current = socket;
    dispatch(setSocketConnection(socket));

    return () => {
      socket.disconnect();
    };
  }, []);
  useEffect(() => {
    if (!socketConnection || !roomChatId) return;

    // JOIN ROOM ngay lập tức
    socketConnection.emit("JOIN_ROOM", { roomChatId });

    return () => {
      socketConnection.emit("LEAVE_ROOM", { roomChatId });
    };
  }, [socketConnection, roomChatId]);

  return (
    <div className="flex h-screen max-h-screen">
      <SideBarUser />

      <div className="flex-1">
        <Outlet />
      </div>
    </div>
  );
}
