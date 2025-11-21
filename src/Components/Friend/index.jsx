import React, { useState } from "react";
import Function from "../Function";
import { NavLink, Outlet } from "react-router-dom";
import { LuUserPlus, LuUserRoundCheck } from "react-icons/lu";
import { FiUsers } from "react-icons/fi";
import { AiOutlineUsergroupAdd } from "react-icons/ai";
function Friend() {
  const [active, setActive] = useState(1);

  return (
    <div className="flex">
      <div className="w-[300px] bg-gray-50 border border-r h-screen">
        <Function />
        <NavLink
          to="/friend/1"
          className={({ isActive }) =>
            `cursor-pointer flex gap-3  hover:bg-gray-100 font-[500] px-4 py-4 items-center ${
              isActive ? "bg-gray-200 " : ""
            }`
          }
        >
          <LuUserRoundCheck className="text-[22px]" />
          <div className="text-[17px]">Danh sách bạn bè</div>
        </NavLink>
        <NavLink
          to="/friend/2"
          className={({ isActive }) =>
            `cursor-pointer flex gap-3  hover:bg-gray-100 font-[500] px-4 py-4 items-center ${
              isActive ? "bg-gray-200 " : ""
            }`
          }
        >
          <FiUsers className="text-[22px]" />
          <div className="text-[17px]">Danh sách nhóm</div>
        </NavLink>
        <NavLink
          to="/friend/3"
          className={({ isActive }) =>
            `cursor-pointer flex gap-3  hover:bg-gray-100 font-[500] px-4 py-4 items-center ${
              isActive ? "bg-gray-200 " : ""
            }`
          }
        >
          <LuUserPlus className="text-[22px]" />
          <div className="text-[17px]">Lời mời kết bạn</div>
        </NavLink>
        <NavLink
          to="/friend/4"
          className={({ isActive }) =>
            `cursor-pointer flex gap-3  hover:bg-gray-100 font-[500] px-4 py-4 items-center ${
              isActive ? "bg-gray-200 " : ""
            }`
          }
        >
          <AiOutlineUsergroupAdd className="text-[22px] " />
          <div className="text-[17px]">Lời mời vào nhóm</div>
        </NavLink>
      </div>
      <div className="flex-1">
        <Outlet />
      </div>
    </div>
  );
}

export default Friend;
