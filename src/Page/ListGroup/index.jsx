import React from "react";
import { FiUsers } from "react-icons/fi";
import { LuUserPlus } from "react-icons/lu";

export default function ListGroup() {
  return (
    <div className="w-full h-screen flex flex-col px-5">
      <div className="flex h-[8%] items-center   py-1 border-b flex-shrink-0">
        <div className="flex gap-3">
          <FiUsers className="text-[22px]" />
          <div className="text-[16px]">Danh sách nhóm</div>
        </div>
      </div>
      <div className="text-[14px] font-[500] py-4">Hiện có (1) nhóm</div>
      <div className="bg-gray-50 w-[100px] rounded-md shadow-md"></div>
    </div>
  );
}
