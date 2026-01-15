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
      const documentId = params.get("documentId");
      if (accessToken) {
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("documentId", documentId);
        localStorage.setItem("theme", "light");
        toast.success("Đăng nhập thành công");
        dispatch(setLogin(true));
        navigate("/chat");
      }
    };
    authSuccess();
  });
}
