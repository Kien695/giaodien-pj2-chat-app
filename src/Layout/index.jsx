import React from "react";
import SideBar from "../Components/SidebarInfo";
import { Outlet } from "react-router-dom";
import SideBarUser from "../Components/SidebarUser";
export default function Layout() {
  return (
    <div className="flex h-screen max-h-screen">
      <SideBarUser />
      <SideBar />
      <Outlet />
    </div>
  );
}
