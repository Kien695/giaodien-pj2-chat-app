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

  const socketRef = useRef(null);

  useEffect(() => {
    const socket = io("http://localhost:3000", {
      auth: {
        token: localStorage.getItem("accessToken"),
      },
    });

    socketRef.current = socket;
    dispatch(setSocketConnection(socket));

    socket.on("onlineUser", (data) => {
      dispatch(setOnlineUser(data));
    });

    return () => {
      socket.disconnect();
    };
  }, []);
  useEffect(() => {
    if (!socketRef.current || !roomChatId) return;

    socketRef.current.emit("JOIN_ROOM", {
      roomChatId,
    });
  }, [roomChatId]);

  return (
    <div className="flex h-screen max-h-screen">
      <SideBarUser />

      <div className="flex-1">
        <Outlet />
      </div>
    </div>
  );
}
