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
  const [text, setText] = useState("");
  const [keyword, setKeyword] = useState("");
  const socketConnection = useSelector((state) => state.user.socketConnection);
  //dialog
  const [openDialog, setOpenDialog] = React.useState(false);
  const handleClickOpen = () => {
    setOpenDialog(true);
  };

  const handleClose = () => {
    setOpenDialog(false);
  };

  //gửi lên server
  const handleSendRequire = (userId) => {
    setOpenDialog(false);
    socketConnection.emit("CLIENT_ADD_FRIEND", { userId, text });
  };
  useEffect(() => {
    const fetchData = async () => {
      const res = await getData(`/auth/getAllUser`);
      if (res.success) {
        setUsers(res.data);
      }
    };
    fetchData();
  }, []);
  const handleClickSearchFriend = async () => {
    if (keyword.trim() === "") {
      toast.error("Vui lòng nhập thông tin tìm kiếm");
      return;
    }
    try {
      const res = await getData(`/auth/searchUser?keyword=${keyword}`);
      if (res.success) {
        setUsers(res.data);
      }
    } catch (error) {
      toast.error("Tìm kiếm thất bại. Vui lòng thử lại sau.");
    }
  };

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
            label="Số điện thoại hoặc email người dùng"
            variant="standard"
            size="small"
            name="keyword"
            onChange={(e) => setKeyword(e.target.value)}
            sx={{ marginBottom: 2 }}
          />
          <Divider sx={{ marginY: 1 }} />
          <div>
            <div className="text-[13px] mb-2">Gợi ý kết bạn</div>
            {users.length > 0 ? (
              <div className="flex-1 overflow-y-auto">
                {users.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 hover:bg-gray-100 rounded-md cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={
                          item.avatar ||
                          "https://jbagy.me/wp-content/uploads/2025/03/Hinh-anh-avatar-nam-cute-5-1.jpg"
                        }
                        alt=""
                        className="w-[35px] rounded-full"
                      />
                      <div className="text-[14px] font-[500]">{item.name}</div>
                    </div>
                    <Button
                      variant="outlined"
                      size="small"
                      sx={{
                        textTransform: "none",
                        paddingX: "16px",
                        paddingY: "1px",
                      }}
                      onClick={handleClickOpen}
                    >
                      Kết bạn
                    </Button>
                    <Dialog
                      open={openDialog}
                      onClose={handleClose}
                      PaperProps={{
                        sx: {
                          width: "400px",
                          paddingX: "15px",
                          paddingTop: "10px",
                          maxWidth: "50vw",
                        },
                      }}
                    >
                      <div className="relative">
                        <img
                          src={
                            item.background ||
                            "https://cdn-media.sforum.vn/storage/app/media/ctv_seo3/mau-background-dep-6.jpg"
                          }
                          alt="background"
                          className="h-[120px] w-full object-cover rounded-md"
                        />
                        <div className="absolute flex gap-3 items-center bottom-[-45px] left-6">
                          <img
                            src={
                              item.avatar ||
                              "data:image/png;base64,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"
                            }
                            alt="avatar"
                            className="rounded-full w-[60px] border-2"
                          />
                          <div className=" font-[500] text-[16px]">
                            {item.name}
                          </div>
                        </div>
                      </div>
                      <div className="mt-12">
                        <textarea
                          placeholder="Hãy ghi lời chào khi kết bạn vào đây!"
                          className="w-full border border-gray-300 rounded p-2 focus:!border-blue-500"
                          rows={3}
                          onChange={(e) => {
                            setText(e.target.value);
                          }}
                        />
                      </div>
                      <DialogActions>
                        <Button onClick={handleClose}>Hủy</Button>
                        <Button
                          onClick={() => handleSendRequire(item._id)}
                          autoFocus
                        >
                          Gửi lời mời
                        </Button>
                      </DialogActions>
                    </Dialog>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[200px]">
                <FcSearch className="text-[50px]" />
                <div className="text-[14px] mt-2">
                  Không tìm thấy người dùng
                </div>
              </div>
            )}
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
            onClick={handleClickSearchFriend}
          >
            Tìm kiếm
          </Button>
        </div>
      </BootstrapDialog>
    </React.Fragment>
  );
}
