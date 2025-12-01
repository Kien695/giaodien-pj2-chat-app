import {
  Button,
  ButtonBase,
  Checkbox,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import { toast } from "react-toastify";
import { styled } from "@mui/material/styles";
import Dialog from "@mui/material/Dialog";
import React, { useEffect, useState } from "react";
import { IoClose, IoSearch } from "react-icons/io5";
import { getData } from "../../utils/api";
import { FcSearch } from "react-icons/fc";
import { useSelector } from "react-redux";
import { CgCloseO } from "react-icons/cg";
const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialogContent-root": {
    padding: theme.spacing(2),
  },
  "& .MuiDialogActions-root": {
    padding: theme.spacing(1),
  },
}));
export default function AddFriend({ open, onClose }) {
  const [users, setUsers] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
      const res = await getData(`/auth/getAllUser`);
      if (res.success) {
        setUsers(res.data);
      }
    };
    fetchData();
  }, []);
  return (
    <React.Fragment>
      <BootstrapDialog
        aria-labelledby="customized-dialog-title"
        open={open}
        onClose={onClose}
        PaperProps={{
          sx: {
            width: "450px",
            height: "85vh",
            maxWidth: "90vw",
          },
        }}
      >
        <div className="flex items-center justify-between px-5 py-2 ">
          <div className="text-[16px] font-[500]">Thêm bạn bè</div>
          <Button
            sx={{
              color: "black",
              transition: "all 0.3s ease-in-out",
              "&:hover": {
                backgroundColor: "#ff5252",
                color: "white",
                transform: "scale(1.05)",
              },
            }}
            onClick={onClose}
          >
            <IoClose className="text-[22px] cursor-pointer" />
          </Button>
        </div>
        <DialogContent dividers className="flex flex-col flex-1">
          <TextField
            label="Số điện thoại, email hoặc tên người dùng"
            variant="standard"
            size="small"
            sx={{ marginBottom: 2 }}
          />
          <Divider sx={{ marginY: 1 }} />
          <div>
            <div className="text-[13px]">Gợi ý kết bạn</div>
            <div className="flex-1 overflow-y-auto">
              {users.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 hover:bg-gray-100 rounded-md cursor-pointer"
                ></div>
              ))}
            </div>
          </div>
        </DialogContent>
        <div className="py-2 px-4 flex justify-end gap-2">
          <Button
            variant="contained"
            sx={{
              textTransform: "none",
              backgroundColor: "gray",
              color: "#fff",
            }}
            onClick={onClose}
          >
            Hủy
          </Button>
          <Button
            variant="contained"
            sx={{
              backgroundColor: "#ff5252",
              textTransform: "none",
              color: "#fff",
            }}
          >
            Tìm kiếm
          </Button>
        </div>
      </BootstrapDialog>
    </React.Fragment>
  );
}
