import * as React from "react";
import dayjs from "dayjs";
import Button from "@mui/material/Button";
import { styled } from "@mui/material/styles";
import Dialog from "@mui/material/Dialog";
import { BsThreeDots } from "react-icons/bs";
import IconButton from "@mui/material/IconButton";
import { CiEdit } from "react-icons/ci";
import Typography from "@mui/material/Typography";
import { IoClose } from "react-icons/io5";
import {
  Box,
  CircularProgress,
  DialogActions,
  Divider,
  Drawer,
  FormControl,
  FormControlLabel,
  Menu,
  MenuItem,
  Radio,
  RadioGroup,
  Slide,
  TextField,
} from "@mui/material";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { MdDriveFolderUpload, MdOutlineArrowBackIosNew } from "react-icons/md";
import { patchData, putData } from "../../utils/api";
import { setUser } from "../../redux/userSlice";
import { toast } from "react-toastify";
import { useRef } from "react";

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialogContent-root": {
    padding: theme.spacing(2),
  },
  "& .MuiDialogActions-root": {
    padding: theme.spacing(1),
  },
}));
const Transition = React.forwardRef(function Transition(props, ref) {
  return (
    <Slide
      direction="left"
      ref={ref}
      {...props}
      timeout={{ enter: 500, exit: 500 }}
    />
  );
});
export default function InfoUser({ open, onClose, user, type }) {
  const dispatch = useDispatch();
  const [previewAvatar, setPreviewAvatar] = useState(null);
  const [previewBackground, setPreviewBackground] = useState(null);

  const [loadingAvatar, setLoadingAvatar] = useState(false);
  const [loadingBackground, setLoadingBackground] = useState(false);

  const [openEdit, setOpenEdit] = useState(false);

  const [anchorEl, setAnchorEl] = React.useState(null);
  const openMenu = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const fileCoverRef = useRef(null);

  //Edit avatar or background
  const handleUpload = async (file, type) => {
    try {
      // tạo preview để show ngay
      if (type === "avatar") {
        setPreviewAvatar(URL.createObjectURL(file));
        setLoadingAvatar(true);
      } else {
        setPreviewBackground(URL.createObjectURL(file));
        setLoadingBackground(true);
      }

      const formData = new FormData();
      formData.append("image", file);
      formData.append("type", type);

      const response = await putData("/auth/updateImage", formData);

      if (response.success) {
        if (type == "avatar") {
          toast.success("Đổi ảnh đại diện thành công!");
          setPreviewAvatar(null);
        } else {
          toast.success("Đổi ảnh nền thành công!");
          setPreviewBackground();
        }

        dispatch(setUser(response.data));
      }
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      if (type == "avatar") {
        setLoadingAvatar(false);
      } else {
        setLoadingBackground(false);
      }
    }
  };
  //Save info detail
  const [formData, setFormData] = useState({
    name: user?.name || "",
    mobile: user?.mobile || "",
    date_of_birth: user?.date_of_birth || "",
    gender: user?.gender || "",
  });
  const handleOpenEdit = () => {
    setFormData({
      name: user.name || "",
      gender: user.gender || "",
      date_of_birth: user.date_of_birth
        ? dayjs(user.date_of_birth).format("YYYY-MM-DD")
        : "",
      mobile: user.mobile || "",
    });
    setOpenEdit(true);
  };

  const handleInput = (e) => {
    const { name, value } = e.target;
    if (name === "mobile") {
      const numericValue = value.replace(/\D/g, "");
      setFormData((prev) => ({ ...prev, mobile: numericValue }));
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  const handleSaveDetail = async () => {
    try {
      const res = await patchData("/auth/updateUser", formData);
      if (res.success) {
        toast.success("Cập nhật thông tin thành công!");
        dispatch(setUser(res.data));
        setOpenEdit(false);
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
    <React.Fragment>
      <BootstrapDialog
        open={open}
        onClose={onClose}
        PaperProps={{
          sx: {
            width: "400px",
            height: "81vh",
            maxWidth: "90vw",
          },
        }}
      >
        <div className="flex items-center justify-between px-5 py-2 ">
          <div className="text-[16px] font-[500]">Thông tin tài khoản</div>
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

        <div className="relative mb-10">
          <div className="relative">
            <img
              src={
                previewBackground
                  ? previewBackground
                  : user?.background ||
                    "https://cdn-media.sforum.vn/storage/app/media/ctv_seo3/mau-background-dep-6.jpg"
              }
              alt="background"
              className="h-[170px] w-full object-cover "
            />
            {loadingBackground && (
              <div
                className="overlay  absolute top-0 left-0 w-full h-full
            z-50 bg-[rgba(0,0,0,0.7)] flex items-center justify-center
            cursor-pointer  transition-all opacity-80"
              >
                <CircularProgress size={20} color="inherit" />
              </div>
            )}
          </div>
          {type == "personal" && (
            <BsThreeDots
              className="absolute text-[22px] font-[500] right-5 top-1 cursor-pointer"
              onClick={handleClick}
            />
          )}

          <Menu
            anchorEl={anchorEl}
            open={openMenu}
            onClose={handleClose}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
          >
            <MenuItem
              onClick={() => {
                handleClose();
                fileCoverRef.current.click(); // mở input file
              }}
              sx={{
                fontSize: "14px",
                padding: "4px 10px",
              }}
            >
              Đổi ảnh bìa
            </MenuItem>
            <MenuItem
              onClick={() => {
                handleClose(), handleOpenEdit();
              }}
              sx={{
                fontSize: "14px",
                padding: "4px 10px",
              }}
            >
              Sửa thông tin
            </MenuItem>
          </Menu>

          <input
            type="file"
            accept="image/*"
            ref={fileCoverRef}
            style={{ display: "none" }}
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleUpload(e.target.files[0], "background");
              }
            }}
          />

          <div className="absolute z-50 left-7 bottom-[-60px] flex gap-3 items-center justify-center">
            <div className="relative">
              <img
                src={
                  previewAvatar
                    ? previewAvatar
                    : user?.avatar ||
                      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSsGuNeeq7R_EoWkiZPOvfRF5B0ZSbLCwRAnA&s"
                }
                alt="avatar"
                className="rounded-full w-[80px] border-2"
              />
              {loadingAvatar ? (
                <div
                  className="overlay rounded-full absolute top-0 left-0 w-full h-full
            z-50 bg-[rgba(0,0,0,0.7)] flex items-center justify-center
            cursor-pointer  transition-all opacity-80"
                >
                  <CircularProgress size={20} color="inherit" />
                </div>
              ) : (
                type == "personal" && (
                  <div
                    className="overlay rounded-full absolute top-0 left-0 w-full h-full
            z-50 bg-[rgba(0,0,0,0.7)] flex items-center justify-center
            cursor-pointer opacity-0 transition-all hover:opacity-80"
                  >
                    <MdDriveFolderUpload className="text-white text-[25px]" />
                    <input
                      type="file"
                      accept="image/*"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleUpload(e.target.files[0], "avatar");
                        }
                      }}
                    />
                  </div>
                )
              )}
            </div>
            <div className="pt-3 ">
              <div className=" font-[500] text-[16px]">{user?.name}</div>
              <div className="  text-[14px]">{user?.email}</div>
            </div>
          </div>
        </div>
        <div className="h-1px border-2 mt-7"></div>
        <div className="p-3">
          <div className="text-[16px] py-1 font-[500]">Thông tin cá nhân</div>
          <div className="flex flex-col">
            <div className="flex items-center py-1">
              <div className="w-[100px] text-[15px] text-gray-700">
                Giới tính:
              </div>
              <div className="text-[15px]">
                {user?.gender == "Female" ? "Nữ" : "Nam" || "Chưa xác định"}
              </div>
            </div>
            <div className="flex items-center py-1">
              <div className="w-[100px] text-[15px] text-gray-700">
                Ngày sinh:
              </div>
              <div className="text-[15px]">
                {user?.date_of_birth
                  ? dayjs(user.date_of_birth).format("DD-MM-YYYY")
                  : "Chưa xác định"}
              </div>
            </div>
            <div className="flex items-center py-1">
              <div className="w-[100px] text-[15px] text-gray-700">
                Điện thoại:
              </div>
              <div className="text-[15px]">
                {user?.mobile || "Chưa xác định"}
              </div>
            </div>
          </div>
        </div>

        {type == "personal" && (
          <div className="mt-auto">
            <Divider sx={{ my: 0.2 }} />
            <Button
              fullWidth
              sx={{
                display: "flex",
                gap: 1,

                color: "black",
                transition: "all 0.3s ease-in-out",
                "&:hover": {
                  backgroundColor: "#ff5252",
                  color: "white",
                },
              }}
              onClick={handleOpenEdit}
            >
              <CiEdit className="text-[18px]" />
              Chỉnh sửa
            </Button>
          </div>
        )}
      </BootstrapDialog>

      {openEdit && (
        <BootstrapDialog
          open={openEdit}
          onClose={() => {
            onClose(), setOpenEdit(false);
          }}
          hideBackdrop={true}
          slots={{
            transition: Transition,
          }}
          PaperProps={{
            sx: {
              width: "400px",
              height: "81vh",
              maxWidth: "90vw",
              display: "flex",
              flexDirection: "column",
            },
          }}
        >
          <div style={{ flex: 1, overflowY: "auto" }}>
            <div className="flex items-center justify-between px-5 py-2 ">
              <div className="text-[16px] flex gap-3 items-center font-[500]">
                <MdOutlineArrowBackIosNew
                  onClick={() => setOpenEdit(false)}
                  className="cursor-pointer"
                />
                Chỉnh sửa thông tin cá nhân
              </div>
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
                onClick={() => {
                  onClose(), setOpenEdit(false);
                }}
              >
                <IoClose className="text-[22px] cursor-pointer" />
              </Button>
            </div>
            <Divider sx={{ my: 0.3 }} />
            <div className="p-3 flex flex-col gap-1 text-[15px]">
              Tên hiển thị
              <TextField
                variant="standard"
                name="name"
                value={formData.name}
                size="small"
                fullWidth
                onChange={handleInput}
              />
            </div>
            <div className="p-3">
              <div className="text-[16px] py-1 font-[500]">Thông tin chung</div>
              <div className="flex flex-col">
                <div className="flex items-center py-1">
                  <div className="w-[100px] text-[15px] text-gray-700">
                    Giới tính:
                  </div>
                  <FormControl>
                    <RadioGroup
                      row
                      aria-labelledby="demo-row-radio-buttons-group-label"
                      name="gender"
                      value={formData.gender} // lấy từ state
                      onChange={handleInput}
                    >
                      <FormControlLabel
                        value="Male"
                        control={<Radio color="error" />}
                        label="Nam"
                        sx={{ color: "rgba(0,0,0,0.7)" }}
                      />
                      <FormControlLabel
                        value="Female"
                        control={<Radio color="error" />}
                        label="Nữ"
                        sx={{ color: "rgba(0,0,0,0.7)" }}
                      />
                    </RadioGroup>
                  </FormControl>
                </div>
                <div className="flex items-center py-1">
                  <div className="w-[100px] text-[15px] text-gray-700">
                    Ngày sinh:
                  </div>
                  <input
                    type="date"
                    name="date_of_birth"
                    value={formData.date_of_birth}
                    onChange={handleInput}
                  />
                </div>
                <div className="flex items-center py-3">
                  <div className="w-[100px] text-[15px] text-gray-700">
                    Điện thoại:
                  </div>
                  <TextField
                    variant="standard"
                    value={formData.mobile}
                    size="small"
                    name="mobile"
                    onChange={handleInput}
                  />
                </div>
              </div>
            </div>
          </div>

          <Divider sx={{ my: 0.3 }} />
          <DialogActions>
            <Button onClick={() => setOpenEdit(false)}>Hủy</Button>
            <Button onClick={handleSaveDetail}>Lưu</Button>
          </DialogActions>
        </BootstrapDialog>
      )}
    </React.Fragment>
  );
}
