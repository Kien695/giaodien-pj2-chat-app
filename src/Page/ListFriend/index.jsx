import { Button, Menu, MenuItem } from "@mui/material";
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
import { useEffect } from "react";
import { getData } from "../../utils/api";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import InfoUser from "../../Components/infoUser";
import { setCurrentRoom } from "../../redux/userSlice";
export default function ListFriend() {
  const [anchorEl, setAnchorEl] = useState(null);
  const [openInfo, setOpenInfo] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const dispatch = useDispatch();
  const state = useSelector((state) => state.user);
  const socketConnection = state.socketConnection;
  const openMenu = Boolean(anchorEl);

  const handleClick = (event, item) => {
    setAnchorEl(event.currentTarget);
    setSelectedItem(item);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const count = useSelector((state) => state.user.countFriend);
  const friend = useSelector((state) => state.user.listFriend);

  //gửi lên server
  const handleUnFriend = (userId) => {
    socketConnection.emit("CLIENT_UNFRIEND", userId);
  };

  return (
    <div className="w-full h-screen flex flex-col px-5">
      <div className="flex h-[8%] items-center   py-1 border-b flex-shrink-0">
        <div className="flex gap-3">
          <LuUserRoundCheck className="text-[22px]" />
          <div className="text-[16px]">Danh sách bạn bè</div>
        </div>
      </div>
      <div className="text-[14px] font-[500] py-4">Bạn bè ({count})</div>
      <div className="bg-gray-50  rounded-md shadow-md">
        {friend.map((item, index) => (
          <div
            className="flex items-center border-1 border-b justify-between gap-3 cursor-pointer hover:bg-gray-100 px-3 py-3"
            key={index}
          >
            <Link to={`/chat/${item?.infoFriend?.room_chat_id}`}>
              <div className="flex items-center gap-4">
                <img
                  src={
                    item.avatar ||
                    "https://jbagy.me/wp-content/uploads/2025/03/Hinh-anh-avatar-nam-cute-5-1.jpg"
                  }
                  alt=""
                  className="w-[45px] rounded-full"
                />
                <div
                  className="text-[15px] font-[500]"
                  onClick={() =>
                    dispatch(setCurrentRoom(item?.infoFriend?.room_chat_id))
                  }
                >
                  {item.name}
                </div>
              </div>
            </Link>
            <BsThreeDotsVertical
              className="text-[20px]"
              onClick={(e) => handleClick(e, item)}
            />
            <Menu
              anchorEl={anchorEl}
              open={openMenu}
              onClose={handleClose}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
            >
              <MenuItem
                onClick={() => {
                  handleClose();
                  setOpenInfo(true);
                }}
                sx={{
                  fontSize: "14px",
                  padding: "5px 10px",
                }}
              >
                Xem thông tin
              </MenuItem>
              <MenuItem
                onClick={() => {
                  handleClose();
                  handleUnFriend(selectedItem._id);
                }}
                sx={{
                  fontSize: "14px",
                  padding: "5px 10px",
                }}
              >
                Hủy kết bạn
              </MenuItem>
            </Menu>
            <InfoUser
              open={openInfo}
              onClose={() => setOpenInfo(false)}
              user={selectedItem}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
