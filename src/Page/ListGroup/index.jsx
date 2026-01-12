import { Menu, MenuItem } from "@mui/material";
import React, { useEffect } from "react";
import { useState } from "react";
import { BsThreeDotsVertical } from "react-icons/bs";
import { FiUsers } from "react-icons/fi";
import { LuUserPlus } from "react-icons/lu";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { patchData } from "../../utils/api";
import { MdOutlineKeyboardArrowLeft } from "react-icons/md";

export default function ListGroup() {
  const state = useSelector((state) => state.user);
  const socketConnection = state.socketConnection;
  const count = useSelector((state) => state.user.countGroup);
  const room = useSelector((state) => state.user.listGroup);
  const navigate = useNavigate();
  const [selectedItem, setSelectedItem] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const openMenu = Boolean(anchorEl);
  const handleClick = (event, item) => {
    setAnchorEl(event.currentTarget);
    setSelectedItem(item);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  //leave group
  const handleLeaveGroup = async (roomChatId) => {
    console.log(roomChatId);
    try {
      const res = await patchData(`/auth/leaveGroup/${roomChatId}`);
      if (res.success) {
        setAnchorEl(null);
        socketConnection.emit("CLIENT_LEAVE_ROOM_PERSON", {
          roomChatId,
        });
      }
    } catch (error) {
      if (error.response) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Không thể kết nối server!");
      }
    }
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
          <FiUsers className="text-[22px]" />
          <div className="text-[16px] font-[500]">Danh sách nhóm</div>
        </div>
      </div>
      <div className="text-[14px] font-[500] py-4">
        Hiện có ({room.length}) nhóm
      </div>
      <div
        className={`${
          theme == "dark" ? "bg-[#22262b]" : "bg-gray-50"
        } rounded-md shadow-md `}
      >
        {room.map((item, index) => (
          <div
            className={`flex items-center border-1 border-b justify-between gap-3 cursor-pointer ${
              theme == "dark" ? "hover:bg-[#2d3136]" : "hover:bg-gray-100"
            }  px-3 py-3`}
            key={index}
          >
            <div
              className="flex items-center gap-4 cursor-pointer"
              onClick={() => navigate(`/chat/${item._id}`)}
            >
              <img
                src={
                  item.avatar ||
                  "https://jbagy.me/wp-content/uploads/2025/03/Hinh-anh-avatar-nam-cute-5-1.jpg"
                }
                alt=""
                className="w-[45px] rounded-full"
              />
              <div>
                <div className="text-[15px] font-[500] ">{item.title}</div>
                <span className="text-[13px] ">
                  Có {item?.users?.length} thành viên
                </span>
              </div>
            </div>

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
              sx={{
                paddingTop: "0px",
                paddingBottom: "0px",
              }}
            >
              <MenuItem
                onClick={(e) => {
                  handleLeaveGroup(selectedItem._id);
                }}
                sx={{
                  fontSize: "14px",
                  padding: "5px 10px",
                  backgroundColor: "#ff5252",
                  color: "#fff",
                  "&:hover": {
                    backgroundColor: "red",
                  },
                  "&.Mui-focusVisible": {
                    backgroundColor: "#ff5252",
                  },
                  "&.MuiMenuItem-root.Mui-selected": {
                    backgroundColor: "#ff5252",
                  },
                  "&.MuiMenuItem-root.Mui-selected:hover": {
                    backgroundColor: "#ff5252",
                  },
                }}
              >
                Rời nhóm
              </MenuItem>
            </Menu>
          </div>
        ))}
      </div>
    </div>
  );
}
