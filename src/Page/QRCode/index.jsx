import { Dialog } from "@mui/material";
import { Scanner } from "@yudiel/react-qr-scanner";
import axios from "axios";
import { socket } from "../../socket";
import { toast } from "react-toastify";

export default function QRScannerModal({ open, onClose }) {
  const handleScan = async (result) => {
    if (!result?.length) return;

    const sessionId = result[0].rawValue;

    try {
      const res = await postData("/auth/qr/scan", {
        sessionId,
      });
      if (res.success) {
        toast.success(res.message || "Quét thành công");
        onClose();
      }
    } catch (error) {
      const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Không thể kết nối đến máy chủ";
      
    toast.error(errorMessage);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <div style={{ padding: 20 }}>
        <h2>Quét mã QR</h2>

        <Scanner
          onScan={handleScan}
          onError={(error) => console.log(error)}
          constraints={{
            facingMode: "environment",
          }}
        />

        <button onClick={onClose}>Đóng</button>
      </div>
    </Dialog>
  );
}
