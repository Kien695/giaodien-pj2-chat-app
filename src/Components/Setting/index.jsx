import * as React from "react";
import Button from "@mui/material/Button";
import { styled } from "@mui/material/styles";
import Dialog from "@mui/material/Dialog";
import { TfiMenuAlt } from "react-icons/tfi";
import IconButton from "@mui/material/IconButton";
import { CiEdit } from "react-icons/ci";
import { TbFlagSearch, TbLogout2 } from "react-icons/tb";
import { IoClose } from "react-icons/io5";
import { FaBoltLightning, FaRegLightbulb } from "react-icons/fa6";
import { AiOutlineSecurityScan } from "react-icons/ai";
import {
  MdFingerprint,
  MdInfoOutline,
  MdLockOpen,
  MdOutlineCleaningServices,
} from "react-icons/md";
import Divider from "@mui/material/Divider";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import {
  Checkbox,
  CircularProgress,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormGroup,
  Radio,
  RadioGroup,
  Switch,
  TextField,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { setTheme, setUseAvatarBg } from "../../redux/themeSlice";
import { toast } from "react-toastify";
import { useState } from "react";
import { deleteData, postData } from "../../utils/api";
import { logout, setUser } from "../../redux/userSlice";
import { useNavigate } from "react-router-dom";
import { socket } from "../../socket";
import {
  browserSupportsWebAuthn,
  startRegistration,
} from "@simplewebauthn/browser";
import { FaRegCheckCircle } from "react-icons/fa";
import { useEffect } from "react";
import PushNotificationSetting from "../PushNotificationSetting";
import DeviceSessionSetting from "../DeviceSessionSetting";
import {
  clearLocalPushSubscription,
  getStoredPushSubscriptionId,
} from "../../utils/pushNotification";
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
      color: theme.palette.primary.contrastText,
      "& + .MuiSwitch-track": {
        backgroundColor: theme.palette.primary.main,
        opacity: 1,
        border: 0,
      },
      "&.Mui-disabled + .MuiSwitch-track": {
        opacity: 0.5,
      },
    },
    "&.Mui-focusVisible .MuiSwitch-thumb": {
      color: theme.palette.primary.main,
      border: `6px solid ${theme.palette.background.paper}`,
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
    backgroundColor: theme.palette.action.disabledBackground,
    opacity: 1,
    transition: theme.transitions.create(["background-color"], {
      duration: 500,
    }),
  },
}));
export default function Setting({ open, onClose }) {
  const dispatch = useDispatch();
  const [active, setActive] = React.useState(1);
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const openMenu = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  //change password
  const [loading, setLoading] = React.useState(false);
  const [formData, setFormData] = useState({
    passwordOld: "",
    passwordNew: "",
    confirmPasswordNew: "",
  });
  const ref = {
    passwordNew: React.useRef(),
    passwordOld: React.useRef(),
    confirmPasswordNew: React.useRef(),
  };
  const handleInput = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  const handleChangePassword = async () => {
    if (loading) return;
    setLoading(true);
    if (!formData.passwordOld) {
      toast.error("Vui lòng nhập mật khẩu hiện tại!");
      ref.passwordOld.current.focus();
      setLoading(false);
      return;
    }
    if (!formData.passwordNew) {
      toast.error("Vui lòng nhập mật khẩu mới");
      ref.passwordNew.current.focus();
      setLoading(false);
      return;
    }
    // Regex password
    const passwordRegex =
      /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=[{\]};:'",.<>/?\\|]).{8,}$/;

    if (!passwordRegex.test(formData.passwordNew)) {
      toast.error(
        "Mật khẩu phải ≥ 8 ký tự, gồm 1 chữ hoa, 1 số và 1 ký tự đặc biệt",
      );
      ref.passwordNew.current.focus();
      setLoading(false);
      return;
    }
    if (formData.confirmPasswordNew !== formData.passwordNew) {
      toast.error("Vui lòng nhập đúng theo yêu cầu");
      ref.confirmPasswordNew.current.focus();
      setLoading(false);
      return;
    }
    try {
      const res = await postData("/auth/change-password", formData);
      if (res.success) {
        toast.success(res.message || "Đổi mật khẩu thành công");
        setFormData({
          passwordOld: "",
          passwordNew: "",
          confirmPasswordNew: "",
        });
      }
    } catch (error) {
      if (error.response) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Không thể kết nối server!");
      }
    } finally {
      setLoading(false);
    }
  };
  //logout
  const handleLogout = async () => {
    try {
      const resLogout = await postData("/auth/logout", {
        pushSubscriptionId: getStoredPushSubscriptionId(),
      });
      if (resLogout.success) {
        await clearLocalPushSubscription().catch(() => {});
        socket.disconnect();
        toast.success("Đăng xuất thành công");
        localStorage.removeItem("accessToken");

        localStorage.removeItem("documentId");
        localStorage.removeItem("useAvatarBg");
        dispatch(logout());
        navigate("/auth");
      }
    } catch (error) {
      if (error.response) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Không thể kết nối server!");
      }
    }
  };
  //dark/mode
  const theme = useSelector((state) => state.theme.mode);

  //userBG
  const useAvatarBg = useSelector((state) => state.theme.useAvatarBg);

  //passkey
  const hasPasskey = useSelector((state) => state.user).hasPasskey;
  const [openGuide, setOpenGuide] = useState(false);
  const [, setOpenPasskeyModal] = useState(false);
  const [passkeyLoading, setPasskeyLoading] = useState(false);
  const [deletePasskey, setDeletePasskey] = useState(false);
  const [checkPassKey, setCheckPasskey] = useState(false);
  const [registerPassKey, setRegisterPassKey] = useState(false);
  const supportsPasskey = browserSupportsWebAuthn();

  useEffect(() => {
    if (hasPasskey) setCheckPasskey(true);
  }, [hasPasskey]);
  const handleRegisterPasskey = async () => {
    try {
      setPasskeyLoading(true);

      // Bước 1: Backend tạo registration options
      const optionResult = await postData("/auth/passkey/register/options");
      if (!optionResult.success) {
        toast.error(
          optionResult.message || "Không thể tạo options đăng ký Passkey",
        );
      }
      const optionsJSON = optionResult.data ?? optionResult;
      // Bước 2: Trình duyệt hiện vân tay, Face ID hoặc mã khóa
      const registrationResponse = await startRegistration({
        optionsJSON,
      });
      // Bước 3: Gửi credential về backend để xác minh và lưu DB
      const verifyResult = await postData("/auth/passkey/register/verify", {
        challengeId: optionsJSON.challengeId,
        credential: registrationResponse,
      });

      if (!verifyResult.success) {
        throw new Error(verifyResult.message || "Đăng ký Passkey thất bại");
      }
      dispatch(
        setUser({
          hasPasskey: true,
        }),
      );
      toast.success("Đăng ký Passkey thành công");
      setCheckPasskey(true);
      setRegisterPassKey(false);
      setOpenPasskeyModal(false);
    } catch (error) {
      if (error.name === "NotAllowedError") {
        toast.info("Bạn đã hủy đăng ký Passkey");
        return;
      }

      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Không thể đăng ký Passkey",
      );
    } finally {
      setPasskeyLoading(false);
    }
  };
  const handleRemovePasskey = async () => {
    try {
      setDeletePasskey(true);
      const res = await deleteData("/auth/passkey/delete");
      if (res.success) {
        dispatch(
          setUser({
            hasPasskey: false,
          }),
        );
        setCheckPasskey(false);
        toast.success("Đã tắt passkey thành công!");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Không thể tắt Passkey",
      );
    } finally {
      setDeletePasskey(false);
    }
  };

  return (
    <React.Fragment>
      <BootstrapDialog
        open={open}
        onClose={onClose}
        PaperProps={{
          sx: {
            width: { xs: "100%", md: "900px" },
            height: { xs: "100%", sm: "min(600px, 90vh)" },
            maxWidth: { xs: "100vw", sm: "90vw" },
            margin: { xs: 0, sm: 4 },
            borderRadius: { xs: 0, sm: "12px" },
            overflow: "hidden",
          },
        }}
      >
        <div className="flex h-full w-full min-w-0 overflow-hidden bg-[var(--surface)] text-[var(--text-primary)] sm:rounded-lg">
          <div className="w-0 shrink-0 overflow-hidden border-r border-[var(--border)] bg-[var(--surface)] md:w-[30%]">
            <div className="py-3 px-4 text-[17px] font-[500]">Cài đặt</div>
            <div
              onClick={() => setActive(1)}
              className={` py-2 px-4 cursor-pointer flex gap-2 items-center font-[500] text-[15px] ${
                 active == 1
                   ? "bg-[var(--surface-active)] text-[var(--primary)]"
                   : "text-[var(--text-secondary)]"
               } hover:bg-[var(--surface-hover)]`}
            >
              <AiOutlineSecurityScan />
              <span>Tài khoản và bảo mật</span>
            </div>
            <div
              onClick={() => setActive(2)}
              className={` py-2 px-4 cursor-pointer flex gap-2 items-center font-[500] text-[15px] ${
                 active == 2
                   ? "bg-[var(--surface-active)] text-[var(--primary)]"
                   : "text-[var(--text-secondary)]"
               } hover:bg-[var(--surface-hover)]`}
            >
              <MdLockOpen />
              <span>Quyền riêng tư</span>
            </div>
            <div
              onClick={() => setActive(3)}
              className={` py-2 px-4 cursor-pointer flex gap-2 items-center font-[500] text-[15px] ${
                 active == 3
                   ? "bg-[var(--surface-active)] text-[var(--primary)]"
                   : "text-[var(--text-secondary)]"
               } hover:bg-[var(--surface-hover)]`}
            >
              <MdOutlineCleaningServices />
              <span>Giao diện</span>
            </div>
            <button
              type="button"
              onClick={() => {
                (setActive(4), setOpenPasskeyModal(true));
              }}
              className={`settings-interactive flex w-full items-center gap-2 px-4 py-2 text-left text-[15px] font-[500] ${
                 active == 4
                   ? "bg-[var(--surface-active)] text-[var(--primary)]"
                   : "text-[var(--text-secondary)]"
               }`}
              disabled={loading || !supportsPasskey}
            >
              <MdFingerprint />
              <span>Thiết lập passkey</span>
            </button>
            <div
              className="flex cursor-pointer items-center gap-2 px-4 py-2 text-[15px] font-[500] text-red-500 hover:bg-[var(--surface-hover)]"
              onClick={handleLogout}
            >
              <TbLogout2 />
              <span>Đăng xuất</span>
            </div>
          </div>
          <div className="flex min-w-0 flex-1 flex-col overflow-hidden bg-[var(--canvas)]">
            <div className="flex min-h-12 min-w-0 items-center justify-between bg-[var(--surface)] md:justify-end">
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
                    (setActive(1), handleClose());
                  }}
                  className={` py-2 px-4 cursor-pointer flex gap-2 items-center font-[500] text-[15px] ${
                    active == 1
                      ? "bg-[var(--surface-active)] text-[var(--primary)]"
                      : "text-[var(--text-secondary)]"
                  } hover:bg-[var(--surface-hover)]`}
                >
                  <AiOutlineSecurityScan />
                  <span>Tài khoản và bảo mật</span>
                </div>

                <div
                  onClick={() => {
                    (setActive(2), handleClose());
                  }}
                  className={` py-2 px-4 cursor-pointer flex gap-2 items-center font-[500] text-[15px] ${
                    active == 2
                      ? "bg-[var(--surface-active)] text-[var(--primary)]"
                      : "text-[var(--text-secondary)]"
                  } hover:bg-[var(--surface-hover)]`}
                >
                  <MdLockOpen />
                  <span>Quyền riêng tư</span>
                </div>

                <div
                  onClick={() => {
                    (setActive(3), handleClose());
                  }}
                  className={` py-2 px-4 cursor-pointer flex gap-2 items-center font-[500] text-[15px] ${
                    active == 3
                      ? "bg-[var(--surface-active)] text-[var(--primary)]"
                      : "text-[var(--text-secondary)]"
                  } hover:bg-[var(--surface-hover)]`}
                >
                  <MdOutlineCleaningServices />
                  <span>Giao diện</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    (setActive(4), handleClose());
                  }}
                  className={`settings-interactive flex w-full items-center gap-2 px-4 py-2 text-left text-[15px] font-[500] ${
                    active == 4
                      ? "bg-[var(--surface-active)] text-[var(--primary)]"
                      : "text-[var(--text-secondary)]"
                  }`}
                  disabled={loading || !supportsPasskey}
                >
                  <MdFingerprint />
                  <span>Thiết lập passkey</span>
                </button>
                <div
                  className="flex cursor-pointer items-center gap-2 px-4 py-2 text-[15px] font-[500] text-red-500 hover:bg-[var(--surface-hover)]"
                  onClick={handleLogout}
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
                ) : active == 3 ? (
                  <div className="font-[500]">Giao diện</div>
                ) : active == 4 ? (
                  <div className="font-[500]">Thiết lập passkey</div>
                ) : null}
              </div>
              <Button
                sx={{
                  color: "var(--text-primary)",
                  transition: "all 0.3s ease-in-out",
                  "&:hover": {
                    backgroundColor: "var(--surface-hover)",
                    color: "error.main",
                  },
                }}
                onClick={onClose}
              >
                <IoClose className="text-[22px] cursor-pointer" />
              </Button>
            </div>
            <Divider />
            <div className="min-w-0 flex-1 overflow-x-hidden overflow-y-auto px-4 py-6">
              {active == 1 && (
                <>
                  <div className="settings-section-title mb-3">
                    Đổi mật khẩu
                  </div>
                  <div className="settings-card flex h-auto w-full min-w-0 flex-col gap-3 overflow-hidden rounded-lg p-3">
                    <div className="settings-muted break-words text-[13px] italic">
                      Ghi chú: Mật khẩu phải ≥ 8 ký tự, gồm 1 chữ hoa, 1 số và 1
                      ký tự đặc biệt
                    </div>
                    <div className="flex flex-col gap-2">
                      <div className="text-[13px]">Mật khẩu hiện tại: </div>
                      <TextField
                        type="password"
                        name="passwordOld"
                        size="small"
                        label="Mật khẩu hiện tại"
                        variant="outlined"
                        inputRef={ref.passwordOld}
                        onChange={handleInput}
                      />
                    </div>

                    <Divider />
                    <div className="flex flex-col gap-2">
                      <div className="text-[13px]">Mật khẩu mới: </div>
                      <TextField
                        type="password"
                        name="passwordNew"
                        size="small"
                        label="Mật khẩu mới"
                        variant="outlined"
                        inputRef={ref.passwordNew}
                        onChange={handleInput}
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <div className="text-[13px]">Xác nhận mật khẩu mới: </div>
                      <TextField
                        type="password"
                        name="confirmPasswordNew"
                        size="small"
                        label="Xác nhận mật khẩu mới"
                        variant="outlined"
                        inputRef={ref.confirmPasswordNew}
                        onChange={handleInput}
                      />
                    </div>
                    <div className="py-2 px-4 flex justify-end gap-2">
                      <Button
                        variant="outlined"
                        sx={{ textTransform: "none" }}
                      >
                        Hủy
                      </Button>
                      <Button
                        variant="contained"
                        disabled={loading}
                        sx={{
                          textTransform: "none",
                        }}
                        onClick={handleChangePassword}
                      >
                        {loading ? (
                          <div className="flex gap-2">
                            <CircularProgress size={20} color="inherit" /> Đang
                            xử lí...
                          </div>
                        ) : (
                          "Cập nhật"
                        )}
                      </Button>
                    </div>
                  </div>
                  <DeviceSessionSetting enabled={open && active == 1} />
                </>
              )}
              {active == 2 && (
                <>
                  <PushNotificationSetting switchComponent={IOSSwitch} />
                  <div className="settings-section-title mb-3 mt-5">
                    Cá nhân
                  </div>
                  <div className="settings-card flex h-auto w-full flex-col gap-1 rounded-lg p-3">
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
                  <div className="settings-section-title mb-3 mt-5">
                    Nguồn tìm kiếm
                  </div>
                  <div className="settings-card flex h-auto w-full flex-col gap-1 rounded-lg p-3">
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
                  <div className="settings-section-title mb-3">
                    Giao diện hiển thị
                  </div>
                  <div className="settings-card flex h-auto w-full flex-col gap-1 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <FormControl>
                        <RadioGroup
                          value={theme}
                          row
                          sx={{ gap: 4 }}
                          onChange={(event) =>
                            dispatch(setTheme(event.target.value))
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
                              <div className="h-[50px] w-[50px] rounded-2xl border-2 border-blue-700 bg-gray-100"></div>
                            }
                          />
                        </RadioGroup>
                      </FormControl>
                    </div>
                  </div>
                  <div className="settings-card mt-5 h-auto w-full rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div className="text-[14px]">
                        Cho phép dùng avatar làm ảnh nền khung chat:
                      </div>
                      <FormControlLabel
                        control={
                          <IOSSwitch
                            sx={{ m: 1 }}
                            checked={useAvatarBg}
                            onChange={(e) =>
                              dispatch(setUseAvatarBg(e.target.checked))
                            }
                          />
                        }
                      />
                    </div>
                  </div>
                </>
              )}
              {active == 4 && (
                <>
                  <div className="settings-section-title mb-3 text-[15px]">
                    Thiết lập Passkey
                  </div>

                  <div className="settings-card rounded-2xl p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex gap-4">
                        <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                            hasPasskey
                              ? "bg-green-100 text-green-600 dark:bg-green-950 dark:text-green-300"
                              : "bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-300"
                          }`}
                        >
                          <MdFingerprint size={26} />
                        </div>

                        <div>
                          <h3 className="font-semibold text-[var(--text-primary)]">
                            Đăng nhập bằng Passkey
                          </h3>

                          <p className="settings-muted mt-1 max-w-md text-sm">
                            Đăng nhập nhanh bằng vân tay, Face ID hoặc Windows
                            Hello mà không cần nhập mật khẩu.
                          </p>

                          <div className="mt-3">
                            {hasPasskey ? (
                              <span className="inline-flex items-center gap-2 rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700 dark:bg-green-950 dark:text-green-300">
                                <FaRegCheckCircle size={16} />
                                Đã bật Passkey
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-2 rounded-full bg-[var(--disabled-surface)] px-3 py-1 text-sm font-medium text-[var(--muted)]">
                                Chưa thiết lập
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <IOSSwitch
                        checked={checkPassKey}
                        onChange={(e) => {
                          setCheckPasskey(e.target.checked);
                          setRegisterPassKey(e.target.checked);
                        }}
                        disabled={hasPasskey}
                      />
                    </div>

                    {registerPassKey && (
                      <div className="mt-6 flex justify-end">
                        <Button
                          variant="contained"
                          onClick={handleRegisterPasskey}
                          disabled={passkeyLoading}
                        >
                          {passkeyLoading ? (
                            <>
                              <CircularProgress size={18} color="inherit" />
                              <span className="ml-2">Đang đăng ký...</span>
                            </>
                          ) : (
                            "Đăng ký Passkey"
                          )}
                        </Button>
                      </div>
                    )}

                    {hasPasskey && (
                      <>
                        <div className="mt-6 flex flex-col items-center justify-between gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 dark:border-green-800 dark:bg-green-950/60">
                          <div>
                            <div className="font-medium text-green-700 dark:text-green-300">
                              Passkey đang hoạt động
                            </div>
                            <div className="text-sm text-green-600 dark:text-green-400">
                              Bạn có thể đăng nhập bằng Face ID, vân tay hoặc
                              Windows Hello.
                            </div>
                          </div>

                          <div className="flex flex-wrap justify-end gap-3">
                            <Button
                              variant="outlined"
                              color="error"
                              onClick={handleRemovePasskey}
                              size="small"
                              sx={{ textTransform: "none" }}
                              disabled={deletePasskey}
                            >
                              {deletePasskey ? (
                                <span className="flex items-center gap-2">
                                  <CircularProgress size={20} color="inherit" />
                                  Đang xử lý...
                                </span>
                              ) : (
                                "Tắt Passkey"
                              )}
                            </Button>
                            <Button
                              size="small"
                              startIcon={<MdInfoOutline />}
                              sx={{ textTransform: "none" }}
                              onClick={() => setOpenGuide(true)}
                            >
                              <span className="hidden sm:inline">
                                Xem hướng dẫn sau khi tắt Passkey
                              </span>

                              <span className="inline sm:hidden">
                                Hướng dẫn
                              </span>
                            </Button>
                            <Dialog
                              open={openGuide}
                              onClose={() => setOpenGuide(false)}
                              maxWidth="sm"
                              fullWidth
                            >
                              <DialogTitle>
                                Hướng dẫn sau khi tắt Passkey
                              </DialogTitle>

                              <DialogContent dividers>
                                <div className="space-y-5 text-sm text-[var(--text-secondary)]">
                                  <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3 dark:border-yellow-800 dark:bg-yellow-950/60">
                                    <p className="font-medium text-yellow-800 dark:text-yellow-300">
                                      Sau khi tắt Passkey
                                    </p>

                                    <p className="mt-2">
                                      Passkey sẽ bị xóa khỏi tài khoản của bạn
                                      và không thể dùng để đăng nhập nữa.
                                    </p>

                                    <p className="mt-2">
                                      Tuy nhiên Passkey có thể vẫn còn được lưu
                                      trên thiết bị của bạn (Windows Hello,
                                      Google Password Manager hoặc iCloud
                                      Keychain).
                                    </p>
                                  </div>

                                  <div>
                                    <h4 className="font-semibold">
                                      Nếu muốn đăng ký lại trên cùng thiết bị
                                    </h4>

                                    <ol className="mt-2 list-decimal space-y-2 pl-5">
                                      <li>
                                        Mở trình quản lý Passkey trên thiết bị.
                                      </li>
                                      <li>Tìm Passkey của website này.</li>
                                      <li>Xóa Passkey cũ.</li>
                                      <li>
                                        Quay lại ứng dụng và đăng ký Passkey
                                        mới.
                                      </li>
                                    </ol>
                                  </div>

                                  <ul>
                                    <li className="flex gap-2 rounded-lg bg-blue-50 p-3 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                                      <FaRegLightbulb className="w-7 items-center justify-between text-yellow-500" />
                                      Nếu bạn không đăng ký lại Passkey thì
                                      không cần xóa Passkey trên thiết bị.
                                      Passkey cũ sẽ không thể đăng nhập vì đã bị
                                      vô hiệu hóa trên máy chủ.
                                    </li>
                                  </ul>
                                </div>
                              </DialogContent>

                              <DialogActions>
                                <Button
                                  sx={{ textTransform: "none" }}
                                  onClick={() => setOpenGuide(false)}
                                >
                                  Đã hiểu
                                </Button>
                              </DialogActions>
                            </Dialog>
                          </div>
                        </div>

                        {/* Hướng dẫn */}
                        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/60">
                          <div className="flex items-start gap-3">
                            <div className="mt-0.5 text-xl text-amber-600 dark:text-amber-400">
                              <FaBoltLightning />
                            </div>

                            <div>
                              <h4 className="font-semibold text-amber-800 dark:text-amber-300">
                                Lưu ý khi tắt Passkey
                              </h4>

                              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-amber-700 dark:text-amber-400">
                                <li>
                                  Passkey sẽ bị gỡ khỏi tài khoản của bạn và
                                  không thể dùng để đăng nhập nữa.
                                </li>
                                <li>
                                  Passkey có thể vẫn còn được lưu trên thiết bị
                                  (Windows, Google Password Manager hoặc iCloud
                                  Keychain).
                                </li>
                                <li>
                                  Nếu sau này muốn đăng ký lại trên cùng thiết
                                  bị nhưng gặp lỗi, hãy xóa Passkey cũ trong
                                  trình quản lý Passkey của thiết bị rồi thử
                                  lại.
                                </li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
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
