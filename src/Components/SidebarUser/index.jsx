import React, { use, useState } from "react";
import { LuMessageSquareText } from "react-icons/lu";
import { GrDocumentUser } from "react-icons/gr";
import { IoMdCloudOutline } from "react-icons/io";
import { IoSettingsOutline } from "react-icons/io5";
import { Box, Divider, Menu, MenuItem, Tooltip } from "@mui/material";
import InfoUser from "../infoUser";
import Setting from "../Setting";
import { useDispatch, useSelector } from "react-redux";
import { postData } from "../../utils/api";
import { toast } from "react-toastify";
import { logout } from "../../redux/userSlice";
import { useNavigate } from "react-router-dom";
export default function SideBarUser() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [openInfo, setOpenInfo] = useState(false);
  const [openSetting, setOpenSetting] = useState(false);
  const open = Boolean(anchorEl);
  const user = useSelector((state) => state.user);
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
        toast.success("Đăng xuất thành công");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
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
    <div className="w-[6%] flex flex-col py-7 items-center justify-between bg-gray-500 h-screen max-h-screen">
      <div className="flex flex-col items-center justify-center gap-5">
        {user.avatar && (
          <img
            src={user.avatar}
            alt="avatar"
            className="w-[45px] rounded-full cursor-pointer"
            onClick={handleClick}
          />
        )}

        <Menu
          id="basic-menu"
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          PaperProps={{
            sx: {
              width: 200,
              borderRadius: 2,
              py: 1,
              px: 1,
            },
          }}
          MenuListProps={{
            sx: {
              p: 0,
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
              handleClose(), setOpenSetting(true);
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
        />

        <Tooltip title="Tin nhắn" placement="right-start">
          <LuMessageSquareText className="text-[26px] text-white" />
        </Tooltip>
        <Tooltip title="Danh bạ" placement="right-start">
          <GrDocumentUser className="text-[26px] text-white" />
        </Tooltip>
      </div>
      <div className="flex flex-col items-center justify-center gap-5">
        <Tooltip title="Cloud của tôi" placement="right-start">
          <IoMdCloudOutline className="text-[26px] text-white" />
        </Tooltip>
        <Tooltip title="Cài đặt" placement="right-start">
          <IoSettingsOutline
            className="text-[26px] text-white"
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
