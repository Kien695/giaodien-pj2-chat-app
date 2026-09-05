import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { postData } from "../../utils/api";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { setLogin } from "../../redux/userSlice";
import { socket } from "../../socket";

export default function AuthSuccess() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const exchangeStarted = useRef(false);

  useEffect(() => {
    if (exchangeStarted.current) return;
    exchangeStarted.current = true;
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    window.history.replaceState({}, document.title, window.location.pathname);

    const exchangeCode = async () => {
      if (!code) {
        navigate("/login", { replace: true });
        return;
      }
      try {
        const response = await postData("/auth/oauth/exchange", { code });
        const { accessToken, documentId } = response.data;
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("documentId", documentId);
        socket.auth = { token: accessToken };
        socket.connect();
        dispatch(setLogin(true));
        toast.success("Đăng nhập thành công");
        navigate("/chat", { replace: true });
      } catch (error) {
        toast.error(error?.response?.data?.message || "Không thể hoàn tất đăng nhập");
        navigate("/login", { replace: true });
      }
    };

    exchangeCode();
  }, [dispatch, navigate]);

  return (
    <div className="app-page flex min-h-screen items-center justify-center text-[var(--text-secondary)]">
      Đang xử lý đăng nhập...
    </div>
  );
}
