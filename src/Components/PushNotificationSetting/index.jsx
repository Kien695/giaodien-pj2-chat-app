import { CircularProgress, FormControlLabel } from "@mui/material";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  disablePushNotifications,
  enablePushNotifications,
  getPushNotificationState,
} from "../../utils/pushNotification";

export default function PushNotificationSetting({ switchComponent }) {
  const NotificationSwitch = switchComponent;
  const [status, setStatus] = useState("loading");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    let active = true;
    getPushNotificationState()
      .then((nextStatus) => {
        if (active) setStatus(nextStatus);
      })
      .catch(() => {
        if (active) setStatus("unavailable");
      });
    return () => {
      active = false;
    };
  }, []);

  const handleChange = async (event) => {
    if (updating) return;
    setUpdating(true);
    try {
      if (event.target.checked) {
        await enablePushNotifications();
        setStatus("enabled");
        toast.success("Đã bật thông báo trên thiết bị này");
      } else {
        const result = await disablePushNotifications();
        setStatus("disabled");
        if (result?.serverSynced === false) {
          toast.info("Đã tắt thông báo trên trình duyệt. Máy chủ sẽ tự dọn đăng ký cũ.");
        } else {
          toast.success("Đã tắt thông báo trên thiết bị này");
        }
      }
    } catch (error) {
      setStatus(window.Notification?.permission === "denied" ? "denied" : "disabled");
      toast.error(error.userMessage || "Không thể cập nhật quyền thông báo");
    } finally {
      setUpdating(false);
    }
  };

  const unavailable = ["unsupported", "denied", "unavailable"].includes(status);
  const description =
    status === "denied"
      ? "Quyền thông báo đang bị chặn trong trình duyệt."
      : status === "unsupported"
        ? "Trình duyệt hoặc kết nối này không hỗ trợ Web Push."
        : "Nhận thông báo tin nhắn khi ứng dụng không ở phía trước.";

  return (
    <div className="mt-5">
      <div className="settings-section-title mb-3">Thông báo</div>
      <div className="settings-card flex items-center justify-between gap-4 rounded-lg p-3">
        <div className="min-w-0">
          <div className="text-[14px]">Thông báo trên thiết bị này</div>
          <div className="settings-muted mt-1 text-xs">{description}</div>
        </div>
        {status === "loading" || updating ? (
          <CircularProgress size={22} />
        ) : (
          <FormControlLabel
            sx={{ margin: 0 }}
            control={
              <NotificationSwitch
                checked={status === "enabled"}
                disabled={unavailable}
                onChange={handleChange}
              />
            }
          />
        )}
      </div>
    </div>
  );
}
