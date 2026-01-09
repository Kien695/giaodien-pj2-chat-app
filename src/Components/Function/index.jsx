import { Button, InputAdornment, TextField, Tooltip } from "@mui/material";
import { IoSearch } from "react-icons/io5";
import { AiOutlineUserAdd } from "react-icons/ai";
import { AiOutlineUsergroupAdd } from "react-icons/ai";
import React, { useState } from "react";
import { useEffect } from "react";
import { getData } from "../../utils/api";
import AddGroup from "../AddGroup";
import AddFriend from "../AddFriend";
import { useSelector } from "react-redux";

export default function Function({ setSearchText, setUser }) {
  const [keyword, setKeyword] = useState("");
  const [openGroup, setOpenGroup] = useState(false);
  const [openSearchFriend, setOpenSearchFriend] = useState(false);
  const handleClick = () => {
    console.log("ok");
  };
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
        size="small"
        name="keyword"
        onChange={handleInputChange}
        className={`border-white ${
          theme === "dark" ? "bg-[#22262b] text-white " : "bg-white text-black "
        }`}
        sx={{
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
            padding: "5px 10px",
            fontSize: "14px",
            color: theme === "dark" ? "#fff" : "#000", // text input
          },
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: theme === "dark" ? "#555" : "#ccc", // viền mặc định
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
                  onClick={handleClick}
                />
              </InputAdornment>
            ),
          },
        }}
      />
      <div className="flex gap-1">
        <Tooltip title="Thêm bạn bè" placement="top-end">
          <Button
            sx={{
              paddingX: "5px",
              minWidth: 0,
            }}
            onClick={() => {
              setOpenSearchFriend(true); // mở modal
            }}
          >
            <AiOutlineUserAdd className="text-[20px]" />
          </Button>
        </Tooltip>
        <Tooltip title="Tạo nhóm" placement="top-end">
          <Button
            sx={{
              paddingX: "5px",
              minWidth: 0,
            }}
            onClick={() => {
              setOpenGroup(true); // mở modal
            }}
          >
            <AiOutlineUsergroupAdd className="text-[20px]" />
          </Button>
        </Tooltip>
      </div>
      <AddGroup open={openGroup} onClose={() => setOpenGroup(false)} />
      <AddFriend
        open={openSearchFriend}
        onClose={() => setOpenSearchFriend(false)}
      />
    </div>
  );
}
