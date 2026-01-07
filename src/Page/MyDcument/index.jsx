import React from "react";
import logoMyDocument from "../../assets/my-documents-icon-260nw-21989287.webp";
export default function MyDocument() {
  return (
    <div className="flex gap-3 relative">
      <img
        src={
          logoMyDocument ||
          "https://jbagy.me/wp-content/uploads/2025/03/Hinh-anh-avatar-nam-cute-5-1.jpg"
        }
        alt="avatar"
        className="w-[45px] rounded-full cursor-pointer"
      />

      <div className="flex flex-col ">
        <div className="text-[16px] font-[500] flex gap-2 items-center ">
          <span className="cursor-pointer">My Documents</span>
        </div>
        <div className="text-[14px] text-gray-700 flex gap-1 cursor-pointer items-center hover:text-blue-500">
          Lưu trử thông tin cho riêng cá nhân
        </div>
      </div>
    </div>
  );
}
