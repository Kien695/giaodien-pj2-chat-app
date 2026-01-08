import { Button, CircularProgress, TextField } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { useRef, useState } from "react";
import { FcGoogle } from "react-icons/fc";
//toastyfy
import { toast } from "react-toastify";
import { postData } from "../../utils/api";
import { useDispatch } from "react-redux";
import { setLogin } from "../../redux/userSlice";

export function Auth() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
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
      inputRefRegister.name.current.focus();
      setLoading(false);
      return;
    }
    if (!formRegister.password) {
      toast.error("Vui lòng nhập mật khẩu!");
      inputRefRegister.name.current.focus();
      setLoading(false);
      return;
    }
    try {
      const res = await postData("/auth/register", formRegister);
      if (res.success) {
        toast.success(
          "Đăng kí thành công. Vui lòng nhập OTP để xác thực email của bạn!"
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
        localStorage.setItem("refreshToken", res?.data?.refreshToken);
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

  return (
    <div className="w-[100vw] h-[100vh] flex flex-col gap-4 items-center justify-center bg-gray-100">
      <div className="flex flex-col items-center">
        <div className="font-[800] text-gray-700 text-[33px] italic">
          XIN CHÀO!
        </div>
        <div className="text-[16px] text-gray-600">
          Vui lòng đăng nhập để tiếp tục cuộc trò chuyện!
        </div>
      </div>
      <div className="w-[75vw] min-h-[70vh] md:w-[80vw] xl:w-[35vw] xl:min-h-[65vh] p-8 bg-gray-200 border-2 border-red-100 shadow-2xl rounded-lg">
        {/* Tab chuyển đổi */}
        <div className="flex border-b border-gray-200 mb-6 w-max mx-auto">
          <div
            className={`
      px-10 py-2 font-medium cursor-pointer relative
      ${isLogin ? "text-red-500" : "text-gray-500 hover:text-red-500"}
      transition-colors duration-300
    `}
            onClick={() => setIsLogin(true)}
          >
            Đăng nhập
            {isLogin && (
              <span className="absolute bottom-0 left-0 w-full h-1 bg-red-500 rounded-t-full animate-slideIn"></span>
            )}
          </div>

          <div
            className={`
      px-10 py-2 font-medium cursor-pointer relative
      ${!isLogin ? "text-red-500" : "text-gray-500 hover:text-red-500"}
      transition-colors duration-300
    `}
            onClick={() => setIsLogin(false)}
          >
            Đăng kí
            {!isLogin && (
              <span className="absolute bottom-0 left-0 w-full h-1 bg-red-500 rounded-t-full animate-slideIn"></span>
            )}
          </div>
        </div>

        {/* Form */}
        {isLogin ? (
          <div className="flex flex-col gap-2">
            <form onSubmit={handleLoginSubmit} className="flex flex-col gap-4">
              <TextField
                name="email"
                size="small"
                label="Email"
                variant="outlined"
                inputRef={inputRefLogin.email}
                onChange={handleInputLogin}
              />
              <TextField
                name="password"
                size="small"
                label="Mật khẩu"
                variant="outlined"
                inputRef={inputRefLogin.password}
                onChange={handleInputLogin}
              />
              <Button
                variant="contained"
                type="submit"
                sx={{
                  backgroundColor: "red",
                  "&:hover": {
                    backgroundColor: "black",
                  },
                }}
              >
                {loading ? (
                  <div className="flex gap-2">
                    <CircularProgress size={20} color="inherit" /> Đang xử lí...
                  </div>
                ) : (
                  "Đăng nhập"
                )}
              </Button>
            </form>
            <div
              onClick={handleClickForgot}
              className="flex text-[12px] font-[500] hover:text-[#ff5252] cursor-pointer justify-end"
            >
              Quên mật khẩu?
            </div>
          </div>
        ) : (
          <form onSubmit={handleRegisterSubmit} className="flex flex-col gap-4">
            <TextField
              size="small"
              name="name"
              label="Họ tên"
              variant="outlined"
              inputRef={inputRefRegister.name}
              onChange={handleInputRegister}
            />
            <TextField
              size="small"
              name="email"
              label="Email"
              variant="outlined"
              inputRef={inputRefRegister.email}
              onChange={handleInputRegister}
            />
            <TextField
              size="small"
              name="password"
              label="Mật khẩu"
              variant="outlined"
              inputRef={inputRefRegister.password}
              onChange={handleInputRegister}
            />

            <Button
              variant="contained"
              type="submit"
              sx={{
                backgroundColor: "red",
                "&:hover": {
                  backgroundColor: "black",
                },
              }}
            >
              {loading ? (
                <div className="flex gap-2">
                  <CircularProgress size={20} color="inherit" /> Đang xử lí...
                </div>
              ) : (
                "Đăng kí"
              )}
            </Button>
          </form>
        )}
        {/* Divider */}
        <div className="flex items-center my-2">
          <hr className="flex-grow border-gray-300" />
          <span className="px-2 text-gray-500">HOẶC</span>
          <hr className="flex-grow border-gray-300" />
        </div>
        <Button
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 1,
          }}
          fullWidth
          variant="outlined"
          onClick={() => {
            window.open("http://localhost:3000/auth/google", "_self");
          }}
        >
          <FcGoogle className="text-[20px]" />
          Đăng nhập với Google
        </Button>
      </div>
    </div>
  );
}
