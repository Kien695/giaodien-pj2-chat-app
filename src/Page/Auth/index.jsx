import { Button, TextField } from "@mui/material";

import { useState } from "react";
import { FcGoogle } from "react-icons/fc";
//toastyfy
import { toast } from "react-toastify";

export function Auth() {
  const [isLogin, setIsLogin] = useState(true);

  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success("Đăng nhập thành công!");
  };
  return (
    <div className="w-[100vw] h-[100vh] flex flex-col gap-4 items-center justify-center bg-gray-100">
      <div className="flex flex-col items-center">
        <div className="font-[800] text-gray-700 text-[33px] italic">
          XIN CHÀO!
        </div>{" "}
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
            {" "}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <TextField size="small" label="Email" variant="outlined" />
              <TextField size="small" label="Mật khẩu" variant="outlined" />
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
                Đăng nhập
              </Button>
            </form>
            <div className="flex text-[12px] font-[500] hover:text-[#ff5252] cursor-pointer justify-end">
              Quên mật khẩu?
            </div>
          </div>
        ) : (
          <form className="flex flex-col gap-4">
            <TextField size="small" label="Họ tên" variant="outlined" />
            <TextField size="small" label="Email" variant="outlined" />
            <TextField size="small" label="Mật khẩu" variant="outlined" />

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
              Đăng kí
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
        >
          <FcGoogle className="text-[20px]" />
          Đăng nhập với Google
        </Button>
      </div>
    </div>
  );
}
