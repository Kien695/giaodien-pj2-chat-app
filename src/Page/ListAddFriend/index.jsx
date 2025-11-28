import { Button } from "@mui/material";
import React, { useEffect, useState } from "react";
import { PiChatCenteredDotsThin } from "react-icons/pi";
import { LuUserPlus } from "react-icons/lu";
import { getData } from "../../utils/api";
import { useSelector } from "react-redux";

export default function AddFriend() {
  const state = useSelector((state) => state.user);
  const socketConnection = state.socketConnection;
  const totalAccept =
    (state.lengthAcceptFriend ?? 0) + (state?.acceptFriends?.length ?? 0);
  const [invite, setInvite] = useState([]);
  //get data
  useEffect(() => {
    const fetchData = async () => {
      const res = await getData("auth/getAcceptFriend");
      if (res.success) {
        setInvite(res.data);
      }
    };
    fetchData();
  }, []);
  //server return info A
  useEffect(() => {
    if (!socketConnection) return;

    const handleAdd = (data) => {
      if (state._id === data.userId) {
        setInvite((prev) => {
          if (prev.find((u) => u._id === data.infoUserA._id)) return prev;
          return [...prev, data.infoUserA];
        });
      }
    };
    const handleDelete = (data) => {
      if (state._id === data.userIdB) {
        setInvite((prev) => prev.filter((item) => item._id !== data.userIdA));
      }
    };
    socketConnection.on("SERVER_RETURN_INFO_A", handleAdd);
    socketConnection.on("SERVER_DELETE_INFO_A", handleDelete);
    return () => {
      socketConnection.off("SERVER_RETURN_INFO_A", handleAdd);
      socketConnection.off("SERVER_DELETE_INFO_A", handleDelete);
    };
  }, [socketConnection, state._id]);

  const handleRefuseFriend = (userId) => {
    socketConnection.emit("CLIENT_REFUSE_FRIEND", userId);
  };
  const handleAcceptFriend = (userId) => {
    socketConnection.emit("CLIENT_ACCEPT_FRIEND", userId);
  };
  return (
    <div className="w-full h-screen flex flex-col px-5">
      <div className="flex h-[8%] items-center   py-1 border-b flex-shrink-0">
        <div className="flex gap-3">
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
            className="bg-gray-100 shadow-md border border-gray-300 p-4 flex flex-col gap-3  w-1/3 rounded-md shadow-md"
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
            <div className="bg-gray-200 border border-gray-300 p-3 rounded-md">
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
