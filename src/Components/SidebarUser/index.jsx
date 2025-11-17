import React from "react";
import { LuMessageSquareText } from "react-icons/lu";
import { GrDocumentUser } from "react-icons/gr";
import { IoMdCloudOutline } from "react-icons/io";
import { IoSettingsOutline } from "react-icons/io5";
import { Tooltip } from "@mui/material";
export default function SideBarUser() {
  return (
    <div className="w-[5%] flex flex-col py-7 items-center justify-between bg-gray-500 h-screen max-h-screen">
      <div className="flex flex-col items-center justify-center gap-5">
        <img
          src="https://jbagy.me/wp-content/uploads/2025/03/Hinh-anh-avatar-nam-cute-5-1.jpg"
          alt=""
          className="w-[45px] rounded-full"
        />
        <Tooltip title="Tin nhắn" placement="right-start">
          <LuMessageSquareText className="text-[26px] text-white" />
        </Tooltip>
        <Tooltip title="Danh bạ" placement="right-start">
          <GrDocumentUser className="text-[26px] text-white" />
        </Tooltip>
      </div>
      <div className="flex flex-col items-center justify-center gap-5">
        <Tooltip title="Cloud của tôi" placement="right-start">
          <IoMdCloudOutline className="text-[26px] text-white" />
        </Tooltip>
        <Tooltip title="Cài đặt" placement="right-start">
          <IoSettingsOutline className="text-[26px] text-white" />
        </Tooltip>
      </div>
    </div>
  );
}
