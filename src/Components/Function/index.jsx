import {
  Button,
  InputAdornment,
  Menu,
  MenuItem,
  TextField,
  Tooltip,
} from "@mui/material";
import { IoAdd, IoSearch } from "react-icons/io5";
import { AiOutlineUserAdd } from "react-icons/ai";
import { AiOutlineUsergroupAdd } from "react-icons/ai";
import React, { useState } from "react";
import { useEffect } from "react";
import { getData } from "../../utils/api";
import AddGroup from "../AddGroup";
import AddFriend from "../AddFriend";
import { useSelector } from "react-redux";
import useIsMobile from "../IsMobile";
import { CiSettings } from "react-icons/ci";
import Setting from "../Setting";
import { MdOutlineQrCodeScanner } from "react-icons/md";
import QRScannerModal from "../../Page/QRCode";

export default function Function({ setSearchText, setUser }) {
  const [keyword, setKeyword] = useState("");
  const [openGroup, setOpenGroup] = useState(false);
  const [openSearchFriend, setOpenSearchFriend] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [openSetting, setOpenSetting] = useState(false);
  const [openScanner, setOpenScanner] = useState(false);
  const open = Boolean(anchorEl);
  const isMobile = useIsMobile();
  const handleInputChange = (e) => {
    const value = e.target.value;
    setKeyword(value);
    setSearchText(value);
  };

  useEffect(() => {
    if (!keyword) {
      setUser([]);
      return;
    }

    const fetchData = async () => {
      const res = await getData(`/auth/getUserFind?keyword=${keyword}`);
      if (res.success) {
        setUser(res.data);
      }
    };

    fetchData();
  }, [keyword]);
  //dark/mode
  const theme = useSelector((state) => state.theme.mode);
  return (
    <div className="flex h-[10%] items-center justify-between px-3 gap-2">
      <TextField
        variant="outlined"
        placeholder="Tìm kiếm..."
        name="keyword"
        onChange={handleInputChange}
        className={`border-white ${
          theme === "dark" ? "bg-[#22262b] text-white " : "bg-white text-black "
        }`}
        sx={{
          // 1. Độ rộng: Trên Mobile (xs) chiếm 100% full width, trên PC (md) để cố định (ví dụ 300px) hoặc tự do
          width: { xs: "70%", md: "300px" },

          "& .MuiOutlinedInput-root": {
            backgroundColor: theme === "dark" ? "#22262b" : "#fff",
            color: theme === "dark" ? "#fff" : "#000",
            borderRadius: "8px",
            "&:hover fieldset": {
              borderColor: theme === "dark" ? "#555" : "#ccc",
            },
            "&.Mui-focused fieldset": {
              borderColor: theme === "dark" ? "#fff" : "#000",
            },
          },
          "& .MuiInputBase-input": {
            // 2. Độ cao / Padding: Mobile padding "12px 14px" (to hơn), PC padding "8px 12px"
            padding: { xs: "7px 9px", md: "5px 7px" },

            // 3. Kích thước chữ: Mobile 16px (tránh bị zoom tự động trên iOS), PC 14px
            fontSize: { xs: "16px", md: "12px" },

            color: theme === "dark" ? "#fff" : "#000",
          },
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: theme === "dark" ? "#555" : "#ccc",
          },
        }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <IoSearch
                  className={`${
                    theme == "dark" ? "!text-white" : ""
                  } cursor-pointer`}
                />
              </InputAdornment>
            ),
          },
        }}
      />
      {isMobile ? (
        <div className="flex gap-3 items-center">
          <MdOutlineQrCodeScanner
            className="text-[20px] text-blue-500"
            onClick={() => setOpenScanner(true)}
          />
          <QRScannerModal
            open={openScanner}
            onClose={() => setOpenScanner(false)}
          />
          <div>
            <Button
              sx={{ minWidth: 0, p: 0.5 }}
              onClick={(e) => setAnchorEl(e.currentTarget)}
            >
              <IoAdd className="text-[26px]" />
            </Button>

            <Menu
              anchorEl={anchorEl}
              open={open}
              onClose={() => setAnchorEl(null)}
            >
              <MenuItem
                onClick={() => {
                  setAnchorEl(null);
                  setOpenSearchFriend(true);
                }}
              >
                <AiOutlineUserAdd className="mr-2" />
                Thêm bạn bè
              </MenuItem>

              <MenuItem
                onClick={() => {
                  setAnchorEl(null);
                  setOpenGroup(true);
                }}
              >
                <AiOutlineUsergroupAdd className="mr-2" />
                Tạo nhóm
              </MenuItem>
              <MenuItem
                onClick={() => {
                  (setAnchorEl(null), setOpenSetting(true));
                }}
              >
                <CiSettings className="mr-2" /> Cài đặt
              </MenuItem>
            </Menu>
          </div>
        </div>
      ) : (
        <div className="flex gap-1">
          <Tooltip title="Thêm bạn bè">
            <Button
              sx={{ px: "5px", minWidth: 0 }}
              onClick={() => setOpenSearchFriend(true)}
            >
              <AiOutlineUserAdd className="text-[20px]" />
            </Button>
          </Tooltip>

          <Tooltip title="Tạo nhóm">
            <Button
              sx={{ px: "5px", minWidth: 0 }}
              onClick={() => setOpenGroup(true)}
            >
              <AiOutlineUsergroupAdd className="text-[20px]" />
            </Button>
          </Tooltip>
        </div>
      )}
      <AddGroup open={openGroup} onClose={() => setOpenGroup(false)} />
      <AddFriend
        open={openSearchFriend}
        onClose={() => setOpenSearchFriend(false)}
      />
      <Setting open={openSetting} onClose={() => setOpenSetting(false)} />
    </div>
  );
}
