import React, { useState } from "react";
import Function from "../Function";
import { NavLink, Outlet } from "react-router-dom";
import { LuUserPlus, LuUserRoundCheck } from "react-icons/lu";
import { FiUsers } from "react-icons/fi";
import { AiOutlineUsergroupAdd } from "react-icons/ai";
import { FcSearch } from "react-icons/fc";
import { Button } from "@mui/material";
function Friend() {
  const [active, setActive] = useState(1);
  const [searchText, setSearchText] = useState("");
  const [user, setUser] = useState([]);
  return (
    <div className="flex">
      <div className="w-[300px] bg-gray-50 border border-r h-screen">
        <Function setSearchText={setSearchText} setUser={setUser} />
        {searchText ? (
          <>
            {user.length > 0 ? (
              <div className="h-[89%]  flex py-4">
                <div className="flex flex-col gap-3">
                  {user.map((item, index) => (
                    <div className="flex gap-3 mx-3 rounded-md  items-center cursor-pointer bg-gray-100 border px-3 py-4 w-full h-[70px]">
                      <img
                        src={item.avatar}
                        alt="avatar"
                        className="w-[40px] h-[40px] rounded-full"
                      />

                      <div className="ml-4">
                        <div className="text-[14px] font-[500] ml-1">
                          {item.name}
                        </div>
                        <div>
                          <Button size="small">Từ chối</Button>
                          <Button color="error" size="small">
                            Đồng ý
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-[89%] flex  items-center justify-center">
                <FcSearch className="text-[60px]" />{" "}
                <div className="text-[18px] text-gray-500">
                  Không tìm thấy kết quả
                </div>
              </div>
            )}
          </>
        ) : (
          <>
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
          </>
        )}
      </div>
      <div className="flex-1">
        <Outlet />
      </div>
    </div>
  );
}

export default Friend;
