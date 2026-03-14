import React, { use, useEffect, useState } from "react";
import { LuMessageSquareText } from "react-icons/lu";
import { GrDocumentUser } from "react-icons/gr";
import { IoMdCloudOutline } from "react-icons/io";
import { IoSettingsOutline } from "react-icons/io5";
import { Badge, Box, Divider, Menu, MenuItem, Tooltip } from "@mui/material";
import InfoUser from "../infoUser";
import Setting from "../Setting";
import { useDispatch, useSelector } from "react-redux";
import { postData } from "../../utils/api";
import { toast } from "react-toastify";
import { logout } from "../../redux/userSlice";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { socket } from "../../socket";
import useIsMobile from "../IsMobile";
export default function SideBarUser() {
  const isMobile = useIsMobile();
  const documentId = localStorage.getItem("documentId") || "";
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [openInfo, setOpenInfo] = useState(false);
  const [openSetting, setOpenSetting] = useState(false);
  const [lengthAccept, setLengthAccept] = useState(0);
  const open = Boolean(anchorEl);
  const user = useSelector((state) => state.user);

  const total = user.lengthAcceptFriend ?? 0;

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleLogout = async () => {
    try {
      const resLogout = await postData("/auth/logout");
      if (resLogout.success) {
        socket.disconnect();
        toast.success("Đăng xuất thành công");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("documentId");
        localStorage.removeItem("theme");
        localStorage.removeItem("useAvatarBg");
        dispatch(logout());
        navigate("/auth");
      }
    } catch (error) {
      if (error.response) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Không thể kết nối server!");
      }
    }
  };

  return (
    <div className=" w-[11%] md:w-[4%]   flex flex-col py-7 items-center justify-between bg-gray-500 h-screen max-h-screen">
      <div className="flex flex-col items-center justify-center gap-5">
        <img
          src={
            user.avatar ||
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSsGuNeeq7R_EoWkiZPOvfRF5B0ZSbLCwRAnA&s"
          }
          alt="avatar"
          className="w-[45px] rounded-full cursor-pointer"
          onClick={handleClick}
        />

        <Menu
          id="basic-menu"
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          slotProps={{
            paper: {
              sx: {
                width: 200,
                borderRadius: 2,
                py: 1,
                px: 1,
              },
            },
            list: {
              sx: {
                p: 0,
              },
            },
          }}
        >
          {/* Header */}
          <Box sx={{ px: 1.5, py: 1, fontWeight: 500 }}>{user.name}</Box>

          <Divider sx={{ my: 0.3 }} />

          <MenuItem
            sx={{ py: 0.7, px: 1.5 }}
            onClick={() => {
              handleClose(); // đóng menu
              setOpenInfo(true); // mở modal
            }}
          >
            Thông tin cá nhân
          </MenuItem>

          <MenuItem
            sx={{ py: 0.7, px: 1.5 }}
            onClick={() => {
              (handleClose(), setOpenSetting(true));
            }}
          >
            Cài đặt
          </MenuItem>

          <Divider sx={{ my: 0.3 }} />

          <MenuItem sx={{ py: 0.7, px: 1.5 }} onClick={handleLogout}>
            Đăng xuất
          </MenuItem>
        </Menu>
        <InfoUser
          open={openInfo}
          onClose={() => setOpenInfo(false)}
          user={user}
          type="personal"
        />
        <NavLink
          to="/chat/"
          end={false}
          className={({ isActive }) =>
            `p-2 rounded ${isActive ? "bg-gray-700" : ""}`
          }
        >
          <Tooltip title="Tin nhắn" placement="right-start">
            <LuMessageSquareText className="text-[26px] text-white" />
          </Tooltip>
        </NavLink>
        <NavLink
          to={isMobile ? "/friend" : "/friend/1"}
          className={({ isActive }) =>
            `p-2 rounded ${isActive ? "bg-gray-700" : ""}`
          }
        >
          <Tooltip title="Danh bạ" placement="right-start">
            <div className="relative">
              <GrDocumentUser className="text-[26px] text-white" />

              {total > 0 && (
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
              )}
            </div>
          </Tooltip>
        </NavLink>
      </div>

      <div className="flex flex-col items-center justify-center gap-5">
        <Tooltip title="My documents" placement="right-start">
          <Link to={`/chat/${documentId}`}>
            <IoMdCloudOutline className="text-[26px] text-white" />
          </Link>
        </Tooltip>
        <Tooltip title="Cài đặt" placement="right-start">
          <IoSettingsOutline
            className="text-[26px] text-white cursor-pointer"
            onClick={() => {
              setOpenSetting(true); // mở modal
            }}
          />
        </Tooltip>
        <Setting open={openSetting} onClose={() => setOpenSetting(false)} />
      </div>
    </div>
  );
}
