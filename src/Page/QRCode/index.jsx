import { useState } from "react";
import { Dialog, CircularProgress } from "@mui/material";
import { Scanner } from "@yudiel/react-qr-scanner";
import { MdComputer, MdSecurity, MdClose } from "react-icons/md";
import { toast } from "react-toastify";
import { postData } from "../../utils/api";

export default function QRScannerModal({ open, onClose }) {
  const [scannedData, setScannedData] = useState(null);
  const [loadingScan, setLoadingScan] = useState(false);
  const [loadingConfirm, setLoadingConfirm] = useState(false);
  const [loadingCancel, setLoadingCancel] = useState(false);

  const handleReset = () => {
    setScannedData(null);
    setLoadingScan(false);
    setLoadingConfirm(false);
    setLoadingCancel(false);
  };

  const handleCloseModal = () => {
    handleReset();
    onClose();
  };

  const handleScan = async (result) => {
    if (!result?.length || loadingScan || scannedData) return;

    const rawSessionId = result[0].rawValue;
    if (!rawSessionId) return;

    try {
      setLoadingScan(true);
      const res = await postData("/auth/qr/scan", {
        sessionId: rawSessionId,
      });

      if (res.success) {
        toast.success(res.message || "Quét mã QR thành công!");
        setScannedData({
          sessionId: rawSessionId,
          deviceInfo: res.data?.deviceInfo || "Máy tính (Web)",
        });
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Không thể kết nối đến máy chủ";
      toast.error(errorMessage);
    } finally {
      setLoadingScan(false);
    }
  };

  const handleConfirmLogin = async () => {
    if (!scannedData?.sessionId || loadingConfirm) return;

    try {
      setLoadingConfirm(true);
      const res = await postData("/auth/qr/confirm", {
        sessionId: scannedData.sessionId,
      });

      if (res.success) {
        toast.success("Xác nhận đăng nhập trên máy tính thành công!");
        handleCloseModal();
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Xác nhận đăng nhập thất bại!";
      toast.error(errorMessage);
    } finally {
      setLoadingConfirm(false);
    }
  };

  const handleCancelLogin = async () => {
    if (!scannedData?.sessionId || loadingCancel) return;

    try {
      setLoadingCancel(true);
      await postData("/auth/qr/cancel", {
        sessionId: scannedData.sessionId,
      });
      toast.info("Đã hủy yêu cầu đăng nhập");
    } catch (error) {
      console.log("Cancel error:", error);
    } finally {
      handleCloseModal();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleCancelLogin}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        style: {
          borderRadius: 24,
          overflow: "hidden",
          backgroundColor: "var(--surface-raised)",
        },
      }}
    >
      <div className="relative p-5 flex flex-col items-center">
        {/* Close Button */}
        <button
          onClick={scannedData ? handleCancelLogin : handleCloseModal}
          className="app-hover app-muted absolute right-4 top-4 rounded-full p-2 transition hover:text-[var(--text-primary)]"
        >
          <MdClose className="text-xl" />
        </button>

        {!scannedData ? (
          /* STEP 1: SCANNER VIEW */
          <div className="w-full flex flex-col items-center">
            <h2 className="mb-1 text-xl font-bold text-[var(--text-primary)]">Quét mã QR</h2>
            <p className="app-muted mb-4 text-center text-xs">
              Đặt mã QR trên máy tính vào ô vuông bên dưới để quét
            </p>

            <div className="relative w-full aspect-square max-w-[280px] rounded-2xl overflow-hidden shadow-lg border border-slate-200">
              <Scanner
                onScan={handleScan}
                onError={(error) => console.log("Scanner Error:", error)}
                constraints={{
                  facingMode: "environment",
                }}
              />
              {loadingScan && (
                <div className="absolute inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center">
                  <CircularProgress size={36} style={{ color: "#ffffff" }} />
                </div>
              )}
            </div>

            <button
              onClick={handleCloseModal}
              className="app-muted mt-5 text-sm font-semibold transition hover:text-[var(--text-primary)]"
            >
              Đóng
            </button>
          </div>
        ) : (
          /* STEP 2: COMPUTER INFORMATION & CONFIRM LOGIN VIEW */
          <div className="w-full flex flex-col items-center pt-2">
            {/* Animated Device Icon Badge */}
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-blue-500/20 mb-4">
              <MdComputer className="text-4xl" />
            </div>

            <h2 className="mb-1 text-center text-xl font-bold text-[var(--text-primary)]">
              Đăng nhập bằng mã QR
            </h2>
            <p className="app-muted mb-5 px-4 text-center text-xs">
              Bạn vừa quét mã QR yêu cầu đăng nhập tài khoản trên thiết bị máy tính.
            </p>

            {/* Device Info Card */}
            <div className="w-full bg-slate-50 rounded-2xl p-4 border border-slate-100 mb-4 flex flex-col gap-2">
              <div className="app-muted flex items-center justify-between text-xs font-medium">
                <span>Thiết bị yêu cầu:</span>
                <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full text-[10px] font-semibold">
                  Mới quét
                </span>
              </div>
              <p className="text-base font-bold text-[var(--text-primary)]">
                {scannedData.deviceInfo}
              </p>
            </div>

            {/* Security Warning Box */}
            <div className="w-full bg-amber-50 rounded-2xl p-3.5 border border-amber-200/60 mb-6 flex items-start gap-3">
              <MdSecurity className="text-xl text-amber-600 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-800 leading-relaxed font-medium">
                Vui lòng kiểm tra cẩn thận. Chỉ nhấn <strong>Đăng nhập</strong> nếu bạn chính là người đang trực tiếp thao tác trên máy tính này.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="w-full flex flex-col gap-3">
              <button
                onClick={handleConfirmLogin}
                disabled={loadingConfirm || loadingCancel}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {loadingConfirm ? (
                  <>
                    <CircularProgress size={18} color="inherit" />
                    <span>Đang xử lý...</span>
                  </>
                ) : (
                  "Đăng nhập"
                )}
              </button>

              <button
                onClick={handleCancelLogin}
                disabled={loadingConfirm || loadingCancel}
                className="app-hover app-muted flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--border)] px-4 py-3 text-sm font-semibold transition active:scale-[0.98] disabled:opacity-70"
              >
                {loadingCancel ? (
                  <>
                    <CircularProgress size={16} color="inherit" />
                    <span>Đang hủy...</span>
                  </>
                ) : (
                  "Hủy bỏ"
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </Dialog>
  );
}

