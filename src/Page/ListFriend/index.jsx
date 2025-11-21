import { Button } from "@mui/material";
import { SiIconify } from "react-icons/si";
import { GrImage } from "react-icons/gr";
import { FiPaperclip } from "react-icons/fi";
import { IoSend } from "react-icons/io5";
import React from "react";
import { FaRegSmile } from "react-icons/fa";
import { MdDevicesFold } from "react-icons/md";
import { LuUserRoundCheck } from "react-icons/lu";
import { Link, useParams } from "react-router-dom";
import { BsThreeDotsVertical } from "react-icons/bs";
export default function ListFriend() {
  return (
    <div className="w-full h-screen flex flex-col px-5">
      <div className="flex h-[8%] items-center   py-1 border-b flex-shrink-0">
        <div className="flex gap-3">
          <LuUserRoundCheck className="text-[22px]" />
          <div className="text-[16px]">Danh sách bạn bè</div>
        </div>
      </div>
      <div className="text-[14px] font-[500] py-4">Bạn bè (100)</div>
      <div className="bg-gray-50  rounded-md shadow-md">
        <Link
          to="/chat/691e855daf14807b287df949"
          className="flex items-center border-1 border-b justify-between gap-3 cursor-pointer hover:bg-gray-100 px-3 py-3"
        >
          <div className="flex items-center gap-4">
            <img
              src="https://jbagy.me/wp-content/uploads/2025/03/Hinh-anh-avatar-nam-cute-5-1.jpg"
              alt=""
              className="w-[45px] rounded-full"
            />
            <div className="text-[15px] font-[500]">Trương Tấn Kiên</div>
          </div>
          <BsThreeDotsVertical className="text-[20px]" />
        </Link>
        <Link
          to="/chat/691e855daf14807b287df949"
          className="flex items-center border-1 border-b justify-between gap-3 cursor-pointer hover:bg-gray-100 px-3 py-3"
        >
          <div className="flex items-center gap-4">
            <img
              src="https://jbagy.me/wp-content/uploads/2025/03/Hinh-anh-avatar-nam-cute-5-1.jpg"
              alt=""
              className="w-[45px] rounded-full"
            />
            <div className="text-[15px] font-[500]">Trương Tấn Kiên</div>
          </div>
          <BsThreeDotsVertical className="text-[20px]" />
        </Link>
        <Link
          to="/chat/691e855daf14807b287df949"
          className="flex items-center border-1 border-b justify-between gap-3 cursor-pointer hover:bg-gray-100 px-3 py-3"
        >
          <div className="flex items-center gap-4">
            <img
              src="https://jbagy.me/wp-content/uploads/2025/03/Hinh-anh-avatar-nam-cute-5-1.jpg"
              alt=""
              className="w-[45px] rounded-full"
            />
            <div className="text-[15px] font-[500]">Trương Tấn Kiên</div>
          </div>
          <BsThreeDotsVertical className="text-[20px]" />
        </Link>
        <Link
          to="/chat/691e855daf14807b287df949"
          className="flex items-center border-1 border-b justify-between gap-3 cursor-pointer hover:bg-gray-100 px-3 py-3"
        >
          <div className="flex items-center gap-4">
            <img
              src="https://jbagy.me/wp-content/uploads/2025/03/Hinh-anh-avatar-nam-cute-5-1.jpg"
              alt=""
              className="w-[45px] rounded-full"
            />
            <div className="text-[15px] font-[500]">Trương Tấn Kiên</div>
          </div>
          <BsThreeDotsVertical className="text-[20px]" />
        </Link>
      </div>
    </div>
  );
}
