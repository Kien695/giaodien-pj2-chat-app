import React from "react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getData } from "../../utils/api";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { setLogin } from "../../redux/userSlice";

export default function AuthSuccess() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  useEffect(() => {
    const authSuccess = async () => {
      const params = new URLSearchParams(window.location.search);

      const accessToken = params.get("token");
      if (accessToken) {
        localStorage.setItem("accessToken", accessToken);

        toast.success("Đăng nhập thành công");
        dispatch(setLogin(true));
        navigate("/chat");
      }
    };
    authSuccess();
  });
}
