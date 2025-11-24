import { InputAdornment, TextField, Tooltip } from "@mui/material";
import { IoSearch } from "react-icons/io5";
import { AiOutlineUserAdd } from "react-icons/ai";
import { AiOutlineUsergroupAdd } from "react-icons/ai";
import React, { useState } from "react";
import { useEffect } from "react";
import { getData } from "../../utils/api";

export default function Function({ setSearchText, setUser }) {
  const [keyword, setKeyword] = useState("");
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
      const res = await getData(`/auth/getAllUser?keyword=${keyword}`);
      if (res.success) {
        setUser(res.data);
      }
    };

    fetchData();
  }, [keyword]);

  return (
    <div className="flex h-[10%] items-center justify-between px-3">
      <TextField
        variant="outlined"
        placeholder="Tìm kiếm..."
        size="small"
        name="keyword"
        onChange={handleInputChange}
        sx={{
          "& .MuiInputBase-input": {
            padding: "5px 10px", // thu nhỏ chiều cao
            fontSize: "14px",
          },
          "& .MuiInputBase-root": {
            borderRadius: "8px",
          },
        }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <IoSearch className="cursor-pointer" onClick={handleClick} />
              </InputAdornment>
            ),
          },
        }}
      />
      <div className="flex gap-3">
        <Tooltip title="Thêm bạn bè" placement="top-end">
          <AiOutlineUserAdd className="text-[20px]" />
        </Tooltip>
        <Tooltip title="Tạo nhóm" placement="top-end">
          <AiOutlineUsergroupAdd className="text-[20px]" />
        </Tooltip>
      </div>
    </div>
  );
}
