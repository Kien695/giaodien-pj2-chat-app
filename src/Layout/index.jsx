import React, { useEffect } from "react";
import SideBar from "../Components/SidebarInfo";
import { Outlet } from "react-router-dom";
import SideBarUser from "../Components/SidebarUser";
import { useDispatch, useSelector } from "react-redux";
import { io } from "socket.io-client";
import { setOnlineUser, setSocketConnection } from "../redux/userSlice";
export default function Layout() {
  const dispatch = useDispatch();
  useEffect(() => {
    const socket = io("http://localhost:3000", {
      autoConnect: true,
      auth: {
        token: localStorage.getItem("accessToken"),
      },
    });
    socket.on("onlineUser", (data) => {
      dispatch(setOnlineUser(data));
    });
    dispatch(setSocketConnection(socket));
    return () => {
      socket.disconnect();
    };
  }, []);
  return (
    <div className="flex h-screen max-h-screen">
      <SideBarUser />

      <div className="flex-1">
        <Outlet />
      </div>
    </div>
  );
}
