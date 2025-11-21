import React from "react";
import logo from "../../assets/protection_8777571.png";

import { Button } from "@mui/material";
import OtpInputs from "../../Components/otpInput";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { postData } from "../../utils/api";

export default function Verify() {
  const navigate = useNavigate();
  const [otp, setOtp] = React.useState("");
  const handleComplete = (code) => {
    setOtp(code);
  };
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    if (localStorage.getItem("actionType") !== "forgot-password") {
      try {
        const res = await postData("/auth/verify", {
          email: localStorage.getItem("userEmail"),
          otp: otp,
        });
        if (res.success) {
          toast.success("Xác thực Email thành công!");
          localStorage.removeItem("userEmail");
          navigate("/auth");
        }
      } catch (error) {
        if (error.response) {
          toast.error(error.response.data.message);
        } else {
          toast.error("Không thể kết nối server!");
        }
      }
    } else {
      try {
        const res = await postData("/auth/verifyForgot", {
          email: localStorage.getItem("userEmail"),
          otp: otp,
        });
        if (res.success) {
          toast.success("Xác minh OTP thành công. Vui lòng đặt lại mật khẩu !");
          localStorage.removeItem("actionType");
          navigate("/reset-password");
        }
      } catch (error) {
        if (error.response) {
          toast.error(error.response.data.message);
        } else {
          toast.error("Không thể kết nối server!");
        }
      }
    }
  };

  return (
    <div className="w-[100vw] h-[100vh] flex flex-col gap-4 items-center justify-center bg-gray-100">
      <div className="w-[500px] bg-white mx-auto rounded-md">
        <div className="flex flex-col items-center p-5 gap-2 ">
          <div className="img">
            <img src={logo} alt="" className="w-[120px] " />
          </div>
          <div className="text-[20px] font-[600]">Mã OTP xác minh</div>
          <div className="text-[15px] mb-3">
            OTP gửi đến{" "}
            <span className="text-[#ff5252] font-[500]">
              {localStorage.getItem("userEmail") || "***"}
            </span>
          </div>
          <form onSubmit={handleOtpSubmit}>
            <OtpInputs length={6} onComplete={handleComplete} />
            <Button
              variant="contained"
              type="submit"
              sx={{
                background: "#ff5252",
                width: "328px",

                marginTop: "10px",
                "&:hover": {
                  backgroundColor: "black",
                  color: "#f1f1f1",
                },
              }}
            >
              Xác minh OTP
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
