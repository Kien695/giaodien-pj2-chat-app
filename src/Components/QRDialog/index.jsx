import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  IconButton,
  Tooltip,
} from "@mui/material";
import { IoReloadSharp } from "react-icons/io5";
import QRCode from "react-qr-code";
import { MdQrCode2 } from "react-icons/md";
import { socket } from "../../socket";
import { toast } from "react-toastify";
import { postData } from "../../utils/api";
import { setLogin } from "../../redux/userSlice";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";

export default function QRDialog() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [openQR, setOpenQR] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [sessionId, setSessionId] = useState("");

  const handleCreateQr = async () => {
    try {
      const res = await postData("/auth/qr/create");
      if (res.success) {
        setOpenQR(true);
        setTimeLeft(res.data.expiresIn);
        setSessionId(res.data.sessionId);
        if (socket) {
          if (!socket.connected) {
            socket.connect();
          }
          console.log("Socket ID:", socket.id);
          socket.emit("JOIN_QR", res.data.sessionId);
        }
      }
    } catch (error) {
      if (error.response) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Không thể kết nối server!");
      }
    }
  };
  useEffect(() => {
    // Nếu chưa có sessionId thì không đăng ký sự kiện
    if (!sessionId) return;

    const handleQrApproved = async () => {
      try {
        const res = await postData("/auth/qr/confirm", {
          sessionId,
        });

        if (res.success) {
          console.log("ok");
          toast.success("Đăng nhập thành công!");
          setOpenQR(false);
          // 1. Lưu thông tin đăng nhập
          localStorage.setItem("accessToken", res.data.accessToken);
          localStorage.setItem("documentId", res.data.documentId);
          localStorage.setItem("theme", "light");

          // 2. Cập nhật lại Socket Auth
          socket.disconnect(); // Ngắt kết nối socket cũ
          socket.auth = { token: res.data.accessToken };
          socket.connect(); // Kết nối lại socket mới

          dispatch(setLogin(true));
          navigate("/chat");
        }
      } catch (error) {
        if (error?.response) {
          toast.error(error.response.data.message);
        } else {
          toast.error("Không thể kết nối server!");
        }
      }
    };

    // Lắng nghe sự kiện từ socket
    socket.on("QR_APPROVED", handleQrApproved);

    // hủy nghe khi unmount hoặc khi sessionId đổi!
    return () => {
      socket.off("QR_APPROVED", handleQrApproved);
    };
  }, [sessionId, dispatch]);

  useEffect(() => {
    if (!openQR) {
      setTimeLeft(20);
      return;
    }

    if (timeLeft === 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [openQR, timeLeft]);

  return (
    <>
      <div
        className="flex gap-1 items-center text-[13px] cursor-pointer font-medium text-slate-500 transition hover:text-red-500"
        onClick={handleCreateQr}
      >
        Quét QR
        <MdQrCode2 />
      </div>
      <Dialog
        open={openQR}
        onClose={() => setOpenQR(false)}
        PaperProps={{
          style: { borderRadius: 16, padding: "8px" },
        }}
      >
        <DialogContent className="flex flex-col items-center justify-center p-6">
          {/* Box chứa QRCode, Tia Laser và Lớp Hết Hạn */}
          <Box
            sx={{
              position: "relative",
              display: "inline-flex",
              padding: "16px",
              backgroundColor: "#fff",
              borderRadius: "12px",
              overflow: "hidden",
              boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
            }}
          >
            {/*  Thanh Laser Quét (Chỉ hiện khi CHƯA hết hạn) */}
            {timeLeft > 0 && (
              <Box
                sx={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  height: "3px",
                  background:
                    "linear-gradient(90deg, transparent, #ef4444, transparent)",
                  boxShadow: "0 0 12px #ef4444, 0 0 20px #ef4444",
                  zIndex: 10,
                  pointerEvents: "none",
                  animation: "scan 2s infinite ease-in-out",
                  "@keyframes scan": {
                    "0%": { top: "0%" },
                    "50%": { top: "calc(100% - 3px)" },
                    "100%": { top: "0%" },
                  },
                }}
              />
            )}

            {/*  Overlay đè lên khi HẾT HẠN + NÚT RELOAD */}
            {timeLeft === 0 && (
              <Box
                sx={{
                  position: "absolute",
                  inset: 0,
                  backgroundColor: "rgba(255, 255, 255, 0.9)",
                  backdropFilter: "blur(4px)",
                  zIndex: 20,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 2,
                  textAlign: "center",
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    color: "error.main",
                    fontWeight: 700,
                    fontSize: "0.95rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    mb: 1,
                  }}
                >
                  Mã QR đã hết hạn
                </Typography>

                {/*  Nút Reload */}
                <Tooltip title="Tải lại mã QR">
                  <IconButton
                    onClick={handleCreateQr}
                    color="primary"
                    sx={{
                      backgroundColor: "primary.main",
                      color: "#fff",
                      padding: "12px",
                      boxShadow: "0 4px 12px rgba(25, 118, 210, 0.4)",
                      transition: "all 0.2s ease-in-out",
                      "&:hover": {
                        backgroundColor: "primary.dark",
                        transform: "rotate(180deg)", // Hiệu ứng xoay tròn khi hover
                      },
                    }}
                  >
                    <IoReloadSharp sx={{ fontSize: 28 }} />
                  </IconButton>
                </Tooltip>

                <Typography
                  variant="caption"
                  sx={{ color: "text.secondary", mt: 1.5, fontWeight: 500 }}
                >
                  Nhấn để tạo mã mới
                </Typography>
              </Box>
            )}

            {/*  Component Mã QR */}
            <Box
              sx={{
                filter: timeLeft === 0 ? "blur(2px) grayscale(60%)" : "none",
              }}
            >
              <QRCode value={sessionId} size={200} />
            </Box>
          </Box>

          {/*  Thời gian đếm ngược bên dưới */}
          <Typography
            variant="body2"
            sx={{
              mt: 2,
              color: timeLeft > 10 ? "text.secondary" : "error.main",
              fontWeight: 600,
            }}
          >
            {timeLeft > 0
              ? `Mã QR có hiệu lực trong: ${timeLeft}s`
              : "Mã QR đã dừng hoạt động"}
          </Typography>
        </DialogContent>
      </Dialog>
    </>
  );
}
