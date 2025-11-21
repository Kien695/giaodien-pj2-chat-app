import { Button } from "@mui/material";
import React from "react";
import { PiChatCenteredDotsThin } from "react-icons/pi";
import { LuUserPlus } from "react-icons/lu";

export default function AddFriend() {
  return (
    <div className="w-full h-screen flex flex-col px-5">
      <div className="flex h-[8%] items-center   py-1 border-b flex-shrink-0">
        <div className="flex gap-3">
          <LuUserPlus className="text-[22px]" />
          <div className="text-[16px]">Lời mời kết bạn</div>
        </div>
      </div>
      <div className="text-[14px] font-[500] py-4">Lời mời đã nhận (1)</div>
      <div className="bg-gray-100 shadow-md border border-gray-300 p-4 flex flex-col gap-3  w-[300px] rounded-md shadow-md">
        <div className="flex justify-between">
          <div className="flex items-center gap-4">
            <img
              src="https://jbagy.me/wp-content/uploads/2025/03/Hinh-anh-avatar-nam-cute-5-1.jpg"
              alt=""
              className="w-[45px] rounded-full"
            />
            <div className="flex flex-col">
              <span className="text-[15px] font-[500]">Trương Tấn Kiên</span>
              <span className="text-[12px] text-gray-500">21/11</span>
            </div>
          </div>
          <PiChatCenteredDotsThin className="text-[20px] cursor-pointer" />
        </div>
        <div className="bg-gray-200 border border-gray-300 p-3 rounded-md">
          Xin chào! Mình là Kiên. Kết bạn với mình nhé
        </div>
        <div className="flex gap-3 justify-center">
          <Button variant="outlined">Từ chối</Button>
          <Button color="error" variant="outlined">
            Đồng ý
          </Button>
        </div>
      </div>
    </div>
  );
}
