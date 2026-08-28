import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  TextField,
  Typography,
} from "@mui/material";
import QRCode from "react-qr-code";
import { Link, useNavigate } from "react-router-dom";
import { useRef, useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { MdFingerprint } from "react-icons/md";

//toastyfy
import { toast } from "react-toastify";
import { postData } from "../../utils/api";
import { useDispatch } from "react-redux";
import { setLogin } from "../../redux/userSlice";
import { socket } from "../../socket";
import { startAuthentication } from "@simplewebauthn/browser";
import QRDialog from "../../Components/QRDialog";
import useIsMobile from "../../Components/IsMobile";
export function Auth() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);

  const isMobile = useIsMobile();

  //register
  const [formRegister, setFormRegister] = useState({
    name: "",
    email: "",
    password: "",
  });
  const inputRefRegister = {
    name: useRef(),
    email: useRef(),
    password: useRef(),
  };
  const handleInputRegister = (e) => {
    const { name, value } = e.target;
    setFormRegister((prev) => ({ ...prev, [name]: value }));
  };
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    if (!formRegister.name) {
      toast.error("Vui lòng nhập họ tên!");
      inputRefRegister.name.current.focus();
      setLoading(false);
      return;
    }
    if (!formRegister.email) {
      toast.error("Vui lòng nhập email!");
      inputRefRegister.email.current.focus();
      setLoading(false);
      return;
    }
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formRegister.email)) {
      toast.error("Email không đúng định dạng!");
      inputRefRegister.email.current.focus();
      setLoading(false);
      return;
    }
    if (!formRegister.password) {
      toast.error("Vui lòng nhập mật khẩu!");
      inputRefRegister.name.current.focus();
      setLoading(false);
      return;
    }
    // Regex password
    const passwordRegex =
      /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=[{\]};:'",.<>/?\\|]).{8,}$/;

    if (!passwordRegex.test(formRegister.password)) {
      toast.error(
        "Mật khẩu phải ≥ 8 ký tự, gồm 1 chữ hoa, 1 số và 1 ký tự đặc biệt",
      );
      inputRefRegister.password.current.focus();
      setLoading(false);
      return;
    }
    try {
      const res = await postData("/auth/register", formRegister);
      if (res.success) {
        toast.success(
          "Đăng kí thành công. Vui lòng nhập OTP để xác thực email của bạn!",
        );
        localStorage.setItem("userEmail", formRegister.email);
        setFormRegister({ name: "", email: "", password: "" });
        navigate("/verify");
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
  //login
  const [formLogin, setFormLogin] = useState({
    email: "",
    password: "",
  });
  const inputRefLogin = {
    email: useRef(),
    password: useRef(),
  };
  const handleInputLogin = (e) => {
    const { name, value } = e.target;
    setFormLogin((prev) => ({ ...prev, [name]: value }));
  };
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    if (!formLogin.email) {
      toast.error("Vui lòng nhập email!");
      inputRefLogin.email.current.focus();
      setLoading(false);
      return;
    }
    if (!formLogin.password) {
      toast.error("Vui lòng nhập mật khẩu!");
      inputRefLogin.password.current.focus();
      setLoading(false);
      return;
    }
    try {
      const res = await postData("/auth/login", formLogin);
      if (res.success) {
        toast.success("Đăng nhập thành công!");
        localStorage.setItem("accessToken", res?.data?.accessToken);
        socket.auth = {
          token: res.data.accessToken,
        };

        socket.connect();
        localStorage.setItem("documentId", res?.data?.documentId);
        localStorage.setItem("theme", "light");
        setFormLogin({ email: "", password: "" });
        dispatch(setLogin(true));
        navigate("/chat");
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
  //forgot-password
  const handleClickForgot = async () => {
    if (!formLogin.email) {
      toast.error("Vui lòng nhập email!");
      inputRefLogin.email.current.focus();
      return;
    }
    try {
      const res = await postData("/auth/forgot-password", {
        email: formLogin.email,
      });
      if (res.success) {
        toast.success("Vui lòng nhập OTP để đổi mật khẩu!");
        localStorage.setItem("userEmail", formLogin.email);
        localStorage.setItem("actionType", "forgot-password");
        navigate("/verify");
      }
    } catch (error) {
      if (error.response) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Không thể kết nối server!");
      }
    }
  };

  //login with passkey
  const [passkeyLoading, setPasskeyLoading] = useState(false);
  const handleLoginPasskey = async () => {
    try {
      setPasskeyLoading(true);

      const optionResponse = await postData("/auth/passkey/login/options");
      if (!optionResponse.success) {
        toast.error(
          optionResponse.message || "Không thể đăng nhập bằng Passkey!",
        );
        setPasskeyLoading(false);
        return;
      }

      // 2. Hiện giao diện vân tay, Face ID hoặc mã khóa
      const authenticationResponse = await startAuthentication({
        optionsJSON: optionResponse,
      });

      // 3. Gửi kết quả về backend để xác minh

      const verifyResponse = await postData("/auth/passkey/login/verify", {
        challengeId: optionResponse.challengeId,
        credential: authenticationResponse,
      });

      if (!verifyResponse.success) {
        toast.error(
          verifyResponse.message || "Xác thực Passkey không thành công",
        );
      }
      toast.success("Đăng nhập thành công");
      localStorage.setItem("accessToken", verifyResponse?.data?.accessToken);
      socket.auth = {
        token: verifyResponse.data.accessToken,
      };

      socket.connect();
      localStorage.setItem("documentId", verifyResponse?.data?.documentId);
      localStorage.setItem("theme", "light");

      dispatch(setLogin(true));
      navigate("/chat");
    } catch (error) {
      if (error.name === "NotAllowedError") {
        toast.error("Bạn đã hủy xác thực Passkey");
        return;
      }

      toast.error(error.response.data.message || "Đăng nhập Passkey thất bại");
    } finally {
      setPasskeyLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#eef3f9] px-4 ">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-500/10 blur-3xl" />
      </div>

      <section className="relative grid w-full max-w-5xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl lg:grid-cols-2">
        {/* Phần giới thiệu */}
        <div className="relative hidden overflow-hidden bg-gradient-to-br from-[#005ae0] via-[#0068ff] to-[#39a0ff] p-8 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="absolute -right-20 -top-20 h-50 w-20 rounded-full bg-white/10" />
          <div className="absolute -bottom-24 -left-24 h-42 w-20 rounded-full bg-black/10" />

          <div className="relative z-10">
            <div className="mb-12 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 text-xl font-bold shadow-lg backdrop-blur">
                CT
              </div>

              <div>
                <h1 className="text-xl font-bold">Chat Together</h1>
                <p className="text-sm text-blue-100">
                  Kết nối mọi người dễ dàng hơn
                </p>
              </div>
            </div>

            <h2 className="max-w-md text-4xl font-bold leading-tight">
              Trò chuyện, chia sẻ và kết nối mọi lúc
            </h2>

            <p className="mt-5 max-w-md leading-7 text-blue-50">
              Đăng nhập để tiếp tục cuộc trò chuyện với bạn bè và những người
              quan trọng.
            </p>
          </div>

          <div className="relative z-10 rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur-md">
            <p className="text-sm leading-6 text-white/90">
              Đăng nhập nhanh hơn bằng Passkey. Không cần ghi nhớ mật khẩu, chỉ
              cần vân tay, khuôn mặt hoặc mã khóa thiết bị.
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="flex min-h-[450] flex-col justify-center bg-white px-6 py-8 sm:px-10 lg:px-12">
          <div className="mb-6">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-xl font-bold text-blue-600 lg:hidden">
              CT
            </div>

            <h2 className="text-3xl font-bold text-slate-900">
              {isLogin ? "Chào mừng trở lại" : "Tạo tài khoản mới"}
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              {isLogin
                ? "Đăng nhập để tiếp tục cuộc trò chuyện."
                : "Điền thông tin bên dưới để bắt đầu."}
            </p>
          </div>

          {/* Tab chuyển đổi */}
          <div className="mb-6 grid grid-cols-2 rounded-xl bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => setIsLogin(true)}
              className={`rounded-lg px-4 py-2.5 text-sm font-semibold transition-all duration-300 ${
                isLogin
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Đăng nhập
            </button>

            <button
              type="button"
              onClick={() => setIsLogin(false)}
              className={`rounded-lg px-4 py-2.5 text-sm font-semibold transition-all duration-300 ${
                !isLogin
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Đăng ký
            </button>
          </div>

          {isLogin ? (
            <div className="flex flex-col gap-4">
              <form
                onSubmit={handleLoginSubmit}
                className="flex flex-col gap-3"
              >
                <TextField
                  fullWidth
                  name="email"
                  size="small"
                  label="Email"
                  type="email"
                  variant="outlined"
                  inputRef={inputRefLogin.email}
                  onChange={handleInputLogin}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "12px",
                    },
                  }}
                />

                <TextField
                  fullWidth
                  name="password"
                  size="small"
                  label="Mật khẩu"
                  type="password"
                  variant="outlined"
                  inputRef={inputRefLogin.password}
                  onChange={handleInputLogin}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "12px",
                    },
                  }}
                />

                <div
                  className={`flex ${!isMobile ? "justify-between px-3" : "justify-end"}`}
                >
                  {!isMobile && <QRDialog />}

                  <button
                    type="button"
                    onClick={handleClickForgot}
                    className="text-[13px] font-medium text-slate-500 transition hover:text-blue-600"
                  >
                    Quên mật khẩu?
                  </button>
                </div>
                <Button
                  fullWidth
                  variant="contained"
                  disabled={loading}
                  type="submit"
                  sx={{
                    minHeight: 44,
                    borderRadius: "12px",
                    textTransform: "none",
                    fontWeight: 600,
                    fontSize: "15px",
                    boxShadow: "none",
                    background:
                      "linear-gradient(135deg, #ef4444 0%, #f97316 100%)",
                    "&:hover": {
                      boxShadow: "0 10px 25px rgba(239, 68, 68, 0.25)",
                      background:
                        "linear-gradient(135deg, #dc2626 0%, #ea580c 100%)",
                    },
                  }}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <CircularProgress size={20} color="inherit" />
                      Đang xử lý...
                    </span>
                  ) : (
                    "Đăng nhập"
                  )}
                </Button>
              </form>
            </div>
          ) : (
            <form
              onSubmit={handleRegisterSubmit}
              className="flex flex-col gap-4"
            >
              <TextField
                fullWidth
                size="small"
                name="name"
                label="Họ và tên"
                variant="outlined"
                inputRef={inputRefRegister.name}
                onChange={handleInputRegister}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "12px",
                  },
                }}
              />

              <TextField
                fullWidth
                size="small"
                name="email"
                label="Email"
                type="email"
                variant="outlined"
                inputRef={inputRefRegister.email}
                onChange={handleInputRegister}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "12px",
                  },
                }}
              />

              <TextField
                fullWidth
                size="small"
                name="password"
                label="Mật khẩu"
                type="password"
                variant="outlined"
                inputRef={inputRefRegister.password}
                onChange={handleInputRegister}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "12px",
                  },
                }}
              />

              <Button
                fullWidth
                variant="contained"
                disabled={loading}
                type="submit"
                sx={{
                  minHeight: 44,
                  borderRadius: "12px",
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "15px",
                  boxShadow: "none",
                  background:
                    "linear-gradient(135deg, #ef4444 0%, #f97316 100%)",
                  "&:hover": {
                    boxShadow: "0 10px 25px rgba(239, 68, 68, 0.25)",
                    background:
                      "linear-gradient(135deg, #dc2626 0%, #ea580c 100%)",
                  },
                }}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <CircularProgress size={20} color="inherit" />
                    Đang xử lý...
                  </span>
                ) : (
                  "Đăng ký"
                )}
              </Button>
            </form>
          )}

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-200" />
            <span className="text-xs font-medium text-slate-400">
              HOẶC TIẾP TỤC VỚI
            </span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {/* Google */}
            <Button
              fullWidth
              variant="outlined"
              onClick={() => {
                window.open(
                  `${import.meta.env.VITE_SOCKET_URL}/auth/google`,
                  "_self",
                );
              }}
              sx={{
                minHeight: 44,
                borderRadius: "12px",
                borderColor: "#e2e8f0",
                color: "#334155",
                textTransform: "none",
                fontWeight: 600,
                "&:hover": {
                  borderColor: "#cbd5e1",
                  backgroundColor: "#f8fafc",
                },
              }}
            >
              <span className="flex items-center gap-2">
                <FcGoogle className="text-xl" />
                Google
              </span>
            </Button>

            {/* Passkey */}
            <Button
              fullWidth
              variant="outlined"
              disabled={passkeyLoading}
              onClick={handleLoginPasskey}
              sx={{
                minHeight: 44,
                borderRadius: "12px",
                borderColor: "#e2e8f0",
                color: "#334155",
                textTransform: "none",
                fontWeight: 600,
                "&:hover": {
                  borderColor: "#cbd5e1",
                  backgroundColor: "#f8fafc",
                },
              }}
            >
              {passkeyLoading ? (
                <span className="flex items-center gap-2">
                  <CircularProgress size={18} color="inherit" />
                  Đang xác thực...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <MdFingerprint className="text-2xl text-blue-600" />
                  Passkey
                </span>
              )}
            </Button>
          </div>

          {isLogin && (
            <p className="mt-3 text-center text-xs leading-2 text-slate-400">
              Passkey sử dụng vân tay, Face ID hoặc mã khóa màn hình trên thiết
              bị của bạn.
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
