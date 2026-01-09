import * as React from "react";
import Button from "@mui/material/Button";
import { styled } from "@mui/material/styles";
import Dialog from "@mui/material/Dialog";
import { TfiMenuAlt } from "react-icons/tfi";
import IconButton from "@mui/material/IconButton";
import { CiEdit } from "react-icons/ci";
import { TbLogout2 } from "react-icons/tb";
import { IoClose } from "react-icons/io5";
import { AiOutlineSecurityScan } from "react-icons/ai";
import { MdLockOpen, MdOutlineCleaningServices } from "react-icons/md";
import Divider from "@mui/material/Divider";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import {
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  Radio,
  RadioGroup,
  Switch,
  TextField,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { setTheme } from "../../redux/themeSlice";
const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialogContent-root": {
    padding: theme.spacing(2),
  },
  "& .MuiDialogActions-root": {
    padding: theme.spacing(1),
  },
}));
const IOSSwitch = styled((props) => (
  <Switch focusVisibleClassName=".Mui-focusVisible" disableRipple {...props} />
))(({ theme }) => ({
  width: 42,
  height: 26,
  padding: 0,
  "& .MuiSwitch-switchBase": {
    padding: 0,
    margin: 2,
    transitionDuration: "300ms",
    "&.Mui-checked": {
      transform: "translateX(16px)",
      color: "#fff",
      "& + .MuiSwitch-track": {
        backgroundColor: "#005AE0",
        opacity: 1,
        border: 0,
        ...theme.applyStyles("dark", {
          backgroundColor: "#2ECA45",
        }),
      },
      "&.Mui-disabled + .MuiSwitch-track": {
        opacity: 0.5,
      },
    },
    "&.Mui-focusVisible .MuiSwitch-thumb": {
      color: "#33cf4d",
      border: "6px solid #fff",
    },
    "&.Mui-disabled .MuiSwitch-thumb": {
      color: theme.palette.grey[100],
      ...theme.applyStyles("dark", {
        color: theme.palette.grey[600],
      }),
    },
    "&.Mui-disabled + .MuiSwitch-track": {
      opacity: 0.7,
      ...theme.applyStyles("dark", {
        opacity: 0.3,
      }),
    },
  },
  "& .MuiSwitch-thumb": {
    boxSizing: "border-box",
    width: 22,
    height: 22,
  },
  "& .MuiSwitch-track": {
    borderRadius: 26 / 2,
    backgroundColor: "#E9E9EA",
    opacity: 1,
    transition: theme.transitions.create(["background-color"], {
      duration: 500,
    }),
    ...theme.applyStyles("dark", {
      backgroundColor: "#39393D",
    }),
  },
}));
export default function Setting({ open, onClose }) {
  const [active, setActive] = React.useState(1);

  const [anchorEl, setAnchorEl] = React.useState(null);
  const openMenu = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  //dark/mode
  const theme = useSelector((state) => state.theme.mode);
  const dispatch = useDispatch();

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
        <div className="flex h-full rounded-lg">
          <div className="w-[0] md:w-[30%] border-r">
            <div className="py-3 px-4 text-[17px] font-[500]">Cài đặt</div>
            <div
              onClick={() => setActive(1)}
              className={` py-2 px-4 cursor-pointer flex gap-2 items-center font-[500] text-[15px] ${
                active == 1 ? "text-[#ff5252]" : "text-black"
              } hover:bg-gray-200`}
            >
              <AiOutlineSecurityScan />
              <span>Tài khoản và bảo mật</span>
            </div>
            <div
              onClick={() => setActive(2)}
              className={` py-2 px-4 cursor-pointer flex gap-2 items-center font-[500] text-[15px] ${
                active == 2 ? "text-[#ff5252]" : "text-black"
              } hover:bg-gray-200`}
            >
              <MdLockOpen />
              <span>Quyền riêng tư</span>
            </div>
            <div
              onClick={() => setActive(3)}
              className={` py-2 px-4 cursor-pointer flex gap-2 items-center font-[500] text-[15px] ${
                active == 3 ? "text-[#ff5252]" : "text-black"
              } hover:bg-gray-200`}
            >
              <MdOutlineCleaningServices />
              <span>Giao diện</span>
            </div>
            <div
              className=" py-2 px-4 cursor-pointer flex gap-2 items-center font-[500] text-[15px]
              text-black
               hover:bg-gray-200"
            >
              <TbLogout2 />
              <span>Đăng xuất</span>
            </div>
          </div>
          <div className="flex-1 flex flex-col bg-gray-100">
            <div className=" flex items-center justify-between  md:justify-end ">
              <div
                aria-controls={openMenu ? "demo-positioned-menu" : undefined}
                aria-haspopup="true"
                aria-expanded={openMenu ? "true" : undefined}
                onClick={handleClick}
              >
                <TfiMenuAlt className="ml-3 text-[20px] md:hidden" />
              </div>
              <Menu
                id="demo-positioned-menu"
                aria-labelledby="demo-positioned-button"
                anchorEl={anchorEl}
                open={openMenu}
                onClose={handleClose}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "right",
                }}
                transformOrigin={{
                  vertical: "top",
                  horizontal: "left",
                }}
              >
                <div
                  onClick={() => {
                    setActive(1), handleClose();
                  }}
                  className={` py-2 px-4 cursor-pointer flex gap-2 items-center font-[500] text-[15px] ${
                    active == 1 ? "text-[#ff5252]" : "text-black"
                  } hover:bg-gray-200`}
                >
                  <AiOutlineSecurityScan />
                  <span>Tài khoản và bảo mật</span>
                </div>

                <div
                  onClick={() => {
                    setActive(2), handleClose();
                  }}
                  className={` py-2 px-4 cursor-pointer flex gap-2 items-center font-[500] text-[15px] ${
                    active == 2 ? "text-[#ff5252]" : "text-black"
                  } hover:bg-gray-200`}
                >
                  <MdLockOpen />
                  <span>Quyền riêng tư</span>
                </div>

                <div
                  onClick={() => {
                    setActive(3), handleClose();
                  }}
                  className={` py-2 px-4 cursor-pointer flex gap-2 items-center font-[500] text-[15px] ${
                    active == 3 ? "text-[#ff5252]" : "text-black"
                  } hover:bg-gray-200`}
                >
                  <MdOutlineCleaningServices />
                  <span>Giao diện</span>
                </div>

                <div
                  className=" py-2 px-4 cursor-pointer flex gap-2 items-center font-[500] text-[15px]
              text-black
               hover:bg-gray-200"
                >
                  <TbLogout2 />
                  <span>Đăng xuất</span>
                </div>
              </Menu>
              <div className="md:hidden">
                {active == 1 ? (
                  <div className="font-[500]">Tài khoản và bảo mật</div>
                ) : active == 2 ? (
                  <div className="font-[500]">Quyền riêng tư</div>
                ) : (
                  <div className="font-[500]">Giao diện</div>
                )}
              </div>
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
            <Divider />
            <div className="px-4 py-6">
              {active == 1 && (
                <>
                  <div className="text-[14px] font-[500] text-gray-700 mb-3">
                    Đổi mật khẩu
                  </div>
                  <div className="w-full h-auto rounded-lg bg-white p-3 flex flex-col gap-3 shadow-md">
                    <div className="text-[13px] italic">
                      Ghi chú: Mật khẩu tối đa 8 kí tự
                    </div>
                    <div className="flex flex-col gap-2">
                      <div className="text-[13px]">Mật khẩu hiện tại: </div>
                      <TextField
                        name="password"
                        size="small"
                        label="Mật khẩu hiện tại"
                        variant="outlined"
                      />
                    </div>

                    <Divider />
                    <div className="flex flex-col gap-2">
                      <div className="text-[13px]">Mật khẩu mới: </div>
                      <TextField
                        name="password"
                        size="small"
                        label="Mật khẩu mới"
                        variant="outlined"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <div className="text-[13px]">Xác nhận mật khẩu mới: </div>
                      <TextField
                        name="password"
                        size="small"
                        label="Xác nhận mật khẩu mới"
                        variant="outlined"
                      />
                    </div>
                    <div className="py-2 px-4 flex justify-end gap-2">
                      <Button
                        variant="contained"
                        sx={{
                          textTransform: "none",
                          backgroundColor: "gray",
                          color: "#fff",
                        }}
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
                        Cập nhật
                      </Button>
                    </div>
                  </div>
                </>
              )}
              {active == 2 && (
                <>
                  <div className="text-[14px] font-[500] text-gray-700 mb-3">
                    Cá nhân
                  </div>
                  <div className="w-full h-auto rounded-lg bg-white p-3 flex flex-col gap-1 shadow-md">
                    <div className="flex items-center justify-between">
                      <div className="text-[14px]">Hiện thị ngày sinh: </div>
                      <FormControlLabel
                        control={<IOSSwitch sx={{ m: 1 }} defaultChecked />}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-[14px]">Trạng thái truy cập: </div>
                      <FormControlLabel
                        control={<IOSSwitch sx={{ m: 1 }} defaultChecked />}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-[14px]">
                        Hiện trạng thái "Đã xem":
                      </div>
                      <FormControlLabel
                        control={<IOSSwitch sx={{ m: 1 }} defaultChecked />}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-[14px]">Trạng thái hoạt động:</div>
                      <FormControlLabel
                        control={<IOSSwitch sx={{ m: 1 }} defaultChecked />}
                      />
                    </div>
                  </div>
                  <div className="text-[14px] font-[500] text-gray-700 mb-3 mt-5">
                    Nguồn tìm kiếm
                  </div>
                  <div className="w-full h-auto rounded-lg bg-white p-3 flex flex-col gap-1 shadow-md">
                    <div className="flex items-center justify-between">
                      <div className="text-[14px]">
                        Cho phép người lạ tìm kiếm qua số điện thoại:
                      </div>
                      <FormControlLabel
                        control={<IOSSwitch sx={{ m: 1 }} defaultChecked />}
                      />
                    </div>
                  </div>
                </>
              )}
              {active == 3 && (
                <>
                  <div className="text-[14px] font-[500] text-gray-700 mb-3">
                    Giao diện hiển thị
                  </div>
                  <div className="w-full h-auto rounded-lg bg-white p-3 flex flex-col gap-1 shadow-md">
                    <div className="flex items-center justify-between">
                      <FormControl>
                        <RadioGroup
                          value={theme}
                          row
                          sx={{ gap: 4 }}
                          onClick={() =>
                            dispatch(
                              setTheme(theme === "light" ? "dark" : "light")
                            )
                          }
                        >
                          <FormControlLabel
                            value="dark"
                            control={<Radio />}
                            label={
                              <div className="w-[50px] h-[50px] bg-[#16191d] border-2 border-blue-800 rounded-2xl"></div>
                            }
                          />
                          <FormControlLabel
                            value="light"
                            control={<Radio />}
                            label={
                              <div className="w-[50px] h-[50px] bg-gray-100 border-2 border-blue-800 rounded-2xl"></div>
                            }
                          />
                        </RadioGroup>
                      </FormControl>
                    </div>
                  </div>
                  <div className="w-full h-auto rounded-lg bg-white p-3 mt-5 shadow-md">
                    <div className="flex items-center justify-between">
                      <div className="text-[14px]">
                        Cho phép dùng avatar làm ảnh nền khung chat:
                      </div>
                      <FormControlLabel
                        control={<IOSSwitch sx={{ m: 1 }} defaultChecked />}
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </BootstrapDialog>
    </React.Fragment>
  );
}
