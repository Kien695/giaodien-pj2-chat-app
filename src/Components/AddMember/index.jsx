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
import { styled } from "@mui/material/styles";
import Dialog from "@mui/material/Dialog";
import React, { useEffect, useState } from "react";
import { IoClose, IoSearch } from "react-icons/io5";
import { getData, patchData } from "../../utils/api";
import { FcSearch } from "react-icons/fc";
import { useSelector } from "react-redux";
import { CgCloseO } from "react-icons/cg";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialogContent-root": {
    padding: theme.spacing(2),
  },
  "& .MuiDialogActions-root": {
    padding: theme.spacing(1),
  },
}));

export default function AddMember({ open, onClose, roomChatId, dataUser }) {
  const friend = useSelector((state) => state.user.listFriend);
  const [user, setUser] = React.useState(null);
  const [keyword, setKeyword] = React.useState("");
  const debouncedKeyword = useDebouncedValue(keyword.trim());
  const [searchText, setSearchText] = useState("");
  const [formData, setFormData] = useState({
    members: [],
  });
  const [memberUI, setMemberUI] = useState([]);
  const handleToggleMember = (user) => {
    setFormData((prev) => {
      const alreadySelected = prev.members.includes(user._id);

      // Nếu đã có thì bỏ ra, chưa có thì thêm vào
      return {
        ...prev,
        members: alreadySelected
          ? prev.members.filter((id) => id !== user._id)
          : [...prev.members, user._id],
      };
    });
    setMemberUI((prev) => {
      const exists = prev.some((m) => m._id === user._id);

      return exists
        ? prev.filter((m) => m._id !== user._id)
        : [
            ...prev,
            {
              _id: user._id,
              name: user.name,
              avatar: user.avatar,
            },
          ];
    });
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setKeyword(value);
    setSearchText(value);
  };
  //search user
  useEffect(() => {
    if (!open || !debouncedKeyword) {
      setUser(null); // chưa tìm
      return;
    }
    let active = true;

    const fetchData = async () => {
      try {
        const res = await getData(
          `/auth/searchUser?keyword=${encodeURIComponent(debouncedKeyword)}`,
        );
        if (active && res.success) {
          setUser(res.data);
        }
      } catch {
        if (active) setUser(null);
      }
    };

    fetchData();
    return () => {
      active = false;
    };
  }, [debouncedKeyword, open]);
  //api add member
  const handleAddMember = async () => {
    try {
      const res = await patchData(`/auth/addMember/${roomChatId}`, formData);
      if (res.success) {
        onClose();
      }
    } catch (error) {
      console.error("Lỗi:", error);
    }
  };
  //get id  data user
  const groupMemberIds = dataUser.map((u) => u.user_id._id || u.user_id);

  return (
    <React.Fragment>
      <BootstrapDialog
        aria-labelledby="customized-dialog-title"
        open={open}
        onClose={onClose}
        PaperProps={{
          sx: {
            width: "450px",
            height: "87vh",
            maxWidth: "90vw",
          },
        }}
      >
        <div className="flex items-center justify-between px-5 py-2 ">
          <div className="text-[16px] font-[500]">Thêm thành viên</div>
          <Button
            sx={{
              color: "text.primary",
              transition: "all 0.3s ease-in-out",
              "&:hover": {
                backgroundColor: "action.hover",
                color: "error.main",
                transform: "scale(1.05)",
              },
            }}
            onClick={onClose}
          >
            <IoClose className="text-[22px] cursor-pointer" />
          </Button>
        </div>
        <DialogContent dividers className="flex flex-col flex-1">
          <div className="flex flex-col gap-4 mb-8">
            <div className="relative ">
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Nhập tên, số điện thoại hoặc gmail"
                name="keyword"
                value={keyword}
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
              {searchText && (
                <div className="app-card absolute top-10 w-full rounded-lg border p-2 shadow-md">
                  {user != null ? (
                    <FormGroup>
                      <FormControlLabel
                        sx={{
                          gap: 1,
                        }}
                        control={
                          <Checkbox
                            disabled={groupMemberIds.includes(user._id)}
                            onClick={() => {
                              setSearchText("");
                              setKeyword("");
                            }}
                            checked={
                              !groupMemberIds.includes(user._id) &&
                              formData.members.includes(user?._id)
                            }
                            onChange={() => handleToggleMember(user)}
                          />
                        }
                        label={
                          <div className="flex items-center gap-2">
                            <img
                              src={
                                user?.avatar ||
                                "https://jbagy.me/wp-content/uploads/2025/03/Hinh-anh-avatar-nam-cute-5-1.jpg"
                              }
                              alt=""
                              className="w-[35px] rounded-full"
                            />
                            <div className="text-[15px] ">{user?.name}</div>
                          </div>
                        }
                      />
                    </FormGroup>
                  ) : (
                    <div className="flex-1 flex  items-center justify-center gap-3">
                      <FcSearch className="text-[30px]" />{" "}
                      <div className="app-muted text-[18px]">
                        Không tìm thấy kết quả
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          <Divider sx={{ my: 0.4 }} />
          <div className="">
            <div className="flex gap-3">
              {/* Cột trái */}
              <div
                className={`overflow-y-scroll ${
                  formData.members.length === 0 ? "w-full" : "w-[65%]"
                } h-[290px]`}
              >
                <div className="text-[14px] py-2 font-[500]">
                  Danh sách bạn bè
                </div>
                <FormGroup>
                  {friend.map((item, index) => {
                    const isInGroup = groupMemberIds.includes(item._id);
                    const isChecked = formData.members.includes(item._id);

                    return (
                      <FormControlLabel
                        key={index}
                        sx={{ gap: 1, paddingY: "3px" }}
                        control={
                          <Checkbox
                            disabled={isInGroup} //  đã trong group → không cho chọn
                            checked={!isInGroup && isChecked} // không tick nếu đã trong group
                            onChange={() => handleToggleMember(item)}
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
                    );
                  })}
                </FormGroup>
              </div>

              {/* Cột phải */}
              {memberUI.length > 0 && (
                <div className="app-divider mt-3 w-[35%] border p-2">
                  <div className="text-[13px] gap-5">
                    Đã chọn:
                    <span className="ml-1 h-5 w-3 rounded-lg bg-[var(--surface-selected)] p-1 text-[var(--primary)]">
                      {memberUI.length}/100
                    </span>
                  </div>

                  <div className="mt-2 flex flex-col gap-2">
                    {memberUI.map((member) => (
                      <div
                        key={member._id}
                        className="flex gap-2 justify-between items-center bg-blue-100 p-1 rounded-lg"
                      >
                        <div className="flex gap-1 items-center">
                          <img
                            src={
                              member.avatar ||
                              "https://jbagy.me/wp-content/uploads/2025/03/Hinh-anh-avatar-nam-cute-5-1.jpg"
                            }
                            alt=""
                            className="w-[20px] rounded-full"
                          />
                          <div className="text-[13px] line-clamp-1 text-blue-600 max-w-[120px]">
                            {member.name}
                          </div>
                        </div>

                        <CgCloseO
                          className="cursor-pointer"
                          onClick={() => handleToggleMember(member)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
        <div className="py-2 px-4 flex justify-end gap-2">
          <Button
            variant="outlined"
            onClick={onClose}
          >
            Hủy
          </Button>
          <Button
            variant="contained"
            color="primary"
            disabled={formData.members.length > 0 ? false : true}
            onClick={handleAddMember}
          >
            Thêm thành viên
          </Button>
        </div>
      </BootstrapDialog>
    </React.Fragment>
  );
}
