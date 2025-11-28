import { Button } from "@mui/material";
import { SiIconify } from "react-icons/si";
import { GrImage } from "react-icons/gr";
import { FiPaperclip } from "react-icons/fi";
import { IoSend } from "react-icons/io5";
import React, { useEffect, useState } from "react";
import { FaRegSmile, FaRegThumbsUp } from "react-icons/fa";
import { MdDevicesFold, MdOutlineOndemandVideo } from "react-icons/md";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import InfoUser from "../../Components/infoUser";
import { useRef } from "react";
import { getData } from "../../utils/api";
//emoji
import EmojiPicker from "emoji-picker-react";
//image
import ImageUploading from "react-images-uploading";
//viewer image
import { PhotoProvider, PhotoView } from "react-photo-view";
import "react-photo-view/dist/react-photo-view.css";

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
  const [showPicker, setShowPicker] = useState(false);
  const pickerRef = useRef(null);
  const pickerWrapperRef = useRef(null);

  const [chat, setChat] = useState([]);
  const [typing, setTyping] = useState("");
  const [images, setImages] = useState([]);
  const maxNumber = 5;
  const typingTimeoutRef = useRef(null);

  const resetTyping = () => {
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      setTyping(false);
      if (socketConnection) socketConnection.emit("CLIENT_SEND_TYPING", false);
    }, 3000);
  };
  const onEmojiClick = (emojiData) => {
    setMessage((prev) => prev + emojiData.emoji);
    if (socketConnection) {
      socketConnection.emit("CLIENT_SEND_TYPING", true);
    }
    // bật typing ngay
    setTyping(true);

    // reset timeout 3s
    resetTyping();
  };
  const handleInputChange = (e) => {
    const value = e.target.value;
    setMessage(value);

    if (socketConnection) {
      socketConnection.emit("CLIENT_SEND_TYPING", !!value);
    }

    // bật typing
    setTyping(true);

    // reset timeout 3s
    resetTyping();
  };
  //upload image
  const convertImagesToBase64 = async () => {
    const promises = images.map((img) => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(img.file);
      });
    });

    return await Promise.all(promises);
  };

  const onChange = (imageList) => {
    setImages(imageList);
  };
  //click ra ngoài thì mất Emoji
  useEffect(() => {
    const handleClickOutside = (e) => {
      // Nếu click ngoài picker + ngoài icon
      if (
        pickerWrapperRef.current &&
        !pickerWrapperRef.current.contains(e.target)
      ) {
        setShowPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  // hiện chat ra UI
  useEffect(() => {
    const fetChChat = async () => {
      const res = await getData("/chat");
      if (res.success) {
        setChat(res.data);
      }
    };
    fetChChat();
  }, []);
  // Gửi tin nhắn đến server
  const { roomChatId } = useParams();
  const handleMessage = async () => {
    if (socketConnection) {
      const base64List = await convertImagesToBase64();
      socketConnection.emit("CLIENT_SEND_MESSAGE", {
        message,
        images: base64List,
        roomChatId: roomChatId || null,
      });
      // tắt typing ngay lập tức
      socketConnection.emit("CLIENT_SEND_TYPING", false);
      setTyping((prev) => (prev ? { ...prev, type: false } : prev));
      setMessage("");
      input.current.value = "";
      setImages([]);
    }
  };

  //lấy tin nhắn từ server gửi về
  useEffect(() => {
    if (!socketConnection) return;

    const handleMessage = (data) => {
      const formatted = {
        ...data,
        user_id:
          typeof data.user_id === "object"
            ? data.user_id
            : { _id: data.user_id, avatar: data.avatar },
        _id: data._id || new Date().getTime(),
        createdAt: new Date(),
      };
      setChat((prev) => [...prev, formatted]);
    };
    const handleTyping = (data) => {
      setTyping(data);
    };
    socketConnection.on("SERVER_RETURN_MASSAGE", handleMessage);
    socketConnection.on("SERVER_RETURN_TYPING", handleTyping);
    return () => {
      socketConnection.off("SERVER_RETURN_MASSAGE", handleMessage);
      socketConnection.off("SERVER_RETURN_TYPING", handleTyping);
    };
  }, [socketConnection]);

  //luôn cuộn xuống dưới
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat, typing]);

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
      <div className=" flex-1 px-5 bg-blue-50 flex flex-col gap-2 overflow-y-auto pt-2">
        {chat.map((item, index) => {
          const isMe = item.user_id._id === state._id;

          return (
            <div
              key={index}
              className={`flex ${isMe ? "justify-end" : "gap-2"} mb-2`}
            >
              {!isMe && (
                <img
                  src={item.user_id.avatar || "https://i.pravatar.cc/40"}
                  className="w-8 h-8 rounded-full"
                />
              )}

              <div
                className={`${
                  isMe
                    ? "bg-blue-100 rounded-xl rounded-br-none"
                    : "bg-white rounded-xl rounded-bl-none"
                } p-2 max-w-[60%]`}
              >
                {/* Nội dung text */}
                {item.content && <div className="mb-1">{item.content}</div>}

                {/* HIỂN THỊ ẢNH */}
                {item.images?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-1">
                    <PhotoProvider>
                      {item.images.map((img, i) => (
                        <PhotoView key={i} src={img.url}>
                          <img
                            src={img.url}
                            className="w-32 h-32 rounded-md object-cover"
                          />
                        </PhotoView>
                      ))}
                    </PhotoProvider>
                  </div>
                )}

                {/* Thời gian */}
                <div className="text-[11px] text-gray-500 mt-1 text-right">
                  {new Date(item.createdAt).toLocaleTimeString("vi-VN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            </div>
          );
        })}

        {/* typing ui */}
        {typing.type == true && (
          <div className=" flex gap-1 items-center">
            <div className="flex gap-2">
              <img
                src={typing.avatar || "https://i.pravatar.cc/40"}
                alt="avatar"
                className="w-5 h-5 rounded-full"
              />
              <div className="text-[13px] text-gray-700">Đang soạn tin</div>
            </div>
            <div className=" dot-typing">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}

        {/* điểm cuộn đến */}
        <div ref={bottomRef}></div>
      </div>

      <div className="flex flex-col border-t-2 h-[13%]">
        <div
          ref={pickerWrapperRef}
          className="p-3 relative border-b-2 flex gap-6"
        >
          <SiIconify
            className="text-[18px] cursor-pointer"
            onClick={() => setShowPicker(!showPicker)}
          />
          {showPicker && (
            <div className="absolute top-[-470px] left-3 z-50">
              <EmojiPicker
                open={showPicker}
                onEmojiClick={onEmojiClick}
                autoFocusSearch={false}
                theme="dark"
              />
            </div>
          )}
          <ImageUploading
            multiple
            value={images}
            onChange={onChange}
            maxNumber={maxNumber}
            dataURLKey="data_url"
          >
            {({
              imageList,
              onImageUpload,
              onImageUpdate,
              onImageRemove,
              dragProps,
            }) => (
              <div className="upload__image-wrapper">
                {/* ICON chọn ảnh */}
                <GrImage
                  className="text-[18px] cursor-pointer relative"
                  onClick={onImageUpload}
                  {...dragProps}
                />
                {images.length > 0 && (
                  <>
                    {" "}
                    {/* Hiển thị preview ảnh */}
                    <div className="flex gap-2 mt-3 left-4 flex-wrap absolute top-[-100px] bg-gray-300 py-2 px-4 rounded-md">
                      {imageList.map((image, index) => (
                        <div key={index} className="relative">
                          <img
                            src={image.data_url}
                            alt=""
                            className="w-20 h-20 object-cover rounded-md"
                          />

                          {/* nút xóa */}
                          <button
                            onClick={() => onImageRemove(index)}
                            className="absolute top-0 right-0 bg-red-500 text-white text-xs px-1 rounded"
                          >
                            X
                          </button>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </ImageUploading>

          <FiPaperclip className="text-[18px] cursor-pointer" />
          <MdOutlineOndemandVideo className="text-[18px] cursor-pointer" />
        </div>

        <div className="flex items-center gap-2 px-3 h-12">
          <input
            type="text"
            placeholder="Nhập tin nhắn gửi đến A"
            className="flex-1  border-none focus:outline-none"
            ref={input}
            onChange={handleInputChange}
            onKeyDown={(e) => e.key === "Enter" && handleMessage()}
            value={message}
          />
          {message.trim() !== "" || images.length > 0 ? (
            <IoSend
              className="text-blue-600 text-[23px]"
              onClick={handleMessage}
            />
          ) : (
            <FaRegThumbsUp className="text-blue-600 text-[25px] cursor-pointer" />
          )}
        </div>
      </div>
    </div>
  );
}
