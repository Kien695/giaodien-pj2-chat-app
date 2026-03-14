import {
  Button,
  ButtonBase,
  Checkbox,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  FormGroup,
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
import { socket } from "../../socket";
import InfoUser from "../infoUser";
export default function AddFriend({ open, onClose }) {
  const [users, setUsers] = useState([]);
  const [searchUser, setSearchUser] = useState(null);
  const [text, setText] = useState("");
  const [keyword, setKeyword] = useState("");

  //dialog
  const [openDialog, setOpenDialog] = React.useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const handleClickOpen = () => {
    setOpenDialog(true);
  };

  const handleClose = () => {
    setOpenDialog(false);
  };

  //gửi lên server
  const handleSendRequire = (userId) => {
    setOpenDialog(false);
    setKeyword("");
    socket.emit("CLIENT_ADD_FRIEND", { userId, text });
  };
  useEffect(() => {
    if (keyword.trim() === "") {
      setSearchUser(null);
    }
  }, [keyword]);
  useEffect(() => {
    const fetchData = async () => {
      const res = await getData(`/auth/getAllUser`);
      if (res.success) {
        setUsers(res.data);
      }
    };
    fetchData();
  }, [keyword]);
  const handleClickSearchFriend = async () => {
    if (keyword.trim() === "") {
      toast.error("Vui lòng nhập thông tin tìm kiếm");
      return;
    }
    try {
      const res = await getData(`/auth/searchUser?keyword=${keyword}`);
      if (res.success) {
        setSearchUser(res.data);
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
        <DialogContent dividers className="flex flex-col flex-1 ">
          <div className="relative w-full">
            <TextField
              fullWidth
              value={keyword}
              label="Số điện thoại hoặc email người dùng"
              variant="standard"
              size="small"
              name="keyword"
              onChange={(e) => setKeyword(e.target.value)}
              sx={{ marginBottom: 2 }}
            />
            {keyword && searchUser && (
              <div className="absolute flex item-center justify-between bg-gray-100 top-16 border p-2 w-full rounded-lg shadow-md">
                <div className="flex items-center gap-2">
                  <img
                    src={
                      searchUser?.avatar ||
                      "https://jbagy.me/wp-content/uploads/2025/03/Hinh-anh-avatar-nam-cute-5-1.jpg"
                    }
                    alt=""
                    className="w-[35px] rounded-full"
                  />
                  <div className="text-[15px]">{searchUser?.name}</div>
                </div>
                <Button
                  variant="outlined"
                  size="small"
                  sx={{
                    textTransform: "none",
                    paddingX: "16px",
                    paddingY: "1px",
                  }}
                  onClick={() => {
                    setSelectedUser(searchUser);
                    setOpenDialog(true);
                  }}
                >
                  Kết bạn
                </Button>
              </div>
            )}
          </div>

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
                      onClick={() => {
                        setSelectedUser(item);
                        setOpenDialog(true);
                      }}
                    >
                      Kết bạn
                    </Button>
                  </div>
                ))}
                <Dialog
                  open={openDialog}
                  onClose={() => setOpenDialog(false)}
                  PaperProps={{
                    sx: {
                      width: "400px",
                      paddingX: "15px",
                      paddingTop: "10px",
                      maxWidth: "66vw",
                    },
                  }}
                >
                  {selectedUser && (
                    <React.Fragment>
                      <div className="relative">
                        <img
                          src={
                            selectedUser.background ||
                            "https://cdn-media.sforum.vn/storage/app/media/ctv_seo3/mau-background-dep-6.jpg"
                          }
                          className="h-[120px] w-full object-cover rounded-md"
                        />

                        <div className="absolute flex gap-3 items-center bottom-[-45px] left-6">
                          <img
                            src={
                              selectedUser.avatar ||
                              "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSsGuNeeq7R_EoWkiZPOvfRF5B0ZSbLCwRAnA&s"
                            }
                            className="rounded-full w-[60px] border-2"
                          />
                          <div className="font-[500] text-[16px]">
                            {selectedUser.name}
                          </div>
                        </div>
                      </div>

                      <div className="mt-12">
                        <textarea
                          placeholder="Hãy ghi lời chào khi kết bạn vào đây!"
                          className="w-full border rounded p-2"
                          rows={3}
                          onChange={(e) => setText(e.target.value)}
                        />
                      </div>

                      <DialogActions>
                        <Button onClick={() => setOpenDialog(false)}>
                          Hủy
                        </Button>
                        <Button
                          onClick={() => handleSendRequire(selectedUser._id)}
                        >
                          Gửi lời mời
                        </Button>
                      </DialogActions>
                    </React.Fragment>
                  )}
                </Dialog>
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
