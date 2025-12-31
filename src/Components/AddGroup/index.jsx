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
import React, { useEffect, useRef, useState } from "react";
import { IoClose, IoSearch } from "react-icons/io5";
import { getData, postData } from "../../utils/api";
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
export default function AddGroup({ open, onClose }) {
  const friend = useSelector((state) => state.user.listFriend);
  const [user, setUser] = React.useState([]);
  const [keyword, setKeyword] = React.useState("");
  const [searchText, setSearchText] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    members: [],
  });
  const ref = {
    title: useRef(),
  };
  const handleToggleMember = (userId) => {
    setFormData((prev) => {
      const alreadySelected = prev.members.includes(userId);

      // Nếu đã có thì bỏ ra, chưa có thì thêm vào
      return {
        ...prev,
        members: alreadySelected
          ? prev.members.filter((id) => id !== userId)
          : [...prev.members, userId],
      };
    });
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
      const res = await getData(`/auth/searchUser?keyword=${keyword}`);
      if (res.success) {
        setUser(res.data);
      }
    };

    fetchData();
  }, [keyword]);
  const handleCreateRoom = async () => {
    try {
      if (!formData.title) {
        toast.error("Vui lòng nhập tên nhóm");
        ref.title.current?.focus();
        return;
      }
      const res = await postData("/auth/createRoom", formData);
      if (res.success) {
        toast.success("Tạo nhóm thành công");
        onClose();
      }
    } catch (error) {
      console.error("Lỗi:", error);
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
            height: "86vh",
            maxWidth: "90vw",
          },
        }}
      >
        <div className="flex items-center justify-between px-5 py-2 ">
          <div className="text-[16px] font-[500]">Tạo nhóm</div>
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
          <div className="flex flex-col gap-4 h-[120px]">
            <TextField
              name="title"
              label="Nhập tên nhóm"
              variant="standard"
              inputRef={ref.title}
              size="small"
              onChange={(e) => {
                setFormData({ ...formData, title: e.target.value });
              }}
            />
            <TextField
              variant="outlined"
              placeholder="Nhập tên, số điện thoại hoặc gmail"
              name="keyword"
              onChange={handleInputChange}
              sx={{
                "& .MuiInputBase-input": {
                  padding: "8px 14px",
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
                      <IoSearch className="cursor-pointer" />
                    </InputAdornment>
                  ),
                },
              }}
            />
            <Divider sx={{ my: 0.2 }} />
          </div>
          {searchText !== "" ? (
            <div className=" flex-1 overflow-y-scroll">
              {user.length > 0 ? (
                <FormGroup>
                  {user.map((item, index) => (
                    <FormControlLabel
                      sx={{
                        gap: 1,
                      }}
                      control={
                        <Checkbox
                          checked={formData.members.includes(item._id)}
                          onChange={() => handleToggleMember(item._id)}
                        />
                      }
                      label={
                        <div className="flex items-center gap-2">
                          <img
                            src={
                              item.avatar ||
                              "https://jbagy.me/wp-content/uploads/2025/03/Hinh-anh-avatar-nam-cute-5-1.jpg"
                            }
                            alt=""
                            className="w-[35px] rounded-full"
                          />
                          <div className="text-[15px] ">{item.name}</div>
                        </div>
                      }
                    />
                  ))}
                </FormGroup>
              ) : (
                <div className="flex-1 flex  items-center justify-center gap-3">
                  <FcSearch className="text-[30px]" />{" "}
                  <div className="text-[18px] text-gray-500">
                    Không tìm thấy kết quả
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="">
              <div className="flex gap-3">
                {/* Cột trái */}
                <div
                  className={`overflow-y-scroll ${
                    formData.members.length === 0 ? "w-full" : "w-[65%]"
                  } h-[290px]`}
                >
                  <div className="text-[14px] py-1 font-[500]">
                    Danh sách bạn bè
                  </div>
                  <FormGroup>
                    {friend.map((item, index) => (
                      <FormControlLabel
                        key={index}
                        sx={{ gap: 1, paddingY: "3px" }}
                        control={
                          <Checkbox
                            checked={formData.members.includes(item._id)}
                            onChange={() => handleToggleMember(item._id)}
                          />
                        }
                        label={
                          <div className="flex items-center gap-2">
                            <img
                              src={
                                item.avatar ||
                                "https://jbagy.me/wp-content/uploads/2025/03/Hinh-anh-avatar-nam-cute-5-1.jpg"
                              }
                              alt=""
                              className="w-[35px] rounded-full"
                            />
                            <div className="text-[15px]">{item.name}</div>
                          </div>
                        }
                      />
                    ))}
                  </FormGroup>
                </div>

                {/* Cột phải */}
                {formData.members.length > 0 && (
                  <div className="w-[35%] border border-gray-300 mt-3 p-2">
                    <div className="text-[13px] gap-5">
                      Đã chọn:
                      <span className="w-3 h-5 rounded-lg bg-blue-100 p-1 text-blue-600 ml-1">
                        {formData?.members?.length}/100
                      </span>
                    </div>
                    <div className="mt-2 flex flex-col gap-2">
                      {formData.members.map((memberId, index) => {
                        const member = friend.find((f) => f._id === memberId);
                        return (
                          <div
                            key={index}
                            className="flex gap-2 justify-between items-center bg-blue-100 p-1 rounded-lg"
                          >
                            <div className="flex gap-1 items-center">
                              <img
                                src={
                                  member?.avatar ||
                                  "https://jbagy.me/wp-content/uploads/2025/03/Hinh-anh-avatar-nam-cute-5-1.jpg"
                                }
                                alt=""
                                className="w-[20px] rounded-full"
                              />
                              <div className="text-[13px] line-clamp-1 text-blue-600 max-w-[120px]">
                                {member?.name}
                              </div>
                            </div>
                            <CgCloseO
                              className="cursor-pointer "
                              onClick={() => handleToggleMember(memberId)}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
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
            disabled={formData.members.length > 1 ? false : true}
            onClick={handleCreateRoom}
          >
            Tạo nhóm
          </Button>
        </div>
      </BootstrapDialog>
    </React.Fragment>
  );
}
