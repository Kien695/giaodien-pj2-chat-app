import { Button } from "@mui/material";
import { SiIconify } from "react-icons/si";
import { GrImage } from "react-icons/gr";
import { FiPaperclip } from "react-icons/fi";
import { IoSend } from "react-icons/io5";
import React from "react";
import { FaRegSmile } from "react-icons/fa";
export default function Home() {
  return (
    <div className=" w-full h-screen flex flex-col">
      <div className="flex h-[11%] items-center justify-between px-5 py-1 border-b flex-shrink-0">
        <div className="flex gap-3">
          <img
            src="https://jbagy.me/wp-content/uploads/2025/03/Hinh-anh-avatar-nam-cute-5-1.jpg"
            alt=""
            className="w-[45px] rounded-full"
          />
          <div className="flex flex-col justify-between">
            <div className="text-[16px] font-[500]">Nguyễn Văn A</div>
            <div className="text-[14px] text-gray-700">
              Truy cập 30 phút trước
            </div>
          </div>
        </div>
        <Button>cc</Button>
      </div>
      <div className="flex-1 p-4 bg-blue-50 flex flex-col gap-2 overflow-y-auto">
        {/* Tin nhắn bên phải */}
        <div className="self-end max-w-[60%] bg-blue-100 text-gray-800 p-2 rounded-xl rounded-br-none">
          <div>Thấy bình thường á</div>
          <div className="text-[11px] text-gray-500 mt-1 text-right">09:29</div>
        </div>

        <div className="self-end max-w-[60%] bg-blue-100 text-gray-800 p-2 rounded-xl rounded-br-none">
          <div>Má hôm qua tập chủ đủ đồ rồi</div>
          <div className="text-[11px] text-gray-500 mt-1 text-right">09:29</div>
          <div className="flex gap-1 mt-1 justify-end">
            <span className="text-[12px]">😂 1</span>
          </div>
        </div>

        {/* Tin nhắn bên trái */}
        <div className="flex gap-2 max-w-[60%]">
          <img
            src="https://i.pravatar.cc/40"
            alt=""
            className="w-8 h-8 rounded-full"
          />
          <div className="bg-white text-gray-800 p-2 rounded-xl rounded-bl-none">
            <div>dở bây, tập ít quá</div>
            <div className="flex gap-1 mt-1">
              <span className="text-[12px]">😂 1</span>
            </div>
            <div className="text-[11px] text-gray-500 mt-1">09:42</div>
          </div>
        </div>

        <div className="flex gap-2 max-w-[60%]">
          <img
            src="https://i.pravatar.cc/40"
            alt=""
            className="w-8 h-8 rounded-full"
          />
          <div className="bg-white text-gray-800 p-2 rounded-xl rounded-bl-none">
            <div>có cái củ trong nồi cơm á</div>
            <div className="flex gap-1 mt-1">
              <span className="text-[12px]">👍 1</span>
              <span className="text-[12px]">👍 1</span>
            </div>
            <div className="text-[11px] text-gray-500 mt-1">09:42</div>
          </div>
        </div>

        <div className="flex gap-2 max-w-[60%]">
          <img
            src="https://i.pravatar.cc/40"
            alt=""
            className="w-8 h-8 rounded-full"
          />
          <div className="bg-white text-gray-800 p-2 rounded-xl rounded-bl-none">
            <div>chiều đi tập nha</div>
            <div className="flex gap-1 mt-1">
              <span className="text-[12px]">❤️ 1</span>
              <span className="text-[12px]">❤️ 1</span>
            </div>
            <div className="text-[11px] text-gray-500 mt-1">09:42</div>
          </div>
        </div>
        {/* Tin nhắn bên phải */}
        <div className="self-end max-w-[60%] bg-blue-100 text-gray-800 p-2 rounded-xl rounded-br-none">
          <div>Thấy bình thường á</div>
          <div className="text-[11px] text-gray-500 mt-1 text-right">09:29</div>
        </div>

        <div className="self-end max-w-[60%] bg-blue-100 text-gray-800 p-2 rounded-xl rounded-br-none">
          <div>Má hôm qua tập chủ đủ đồ rồi</div>
          <div className="text-[11px] text-gray-500 mt-1 text-right">09:29</div>
          <div className="flex gap-1 mt-1 justify-end">
            <span className="text-[12px]">😂 1</span>
          </div>
        </div>
      </div>
      <div className="flex flex-col border-t-2 h-[14%]">
        <div className="p-3 border-b-2 flex gap-6">
          <SiIconify className="text-[17px]" />
          <GrImage className="text-[17px]" />
          <FiPaperclip className="text-[17px]" />
        </div>

        <div className="flex items-center gap-2 px-3">
          <input
            type="text"
            placeholder="Nhập tin nhắn gửi đến A"
            className="flex-1 py-2 border-none focus:outline-none"
          />
          <IoSend className="text-blue-600 text-[23px]" />
        </div>
      </div>
    </div>
  );
}
