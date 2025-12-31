import { Menu, MenuItem } from "@mui/material";
import React, { useEffect } from "react";
import { useState } from "react";
import { BsThreeDotsVertical } from "react-icons/bs";
import { FiUsers } from "react-icons/fi";
import { LuUserPlus } from "react-icons/lu";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

export default function ListGroup() {
  const count = useSelector((state) => state.user.countGroup);
  const room = useSelector((state) => state.user.listGroup);

  const [anchorEl, setAnchorEl] = useState(null);
  const openMenu = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div className="w-full h-screen flex flex-col px-5">
      <div className="flex h-[8%] items-center   py-1 border-b flex-shrink-0">
        <div className="flex gap-3">
          <FiUsers className="text-[22px]" />
          <div className="text-[16px]">Danh sách nhóm</div>
        </div>
      </div>
      <div className="text-[14px] font-[500] py-4">Hiện có ({count}) nhóm</div>
      <div className="bg-gray-50  rounded-md shadow-md">
        {room.map((item, index) => (
          <div
            className="flex items-center border-1 border-b justify-between gap-3 cursor-pointer hover:bg-gray-100 px-3 py-3"
            key={index}
          >
            <Link to={`/chat/${item._id}`}>
              <div className="flex items-center gap-4">
                <img
                  src="https://jbagy.me/wp-content/uploads/2025/03/Hinh-anh-avatar-nam-cute-5-1.jpg"
                  alt=""
                  className="w-[45px] rounded-full"
                />
                <div>
                  <div className="text-[15px] font-[500] text-gray-800">
                    {item.title}
                  </div>
                  <span className="text-[13px] text-gray-500">
                    Có {item?.users?.length} thành viên
                  </span>
                </div>
              </div>
            </Link>
            <BsThreeDotsVertical
              className="text-[20px]"
              onClick={handleClick}
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
                onClick={handleClose}
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
              <MenuItem
                onClick={handleClose}
                sx={{
                  fontSize: "14px",
                  padding: "5px 10px",
                  backgroundColor: "gray",
                  color: "#fff",
                  "&:hover": {
                    backgroundColor: "#3c3c3c",
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
                Giải tán nhóm
              </MenuItem>
            </Menu>
          </div>
        ))}
      </div>
    </div>
  );
}
