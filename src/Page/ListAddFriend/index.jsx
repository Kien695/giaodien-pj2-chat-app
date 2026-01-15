import { Button } from "@mui/material";
import React, { useEffect, useState } from "react";
import { PiChatCenteredDotsThin } from "react-icons/pi";
import { LuUserPlus } from "react-icons/lu";
import { getData } from "../../utils/api";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { MdOutlineKeyboardArrowLeft } from "react-icons/md";
import {
  decreaseAcceptFriend,
  setIncreaseAcceptFriend,
} from "../../redux/userSlice";
import { socket } from "../../socket";
export default function AddFriend() {
  const navigate = useNavigate();
  const state = useSelector((state) => state.user);

  const dispatch = useDispatch();
  const invite = state.listAddFriend;

  const totalAccept = invite.length;
  //get data
  // useEffect(() => {
  //   const fetchData = async () => {
  //     const res = await getData("auth/getAcceptFriend");
  //     if (res.success) {
  //       setInvite(res.data);
  //     }
  //   };
  //   fetchData();
  // }, []);
  //server return info A
  // useEffect(() => {
  //   if (!socket) return;

  //   const handleAdd = (data) => {
  //     if (state._id === data.userId) {
  //       setInvite((prev) => {
  //         if (prev.find((u) => u._id === data.infoUserA._id)) return prev;
  //         return [...prev, data.infoUserA];
  //       });
  //       dispatch(setIncreaseAcceptFriend());
  //     }
  //   };
  //   const handleDelete = (data) => {
  //     if (state._id === data.userIdB) {
  //       setInvite((prev) => prev.filter((item) => item._id !== data.userIdA));
  //     }
  //     dispatch(decreaseAcceptFriend());
  //   };
  //   socket.on("SERVER_RETURN_INFO_A", handleAdd);
  //   socket.on("SERVER_DELETE_INFO_A", handleDelete);
  //   return () => {
  //     socket.off("SERVER_RETURN_INFO_A", handleAdd);
  //     socket.off("SERVER_DELETE_INFO_A", handleDelete);
  //   };
  // }, [socket, state._id]);

  const handleRefuseFriend = (userId) => {
    socket.emit("CLIENT_REFUSE_FRIEND", userId);
  };
  const handleAcceptFriend = (userId) => {
    socket.emit("CLIENT_ACCEPT_FRIEND", userId);
  };
  //dark/mode
  const theme = useSelector((state) => state.theme.mode);

  return (
    <div
      className={`w-full h-screen flex flex-col px-5 ${
        theme == "dark" ? "bg-[#16191d] text-[#c2c5cd]" : "text-[#4f5c6f]"
      }`}
    >
      <div className="flex h-[8%] items-center   py-1 border-b flex-shrink-0">
        <div className="flex gap-3">
          <MdOutlineKeyboardArrowLeft
            className="text-[30px] cursor-pointer md:hidden "
            onClick={() => {
              navigate("/friend");
            }}
          />
          <LuUserPlus className="text-[22px]" />
          <div className="text-[16px]">Lời mời kết bạn</div>
        </div>
      </div>
      <div className="text-[14px] font-[500] py-4">
        Lời mời đã nhận ({totalAccept})
      </div>
      <div className="flex flex-wrap gap-3">
        {invite.map((item, index) => (
          <div
            className={`${
              theme == "dark" ? "bg-[#2d3136] " : "bg-gray-100"
            } shadow-md border border-gray-300 p-4 flex flex-col gap-3  md:w-1/3 rounded-md `}
            key={item._id}
          >
            <div className="flex justify-between">
              <div className="flex items-center gap-4">
                <img
                  src={
                    item.avatar ||
                    "https://jbagy.me/wp-content/uploads/2025/03/Hinh-anh-avatar-nam-cute-5-1.jpg"
                  }
                  alt=""
                  className="w-[45px] rounded-full"
                />
                <div className="flex flex-col">
                  <span className="text-[15px] font-[500]">{item.name}</span>
                  <span className="text-[12px] text-gray-500">21/11</span>
                </div>
              </div>
              <PiChatCenteredDotsThin className="text-[20px] cursor-pointer" />
            </div>
            <div
              className={`${
                theme == "dark" ? "bg-[#2d3136] " : "bg-gray-100"
              }border border-gray-300 p-2 rounded-md`}
            >
              {item?.requestFriends[0]?.message}
            </div>
            <div className="flex gap-3 justify-center">
              <Button
                variant="outlined"
                color="error"
                onClick={() => handleRefuseFriend(item._id)}
              >
                Từ chối
              </Button>
              <Button
                variant="outlined"
                onClick={() => handleAcceptFriend(item._id)}
              >
                Đồng ý
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
