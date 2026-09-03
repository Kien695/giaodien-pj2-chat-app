import React, { useEffect } from "react";
import SideBarUser from "../Components/SidebarUser";
import { Outlet, useParams } from "react-router-dom";
import { socket } from "../socket.js";
import { useMatch } from "react-router-dom";

export default function Layout() {
  const { roomChatId } = useParams();

  const isChatDetail = useMatch("/chat/:id");

  // Join the active room now and again after every authenticated reconnect.
  useEffect(() => {
    if (!roomChatId) return;

    const joinActiveRoom = () => {
      socket.emit("JOIN_ROOM", { roomChatId });
    };

    if (socket.connected) joinActiveRoom();
    socket.on("connect", joinActiveRoom);

    return () => {
      socket.off("connect", joinActiveRoom);
    };
  }, [roomChatId]);

  return (
    <div className="app-shell flex h-screen max-h-screen overflow-hidden">
      <SideBarUser hideBottomNav={!!isChatDetail} />
      <div className="min-w-0 flex-1">
        <Outlet />
      </div>
    </div>
  );
}
