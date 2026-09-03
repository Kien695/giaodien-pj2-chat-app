import { Button, CircularProgress } from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import { MdDevices, MdOutlineComputer } from "react-icons/md";
import { toast } from "react-toastify";
import { deleteData, getData } from "../../utils/api";

const formatDate = (value) => {
  if (!value) return "Không xác định";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Không xác định";
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
};

export default function DeviceSessionSetting({ enabled }) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [revoking, setRevoking] = useState(null);
  const [upgradeRequired, setUpgradeRequired] = useState(false);

  const loadSessions = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getData("/auth/sessions");
      setSessions(Array.isArray(response.data) ? response.data : []);
      setUpgradeRequired(false);
    } catch (error) {
      if (error.response?.data?.code === "SESSION_UPGRADE_REQUIRED") {
        setUpgradeRequired(true);
      } else {
        toast.error(
          error.response?.data?.message || "Không thể tải danh sách thiết bị",
        );
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (enabled) loadSessions();
  }, [enabled, loadSessions]);

  const revokeOne = async (sessionId) => {
    if (!window.confirm("Đăng xuất thiết bị này?")) return;
    setRevoking(sessionId);
    try {
      await deleteData(`/auth/sessions/${encodeURIComponent(sessionId)}`);
      setSessions((current) =>
        current.filter((item) => item.sessionId !== sessionId),
      );
      toast.success("Đã đăng xuất thiết bị");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Không thể đăng xuất thiết bị",
      );
    } finally {
      setRevoking(null);
    }
  };

  const revokeOthers = async () => {
    if (!window.confirm("Đăng xuất khỏi tất cả thiết bị khác?")) return;
    setRevoking("others");
    try {
      const response = await deleteData("/auth/sessions/others");
      setSessions((current) => current.filter((item) => item.current));
      toast.success(
        `Đã đăng xuất ${response.data?.revokedCount || 0} thiết bị`,
      );
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Không thể đăng xuất các thiết bị khác",
      );
    } finally {
      setRevoking(null);
    }
  };

  const otherSessions = sessions.filter((session) => !session.current);

  return (
    <div className="mt-5 w-full min-w-0 overflow-hidden">
      <div className="mb-3 flex min-w-0 flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
        <div className="flex min-w-0 items-center gap-2 text-[14px] font-[500] text-gray-700">
          <MdDevices className="text-lg" /> Thiết bị đã đăng nhập
        </div>
        {otherSessions.length > 0 && (
          <Button
            color="error"
            size="small"
            disabled={Boolean(revoking)}
            onClick={revokeOthers}
            sx={{ alignSelf: "flex-end", flexShrink: 0, textTransform: "none" }}
          >
            Đăng xuất tất cả thiết bị khác
          </Button>
        )}
      </div>

      <div className="rounded-lg bg-white p-3 shadow-md">
        {loading ? (
          <div className="flex justify-center py-5">
            <CircularProgress size={24} />
          </div>
        ) : upgradeRequired ? (
          <div className="text-sm text-gray-600">
            Hãy đăng xuất và đăng nhập lại để bắt đầu quản lý thiết bị.
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-sm text-gray-500">
            Không có phiên đăng nhập đang hoạt động.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {sessions.map((session) => (
              <div
                key={session.sessionId}
                className="flex w-full min-w-0 items-center gap-2 py-3 first:pt-0 last:pb-0 sm:gap-3"
              >
                <MdOutlineComputer className="shrink-0 text-2xl text-gray-500" />
                <div className="min-w-0 flex-1 overflow-hidden">
                  <div
                    className="block w-full truncate text-sm font-medium"
                    title={session.deviceInfo || "Thiết bị không xác định"}
                  >
                    {session.deviceInfo || "Thiết bị không xác định"}
                  </div>
                  <div
                    className="mt-1 w-full truncate text-xs text-gray-500"
                    title={`Hoạt động: ${formatDate(session.lastUsedAt)} · ${session.loginMethod || "legacy"}`}
                  >
                    Hoạt động: {formatDate(session.lastUsedAt)} ·{" "}
                    {session.loginMethod || "legacy"}
                  </div>
                  {session.current && (
                    <div className="mt-1 text-xs font-medium text-green-600">
                      Thiết bị này
                    </div>
                  )}
                </div>
                {!session.current && (
                  <Button
                    color="error"
                    size="small"
                    disabled={Boolean(revoking)}
                    onClick={() => revokeOne(session.sessionId)}
                    sx={{ flexShrink: 0, minWidth: 88, textTransform: "none" }}
                  >
                    {revoking === session.sessionId ? (
                      <CircularProgress size={18} />
                    ) : (
                      "Đăng xuất"
                    )}
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
