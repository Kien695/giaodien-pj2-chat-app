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
import { logout, setLengthAcceptFriend } from "../../redux/userSlice";
import { Link, NavLink, useNavigate } from "react-router-dom";
export default function SideBarUser() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [openInfo, setOpenInfo] = useState(false);
  const [openSetting, setOpenSetting] = useState(false);
  const [lengthAccept, setLengthAccept] = useState(0);
  const open = Boolean(anchorEl);
  const user = useSelector((state) => state.user);
  const socketConnection = user.socketConnection;

  //server return lengthAccept
  useEffect(() => {
    if (!socketConnection) return;
    const handleAccept = (data) => {
      if (user._id === data?.userId) {
        localStorage.setItem(
          "lengthAcceptFriend",
          JSON.stringify(data.lengthAcceptFriend)
        );
        dispatch(setLengthAcceptFriend(data.lengthAcceptFriend));
      }
    };
    socketConnection.on("SEVER_RETURN_LENGTH_ACCEPT_FRIEND", handleAccept);
    return () => {
      socketConnection.off("SEVER_RETURN_LENGTH_ACCEPT_FRIEND", handleAccept);
    };
  }, [socketConnection, user._id]);

  const total =
    (user.lengthAcceptFriend ?? 0) + (user?.acceptFriends?.length ?? 0);

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
    <div className="w-[4%] flex flex-col py-7 items-center justify-between bg-gray-500 h-screen max-h-screen">
      <div className="flex flex-col items-center justify-center gap-5">
        {user.avatar ? (
          <img
            src={user.avatar}
            alt="avatar"
            className="w-[45px] rounded-full cursor-pointer"
            onClick={handleClick}
          />
        ) : (
          <img
            className="w-[45px] rounded-full cursor-pointer"
            onClick={handleClick}
            src="data:image/png;base64,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"
          ></img>
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
          to="/friend/"
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
