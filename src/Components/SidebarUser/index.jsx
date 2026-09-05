import React, { useState } from "react";
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
import { LuClapperboard } from "react-icons/lu";
import {
  clearLocalPushSubscription,
  getStoredPushSubscriptionId,
} from "../../utils/pushNotification";
export default function SideBarUser({ hideBottomNav }) {
  const isMobile = useIsMobile();
  const documentId = localStorage.getItem("documentId") || "";
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [openInfo, setOpenInfo] = useState(false);
  const [openSetting, setOpenSetting] = useState(false);
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
      const resLogout = await postData("/auth/logout", {
        pushSubscriptionId: getStoredPushSubscriptionId(),
      });
      if (resLogout.success) {
        await clearLocalPushSubscription().catch(() => {});
        socket.disconnect();
        toast.success("Đăng xuất thành công");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("documentId");
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
    <>
      {/* Desktop */}
      {!isMobile && (
        <aside className="primary-sidebar w-[68px] shrink-0 flex flex-col py-5 items-center justify-between bg-[#0068ff] h-screen">
          <div className="flex flex-col items-center justify-center gap-3">
            <img
              src={
                user.avatar ||
                "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSsGuNeeq7R_EoWkiZPOvfRF5B0ZSbLCwRAnA&s"
              }
              alt="avatar"
              className="h-10 w-10 rounded-full object-cover cursor-pointer ring-2 ring-white/80"
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
                `sidebar-action p-2.5 rounded-lg ${isActive ? "bg-white/20" : ""}`
              }
            >
              <Tooltip title="Tin nhắn" placement="right-start">
                <LuMessageSquareText className="text-[26px] text-white" />
              </Tooltip>
            </NavLink>
            <NavLink
              to={isMobile ? "/friend" : "/friend/1"}
              className={({ isActive }) =>
                `sidebar-action p-2.5 rounded-lg ${isActive ? "bg-white/20" : ""}`
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
            <NavLink
              to="/video"
              className={({ isActive }) =>
                `sidebar-action p-2.5 rounded-lg ${isActive ? "bg-white/20" : ""}`
              }
            >
              <Tooltip title="Video" placement="right-start">
                <LuClapperboard className="text-[26px] text-white" />
              </Tooltip>
            </NavLink>
          </div>

          <div className="flex flex-col items-center justify-center gap-3">
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
        </aside>
      )}

      {/* Mobile */}
      {isMobile && !hideBottomNav && (
        <nav className="mobile-nav app-panel app-divider fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center border-t">
          <NavLink
            to="/chat"
            className={({ isActive }) =>
              `mobile-nav-item flex flex-col items-center ${
                isActive ? "text-[var(--primary)]" : "text-[var(--text-secondary)]"
              }`
            }
          >
            <LuMessageSquareText size={24} />
            <span className="text-[10px]">Tin nhắn</span>
          </NavLink>

          <NavLink
            to="/friend"
            className={({ isActive }) =>
              `mobile-nav-item flex flex-col items-center relative ${
                isActive ? "text-[var(--primary)]" : "text-[var(--text-secondary)]"
              }`
            }
          >
            <GrDocumentUser size={22} />

            {total > 0 && (
              <span className="absolute top-0 right-2 h-2.5 w-2.5 rounded-full bg-red-500"></span>
            )}

            <span className="text-[10px]">Bạn bè</span>
          </NavLink>

          <NavLink
            to="/video"
            className={({ isActive }) =>
              `mobile-nav-item flex flex-col items-center ${isActive ? "text-[var(--primary)]" : "text-[var(--text-secondary)]"}`
            }
          >
            <LuClapperboard size={22} />
            <span className="text-[10px]">Video</span>
          </NavLink>

          <button
            onClick={() => {
              setOpenInfo(true); // mở modal
            }}
            className="mobile-nav-item flex flex-col items-center"
          >
            <img
              src={
                user.avatar ||
                "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSsGuNeeq7R_EoWkiZPOvfRF5B0ZSbLCwRAnA&s"
              }
              className="w-6 h-6 rounded-full"
            />

            <span className="mt-1 text-[10px] text-[var(--text-secondary)]">Cá nhân</span>
          </button>
        </nav>
      )}

      {/* Menu cá nhân */}

      <InfoUser
        open={openInfo}
        onClose={() => setOpenInfo(false)}
        user={user}
        type="personal"
      />

      <Setting open={openSetting} onClose={() => setOpenSetting(false)} />
    </>
  );
}
