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

    // Kiểm tra xem đã có token chưa
    if (accessToken) {
      // Lưu vào Storage
      localStorage.setItem("accessToken", accessToken);
      if (documentId) localStorage.setItem("documentId", documentId);
      localStorage.setItem("theme", "light");

      // Cập nhật State
      dispatch(setLogin(true));
      toast.success("Đăng nhập thành công");

      navigate("/chat", { replace: true });
    } else {
      // Nếu không có token, đẩy về trang login hoặc báo lỗi
      console.error("No token found in URL");
      navigate("/login");
    }
  }, [dispatch, navigate]);

  return <div>Đang xử lý đăng nhập...</div>;
}
