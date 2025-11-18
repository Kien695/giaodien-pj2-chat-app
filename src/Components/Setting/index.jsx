import * as React from "react";
import Button from "@mui/material/Button";
import { styled } from "@mui/material/styles";
import Dialog from "@mui/material/Dialog";

import IconButton from "@mui/material/IconButton";
import { CiEdit } from "react-icons/ci";
import { TbLogout2 } from "react-icons/tb";
import { IoClose } from "react-icons/io5";
import { AiOutlineSecurityScan } from "react-icons/ai";
import { MdLockOpen, MdOutlineCleaningServices } from "react-icons/md";
const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialogContent-root": {
    padding: theme.spacing(2),
  },
  "& .MuiDialogActions-root": {
    padding: theme.spacing(1),
  },
}));

export default function Setting({ open, onClose }) {
  return (
    <React.Fragment>
      <BootstrapDialog
        open={open}
        onClose={onClose}
        PaperProps={{
          sx: {
            width: "750px",
            height: "500px",
            maxWidth: "90vw",
          },
        }}
      >
        <div className="flex h-full ">
          <div className="w-[30%] border-r">
            <div className="py-3 px-4 text-[17px] font-[500]">Cài đặt</div>
            <div className=" py-2 px-4 cursor-pointer flex gap-2 items-center font-[500] text-[15px] hover:bg-gray-200">
              <AiOutlineSecurityScan />
              <span>Tài khoản và bảo mật</span>
            </div>
            <div className=" py-2 px-4 cursor-pointer flex gap-2 items-center font-[500] text-[15px] hover:bg-gray-200">
              <MdLockOpen />
              <span>Quyền riêng tư</span>
            </div>
            <div className="py-2 px-4 cursor-pointer flex gap-2 items-center font-[500] text-[15px] hover:bg-gray-200">
              <MdOutlineCleaningServices />
              <span>Giao diện</span>
            </div>
            <div className="py-2 px-4 cursor-pointer flex gap-2 items-center font-[500] text-[15px] hover:bg-gray-200">
              <TbLogout2 />
              <span>Đăng xuất</span>
            </div>
          </div>
          <div className="flex-1 flex justify-end items-start">
            <Button
              sx={{
                color: "black",
                transition: "all 0.3s ease-in-out",
                "&:hover": {
                  backgroundColor: "#ff5252",
                  color: "white",
                },
              }}
              onClick={onClose}
            >
              <IoClose className="text-[22px] cursor-pointer" />
            </Button>
          </div>
        </div>
      </BootstrapDialog>
    </React.Fragment>
  );
}
