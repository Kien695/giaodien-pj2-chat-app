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

        toast.success("Đăng nhập thành công");
        navigate("/");
      }
    };
    authSuccess();
  });
}
