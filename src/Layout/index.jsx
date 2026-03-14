import React, { useEffect } from "react";
import SideBarUser from "../Components/SidebarUser";
import { Outlet, useParams } from "react-router-dom";
import { socket } from "../socket.js";

export default function Layout() {
  const { roomChatId } = useParams();

  // 1️ connect socket
  useEffect(() => {
    socket.connect();
    return () => socket.disconnect();
  }, []);

  // 2️ join / leave room
  useEffect(() => {
    if (!roomChatId) return;

    socket.emit("JOIN_ROOM", { roomChatId });
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
