import React from "react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getData } from "../../utils/api";
import { toast } from "react-toastify";

export default function AuthSuccess() {
  const navigate = useNavigate();
  useEffect(() => {
    const authSuccess = async () => {
      const params = new URLSearchParams(window.location.search);

      const accessToken = params.get("token");
      if (accessToken) {
        localStorage.setItem("accessToken", accessToken);
        try {
          const res = await getData("/auth/me");
          if (res.success) {
            toast.success("Đăng nhập thành công");
            navigate("/chat");
          }
        } catch (error) {
          console.error("Lỗi:", error);
        }
      }
    };
    authSuccess();
  });
  return <div></div>;
}
