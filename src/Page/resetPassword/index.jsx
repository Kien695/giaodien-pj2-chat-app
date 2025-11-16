import { Button, CircularProgress, TextField } from "@mui/material";
import React, { useRef } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { postData } from "../../utils/api";
import { toast } from "react-toastify";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formPassword, setFormPassword] = useState({
    email: localStorage.getItem("userEmail"),
    newPassword: "",
    confirmPassword: "",
  });
  const inputRefs = {
    newPassword: useRef(),
    confirmPassword: useRef(),
  };
  const handleInput = (e) => {
    const { name, value } = e.target;
    setFormPassword((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    if (!formPassword.newPassword) {
      toast.error("Vui lòng nhập mật khẩu mới!");
      setLoading(false);
      inputRefs.newPassword.current.focus();
      return;
    }
    if (!formPassword.confirmPassword) {
      toast.error("Vui lòng nhập mật xác nhận khẩu mới");
      setLoading(false);
      inputRefs.confirmPassword.current.focus();
      return;
    }
    if (formPassword.confirmPassword !== formPassword.newPassword) {
      toast.error("Mật khẩu mới và xác nhận mật khẩu mới không trùng khớp");
      inputRefs.confirmPassword.current.focus();
      setLoading(false);
      return;
    }
    try {
      const res = await postData("/auth/reset-password", formPassword);
      if (res.success) {
        toast.success("Đổi mật khẩu thành công!");
        localStorage.removeItem("userEmail");
        navigate("/login");
      }
    } catch (error) {
      if (error.response) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Không thể kết nối server!");
      }
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="w-[100vw] h-[100vh] flex flex-col gap-4 items-center justify-center bg-gray-100">
      <div className="w-[75vw]  md:w-[80vw] xl:w-[35vw] h-auto px-8 py-10 bg-gray-200 border-2 border-red-100 shadow-2xl rounded-lg">
        <div className="text-center text-[22px] text-[#ff5252] font-[600] mb-6">
          Đổi mật khẩu
        </div>

        {/* FORM LOGIN */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <TextField
            label="Mật khẩu mới *"
            name="newPassword"
            size="small"
            autoComplete="new-password"
            inputRef={inputRefs.newPassword}
            onChange={handleInput}
            fullWidth
          />
          <TextField
            label="Xác nhận mật khẩu mới *"
            size="small"
            autoComplete="confirm-password"
            name="confirmPassword"
            inputRef={inputRefs.confirmPassword}
            onChange={handleInput}
            fullWidth
          />

          <Button
            variant="contained"
            type="submit"
            disabled={loading}
            sx={{
              background: "#ff5252",

              marginTop: "10px",
              "&:hover": {
                backgroundColor: "black",
                color: "#f1f1f1",
              },
            }}
          >
            {loading ? (
              <div className="flex gap-2">
                <CircularProgress size={20} color="inherit" /> Đang xử lí...
              </div>
            ) : (
              "Xác nhận"
            )}
          </Button>
        </form>
        {/* END FORM LOGIN */}
      </div>
    </div>
  );
}
