import { Button } from "@mui/material";
import { SiIconify } from "react-icons/si";
import { GrImage } from "react-icons/gr";
import { FiPaperclip } from "react-icons/fi";
import { IoSend } from "react-icons/io5";
import React, { useEffect, useState } from "react";
import { FaRegSmile } from "react-icons/fa";
import { MdDevicesFold, MdOutlineOndemandVideo } from "react-icons/md";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import InfoUser from "../../Components/infoUser";
import { useRef } from "react";
import { getData } from "../../utils/api";
export default function ChatDetail() {
  const [openInfo, setOpenInfo] = useState(false);
  const state = useSelector((state) => state.user);
  const socketConnection = state.socketConnection;

  const params = useParams();
  const input = useRef();
  const bottomRef = useRef(null);
  const [dataUser, setDataUser] = useState({
    _id: "",
    name: "",
    email: "",
    avatar: "",
    mobile: "",
    date_of_birth: "",
    background: "",
    gender: "",
    content: "",
    online: false,
  });
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  useEffect(() => {
    const fetChChat = async () => {
      const res = await getData("/chat");
      if (res.success) {
        setChat(res.data);
      }
    };
    fetChChat();
  }, []);

  const handleMessage = () => {
    if (socketConnection) {
      socketConnection.emit("CLIENT_SEND_MASSAGE", message);
      setMessage("");
      input.current.value = "";
    }
  };

  useEffect(() => {
    if (!socketConnection) return;

    const handleMessage = (data) => {
      const formatted = {
        ...data,
        user_id:
          typeof data.user_id === "object"
            ? data.user_id
            : { _id: data.user_id, avatar: data.avatar, name: data.name },
        _id: data._id || new Date().getTime(),
        createdAt: new Date(),
      };
      setChat((prev) => [...prev, formatted]);
    };

    socketConnection.on("SERVER_RETURN_MASSAGE", handleMessage);

    return () => socketConnection.off("SERVER_RETURN_MASSAGE", handleMessage);
  }, [socketConnection]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  return (
    <div className="w-full h-screen flex flex-col">
      <div className="flex h-[11%] items-center justify-between px-5 py-1 border-b flex-shrink-0">
        <div className="flex gap-3 relative">
          <img
            src={
              dataUser.avatar ||
              "https://jbagy.me/wp-content/uploads/2025/03/Hinh-anh-avatar-nam-cute-5-1.jpg"
            }
            alt="avatar"
            className="w-[45px] rounded-full cursor-pointer"
            onClick={() => {
              setOpenInfo(true);
            }}
          />
          <InfoUser
            open={openInfo}
            onClose={() => setOpenInfo(false)}
            user={dataUser}
            type="client"
          />
          <div className="flex flex-col justify-between">
            <div className="text-[16px] font-[500]">
              {dataUser.name || "Kiên"}
            </div>
            {dataUser.online == "true" ? (
              <div className="text-[14px] text-gray-700">Đang hoạt động</div>
            ) : (
              <div className="text-[14px] text-gray-700">
                Truy cập 30 phút trước
              </div>
            )}
          </div>
          {dataUser.online == "true" && (
            <span className="w-2 h-2 p-1 bg-green-600 rounded-full left-9 bottom-1 absolute"></span>
          )}
        </div>
        <Button>
          <MdDevicesFold className="text-[20px]" />
        </Button>
      </div>
      <div className="flex-1 p-4 bg-blue-50 flex flex-col gap-2 overflow-y-auto">
        {chat.map((item, index) =>
          item.user_id._id == state._id ? (
            <div className="self-end max-w-[60%] bg-blue-100 text-gray-800 p-2 rounded-xl rounded-br-none">
              <div>{item.content}</div>
              <div className="text-[11px] text-gray-500 mt-1 text-right">
                {new Date(item.createdAt).toLocaleTimeString("vi-VN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          ) : (
            <div className="flex gap-2 max-w-[60%]">
              <img
                src={item.user_id.avatar || "https://i.pravatar.cc/40"}
                alt=""
                className="w-8 h-8 rounded-full"
              />
              <div className="bg-white text-gray-800 p-2 rounded-xl rounded-bl-none">
                <div>{item.content}</div>
              </div>
            </div>
          )
        )}
        {/* điểm cuộn đến */}
        <div ref={bottomRef}></div>
      </div>
      <div className="flex flex-col border-t-2 h-[14%]">
        <div className="p-3 border-b-2 flex gap-6">
          <SiIconify className="text-[17px]" />
          <GrImage className="text-[17px]" />
          <FiPaperclip className="text-[17px]" />
          <MdOutlineOndemandVideo className="text-[17px]" />
        </div>

        <div className="flex items-center gap-2 px-3">
          <input
            type="text"
            placeholder="Nhập tin nhắn gửi đến A"
            className="flex-1 py-2 border-none focus:outline-none"
            ref={input}
            onChange={(e) => {
              setMessage(e.target.value);
            }}
            onKeyDown={(e) => e.key === "Enter" && handleMessage()}
          />
          <IoSend
            className="text-blue-600 text-[23px]"
            onClick={handleMessage}
          />
        </div>
      </div>
    </div>
  );
}
