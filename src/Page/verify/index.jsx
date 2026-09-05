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
          const { resetTicket, expiresIn } = res.data;
          sessionStorage.setItem("passwordResetTicket", resetTicket);
          sessionStorage.setItem(
            "passwordResetExpiresAt",
            String(Date.now() + expiresIn * 1000),
          );
          toast.success("Xác minh OTP thành công. Vui lòng đặt lại mật khẩu !");
          localStorage.removeItem("actionType");
          localStorage.removeItem("userEmail");
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
    <div className="app-page flex h-screen w-screen flex-col items-center justify-center gap-4 px-4">
      <div className="app-card mx-auto w-full max-w-[500px] rounded-md border shadow-xl">
        <div className="flex flex-col items-center p-5 gap-2 ">
          <div className="img">
            <img src={logo} alt="" className="w-[120px] " />
          </div>
          <div className="text-[20px] font-[600]">Mã OTP xác minh</div>
          <div className="text-[15px] mb-3">
            OTP gửi đến{" "}
            <span className="font-[500] text-[var(--danger)]">
              {localStorage.getItem("userEmail") || "***"}
            </span>
          </div>
          <form onSubmit={handleOtpSubmit}>
            <OtpInputs length={6} onComplete={handleComplete} />
            <Button
              variant="contained"
              type="submit"
              sx={{ width: "328px", maxWidth: "100%", marginTop: "10px" }}
            >
              Xác minh OTP
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
