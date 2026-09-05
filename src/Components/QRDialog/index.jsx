import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  IconButton,
  Tooltip,
  Button,
} from "@mui/material";
import { IoReloadSharp } from "react-icons/io5";
import QRCode from "react-qr-code";
import { MdQrCode2, MdPhonelinkRing, MdOutlineErrorOutline } from "react-icons/md";
import { socket } from "../../socket";
import { toast } from "react-toastify";
import { postData } from "../../utils/api";
import { setLogin } from "../../redux/userSlice";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";

const getDeviceInfo = () => {
  const ua = navigator.userAgent;
  let browser = "Trình duyệt Web";
  if (ua.includes("Firefox")) browser = "Firefox";
  else if (ua.includes("Edg")) browser = "Microsoft Edge";
  else if (ua.includes("Chrome")) browser = "Google Chrome";
  else if (ua.includes("Safari")) browser = "Safari";

  let os = "Windows";
  if (ua.includes("Mac")) os = "macOS";
  else if (ua.includes("Linux")) os = "Linux";
  else if (ua.includes("Android")) os = "Android";
  else if (ua.includes("iPhone") || ua.includes("iPad")) os = "iOS";

  return `${browser} (${os})`;
};

export default function QRDialog() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [openQR, setOpenQR] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [sessionId, setSessionId] = useState("");
  // status: "waiting" | "scanned" | "rejected"
  const [qrStatus, setQrStatus] = useState("waiting");

  const handleCreateQr = async () => {
    try {
      setQrStatus("waiting");
      const deviceInfo = getDeviceInfo();
      const res = await postData("/auth/qr/create", { deviceInfo });

      if (res.success) {
        setOpenQR(true);
        setTimeLeft(res.data.expiresIn);
        setSessionId(res.data.sessionId);
        if (socket) {
          if (!socket.connected) {
            socket.connect();
          }
          console.log("Socket ID:", socket.id);
          socket.emit("JOIN_QR", {
            sessionId: res.data.sessionId,
            subscriberToken: res.data.subscriberToken,
          });
        }
      }
    } catch (error) {
      if (error?.response) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Không thể kết nối server!");
      }
    }
  };

  useEffect(() => {
    if (!sessionId) return;

    // 1. Lắng nghe sự kiện đã quét
    const handleQrScanned = (data) => {
      console.log("QR scanned event received on desktop:", data);
      setQrStatus("scanned");
    };

    // 2. Lắng nghe sự kiện chấp nhận đăng nhập từ điện thoại
    const handleQrApproved = async (data) => {
      console.log("QR approved event received on desktop:", data);
      try {
        let accessToken = data?.accessToken;
        let documentId = data?.documentId;

        // Nếu socket trả về chưa có token (fallback API call)
        if (!accessToken) {
          const res = await postData("/auth/qr/confirm", { sessionId });
          if (res.success) {
            accessToken = res.data.accessToken;
            documentId = res.data.documentId;
          }
        }

        if (accessToken) {
          toast.success("Đăng nhập thành công!");
          setOpenQR(false);

          localStorage.setItem("accessToken", accessToken);
          localStorage.setItem("documentId", documentId);

          socket.disconnect();
          socket.auth = { token: accessToken };
          socket.connect();

          dispatch(setLogin(true));
          navigate("/chat");
        }
      } catch (error) {
        if (error?.response) {
          toast.error(error.response.data.message);
        } else {
          toast.error("Không thể hoàn tất đăng nhập!");
        }
      }
    };

    // 3. Lắng nghe sự kiện bị từ chối
    const handleQrRejected = () => {
      console.log("QR rejected on phone");
      setQrStatus("rejected");
      toast.warn("Yêu cầu đăng nhập đã bị từ chối từ điện thoại.");
    };

    socket.on("QR_SCANNED", handleQrScanned);
    socket.on("QR_APPROVED", handleQrApproved);
    socket.on("QR_REJECTED", handleQrRejected);

    return () => {
      socket.off("QR_SCANNED", handleQrScanned);
      socket.off("QR_APPROVED", handleQrApproved);
      socket.off("QR_REJECTED", handleQrRejected);
    };
  }, [sessionId, dispatch, navigate]);

  useEffect(() => {
    if (!openQR) {
      setTimeLeft(60);
      setQrStatus("waiting");
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
        className="flex cursor-pointer items-center gap-1.5 text-[13px] font-semibold text-[var(--text-secondary)] transition hover:scale-105 hover:text-[var(--primary)]"
        onClick={handleCreateQr}
      >
        <span>Quét QR</span>
        <MdQrCode2 className="text-base text-red-500" />
      </div>

      <Dialog
        open={openQR}
        onClose={() => setOpenQR(false)}
        PaperProps={{
          style: {
            borderRadius: 24,
            padding: "8px",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
            backgroundColor: "var(--surface-raised)",
          },
        }}
      >
        <DialogContent className="flex flex-col items-center justify-center p-6 w-[340px]">
          {/* Header text */}
          <Typography
            variant="h6"
            className="mb-1 text-center font-bold text-[var(--text-primary)]"
            sx={{ fontSize: "1.1rem" }}
          >
            {qrStatus === "scanned"
              ? "Đã quét thành công!"
              : qrStatus === "rejected"
              ? "Yêu cầu bị từ chối"
              : "Đăng nhập bằng mã QR"}
          </Typography>

          <Typography
            variant="caption"
            className="app-muted mb-5 block max-w-[260px] text-center"
          >
            {qrStatus === "scanned"
              ? "Vui lòng kiểm tra điện thoại và nhấn 'Đăng nhập' để xác nhận."
              : qrStatus === "rejected"
              ? "Bạn đã hủy yêu cầu đăng nhập từ điện thoại."
              : "Dùng ứng dụng trên điện thoại để quét mã QR bên dưới."}
          </Typography>

          {/* Core Visual Box */}
          <Box
            sx={{
              position: "relative",
              display: "inline-flex",
              padding: "20px",
              backgroundColor: "#fff",
              borderRadius: "20px",
              overflow: "hidden",
              boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
              border: "1px solid var(--border)",
            }}
          >
            {/* Scanned state overlay */}
            {qrStatus === "scanned" && (
              <Box
                sx={{
                  position: "absolute",
                  inset: 0,
                  backgroundColor: "rgba(240, 253, 244, 0.95)",
                  backdropFilter: "blur(6px)",
                  zIndex: 30,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 3,
                  textAlign: "center",
                }}
              >
                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-3 animate-bounce shadow-md">
                  <MdPhonelinkRing className="text-3xl text-emerald-600" />
                </div>
                <Typography variant="subtitle2" className="font-bold text-emerald-800">
                  Đã quét thành công!
                </Typography>
                <Typography variant="caption" className="text-emerald-600 mt-1">
                  Đang chờ xác nhận trên điện thoại...
                </Typography>
              </Box>
            )}

            {/* Rejected state overlay */}
            {qrStatus === "rejected" && (
              <Box
                sx={{
                  position: "absolute",
                  inset: 0,
                  backgroundColor: "rgba(254, 242, 242, 0.95)",
                  backdropFilter: "blur(6px)",
                  zIndex: 30,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 2,
                  textAlign: "center",
                }}
              >
                <div className="w-14 h-14 rounded-full bg-rose-100 flex items-center justify-center mb-2">
                  <MdOutlineErrorOutline className="text-3xl text-rose-600" />
                </div>
                <Typography variant="subtitle2" className="font-bold text-rose-800">
                  Đã từ chối
                </Typography>
                <Button
                  size="small"
                  variant="contained"
                  onClick={handleCreateQr}
                  sx={{
                    mt: 1.5,
                    borderRadius: "10px",
                    textTransform: "none",
                    background: "linear-gradient(135deg, #ef4444, #f97316)",
                  }}
                >
                  Thử lại
                </Button>
              </Box>
            )}

            {/* Scanning Laser (active when waiting and not expired) */}
            {qrStatus === "waiting" && timeLeft > 0 && (
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
                    "0%": { top: "5%" },
                    "50%": { top: "95%" },
                    "100%": { top: "5%" },
                  },
                }}
              />
            )}

            {/* Expired Overlay */}
            {qrStatus === "waiting" && timeLeft === 0 && (
              <Box
                sx={{
                  position: "absolute",
                  inset: 0,
                  backgroundColor: "rgba(255, 255, 255, 0.92)",
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
                    fontSize: "0.9rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    mb: 1,
                  }}
                >
                  Mã QR đã hết hạn
                </Typography>

                <Tooltip title="Tải lại mã QR">
                  <IconButton
                    onClick={handleCreateQr}
                    color="primary"
                    sx={{
                      backgroundColor: "primary.main",
                      color: "#fff",
                      padding: "12px",
                      boxShadow: "0 4px 14px rgba(239, 68, 68, 0.4)",
                      background: "linear-gradient(135deg, #ef4444, #f97316)",
                      transition: "all 0.2s ease-in-out",
                      "&:hover": {
                        transform: "rotate(180deg)",
                      },
                    }}
                  >
                    <IoReloadSharp style={{ fontSize: 24 }} />
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

            {/* Component Mã QR */}
            <Box
              sx={{
                filter:
                  qrStatus === "waiting" && timeLeft === 0
                    ? "blur(2px) grayscale(60%)"
                    : "none",
              }}
            >
              <QRCode value={sessionId || "placeholder"} size={190} />
            </Box>
          </Box>

          {/* Bottom Countdown */}
          {qrStatus === "waiting" && (
            <Typography
              variant="body2"
              sx={{
                mt: 2.5,
                color: timeLeft > 10 ? "text.secondary" : "error.main",
                fontWeight: 600,
                fontSize: "0.85rem",
              }}
            >
              {timeLeft > 0
                ? `Mã QR có hiệu lực trong: ${timeLeft}s`
                : "Mã QR đã dừng hoạt động"}
            </Typography>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

