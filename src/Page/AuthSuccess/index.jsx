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
    const params = new URLSearchParams(window.location.search);

    const accessToken = params.get("token");
    const documentId = params.get("documentId");

    if (!accessToken) return;

    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("documentId", documentId);
    localStorage.setItem("theme", "light");

    toast.success("Đăng nhập thành công");
    dispatch(setLogin(true));

    // 🔥 QUAN TRỌNG: xóa query string
    window.history.replaceState({}, "", "/auth-success");

    // 🔥 QUAN TRỌNG: replace để không back lại
    navigate("/chat", { replace: true });
  }, []);
}
