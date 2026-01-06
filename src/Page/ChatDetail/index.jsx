import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogTitle,
  Divider,
  IconButton,
  TextField,
  Tooltip,
} from "@mui/material";
import { HiOutlineUserGroup } from "react-icons/hi2";
import { RiDeleteBin6Line } from "react-icons/ri";
import { SiIconify } from "react-icons/si";
import { GrImage } from "react-icons/gr";
import { FiDelete, FiPaperclip } from "react-icons/fi";
import { IoChevronDown, IoChevronDownSharp, IoSend } from "react-icons/io5";
import React, { useEffect, useState } from "react";
import { FaRegSmile, FaRegThumbsUp, FaRegUser } from "react-icons/fa";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Fade from "@mui/material/Fade";
import {
  MdAttachFile,
  MdDevicesFold,
  MdDriveFolderUpload,
  MdOutlineContentCopy,
  MdOutlineExitToApp,
  MdOutlineKeyboardDoubleArrowLeft,
  MdOutlineOndemandVideo,
} from "react-icons/md";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import InfoUser from "../../Components/infoUser";
import { useRef } from "react";
import { getData, patchData, postData } from "../../utils/api";
//emoji
import EmojiPicker from "emoji-picker-react";
//image
import ImageUploading from "react-images-uploading";
//viewer image
import { PhotoProvider, PhotoView } from "react-photo-view";
import "react-photo-view/dist/react-photo-view.css";
import { BsThreeDots } from "react-icons/bs";
import { AiOutlineEdit, AiOutlineUsergroupAdd } from "react-icons/ai";
import AddGroup from "../../Components/AddGroup";
import AddMember from "../../Components/AddMember";
import { toast } from "react-toastify";

export default function ChatDetail() {
  const [openInfo, setOpenInfo] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [openMenu, setOpenMenu] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState([]);
  const state = useSelector((state) => state.user);
  const socketConnection = state.socketConnection;
  const navigate = useNavigate();
  const params = useParams();
  const { roomChatId } = useParams();
  //online/offline user
  const onlineUsers = useSelector((state) => state.online.users);
  //update time- render mỗi phút
  const [, forceRender] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      forceRender((v) => v + 1);
    }, 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  //menu chat
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const [anchorElUser, setAnchorElUser] = React.useState(null);
  const openUser = Boolean(anchorElUser);
  const handleClickUser = (event) => {
    setAnchorElUser(event.currentTarget);
  };
  const handleCloseUser = () => {
    setAnchorElUser(null);
  };
  //end menu chat
  //dialog edit chat info
  const [openDialog, setOpenDialog] = React.useState(false);

  const handleClickOpen = () => {
    setOpenDialog(true);
  };

  const handleCloseOpen = () => {
    setOpenDialog(false);
  };
  //end dialog
  const [buttonActive, setButtonActive] = useState(false);
  const [showMember, setShowMember] = useState(false);
  const [openGroup, setOpenGroup] = useState(false);
  const input = useRef();
  const bottomRef = useRef(null);
  const [dataUser, setDataUser] = useState([]);
  const [message, setMessage] = useState("");
  const [showPicker, setShowPicker] = useState(false);
  const pickerRef = useRef(null);
  const pickerWrapperRef = useRef(null);
  const [openImages, setOpenImages] = useState(true);
  const [openFiles, setOpenFiles] = useState(true);
  const [chat, setChat] = useState([]);
  const [roomInfo, setRoomInfo] = useState({});
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

  //edit rooms

  const [loadingAvatar, setLoadingAvatar] = useState(false);
  const [formInfo, setFormInfo] = useState({
    title: roomInfo.title || "",
    image: null,
  });
  const handleInputChangeRoom = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") {
      setFormInfo((prev) => ({
        ...prev,
        image: files[0],
      }));
    } else {
      setFormInfo((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };
  const handleConfirm = async () => {
    try {
      const formData = new FormData();
      formData.append("title", formInfo.title);

      if (formInfo.image) {
        formData.append("image", formInfo.image);
      }

      const res = await patchData("/auth/editRoom/" + roomChatId, formData);
      if (res.success) {
        socketConnection.emit("CLIENT_UPDATE_ROOM_INFO", {
          roomChatId,
          title: res.data.title,
          avatar: res.data.avatar,
        });
        setOpenDialog(false);
      }
    } catch (error) {
      console.error("Upload failed:", error);
    }
  };

  //end edit rooms

  //server return info room
  const updateRoom = (data) => {
    setRoomInfo((prev) => ({
      ...prev,
      ...data,
    }));
  };

  useEffect(() => {
    if (!socketConnection) return;

    const handleNewMessage = (msg) => {
      setChat((prev) => [...prev, msg]);
    };

    const handleRoomUpdated = ({ title, avatar }) => {
      updateRoom({ title, avatar });
    };
    const handleRoomUpdateUser = ({ roomChat, users }) => {
      setDataUser((prev) => {
        const existingIds = prev.map((u) => u.user_id._id);

        const newUsers = users.filter(
          (u) => !existingIds.includes(u.user_id._id)
        );

        return [...prev, ...newUsers];
      });
    };
    const handleRoomremoveUser = ({
      roomChatId,
      users,
      removedUserId,
      action,
    }) => {
      setDataUser(users);
    };

    socketConnection.on("SERVER_NEW_MESSAGE", handleNewMessage);
    socketConnection.on("SERVER_ROOM_UPDATED", handleRoomUpdated);
    socketConnection.on("SERVER_ROOM_UPDATED_USER", handleRoomUpdateUser);
    socketConnection.on("SERVER_ROOM_REMOVE_USERS", handleRoomremoveUser);
    return () => {
      socketConnection.off("SERVER_NEW_MESSAGE", handleNewMessage);
      socketConnection.off("SERVER_ROOM_UPDATED", handleRoomUpdated);
      socketConnection.off("SERVER_ROOM_UPDATED_USER", handleRoomUpdateUser);
      socketConnection.off("SERVER_ROOM_REMOVE_USERS", handleRoomremoveUser);
    };
  }, [socketConnection]);
  //end

  //end
  const renderSystemMessage = (msg) => {
    const isMe = msg.user_id._id === state._id;

    switch (msg.action) {
      case "rename_group":
        return `${isMe ? "Bạn" : msg.user_id.name} đã đổi tên nhóm thành "${
          msg.content
        }"`;

      case "add_member": {
        const names = msg.content_user
          ?.map((u) => (u._id === state._id ? "bạn" : u.name))
          .join(", ");

        return `${isMe ? "Bạn" : msg.user_id.name} đã thêm ${names} vào nhóm`;
      }

      case "leave_group":
        return `${msg.user_id.name} đã rời khỏi nhóm`;
      case "remove_member":
        const names = msg.content_user
          ?.map((u) => (u._id === state._id ? "bạn" : u.name))
          .join(", ");
        return `${
          isMe ? "Bạn" : msg.user_id.name
        } đã xóa ${names} ra khỏi nhóm`;
      default:
        return "";
    }
  };

  //typing input
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

  //upload file
  const handleSendFile = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    // 1️ Thêm file vào state uploading
    const tempFiles = files.map((file) => ({
      id: file.name + "-" + Date.now(), // đảm bảo id duy nhất cho lần upload này
      name: file.name,
      status: "uploading",
    }));

    setUploadingFiles((prev) => [...prev, ...tempFiles]);

    // 2️ Tạo FormData
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));

    try {
      const res = await postData(`/chat/${roomChatId}`, formData);

      if (res.success) {
        e.target.value = "";
        // 3️ Xoá spinner khi upload xong
        setUploadingFiles([]);

        // 4️ Gửi message qua socket
        socketConnection.emit("CLIENT_SEND_MESSAGE", {
          message,
          images: "",
          roomChatId: roomChatId || null,
          file: res.data,
        });
      } else {
        // Nếu BE trả về lỗi, set status error
        setUploadingFiles((prev) =>
          prev.map((f) =>
            tempFiles.some((t) => t.id === f.id) ? { ...f, status: "error" } : f
          )
        );
      }
    } catch (error) {
      // Nếu upload lỗi, set status = error
      setUploadingFiles((prev) =>
        prev.map((f) =>
          tempFiles.some((t) => t.id === f.id) ? { ...f, status: "error" } : f
        )
      );
    }
  };

  //end upload file

  // hiện chat ra UI
  useEffect(() => {
    const fetchChat = async () => {
      try {
        const res = await getData(`/chat/${roomChatId}`);
        if (res.success) {
          setChat(res.data);
          setDataUser(res.users);
          setRoomInfo(res.room);
        }
      } catch (error) {
        if (error.response?.data?.link) {
          navigate(error.response.data.link);
        }
      }
    };

    fetchChat();
  }, [roomChatId]);

  // Gửi tin nhắn đến server
  const handleMessage = async () => {
    if (socketConnection) {
      const base64List = await convertImagesToBase64();
      socketConnection.emit("CLIENT_SEND_MESSAGE", {
        message,
        images: base64List,
        roomChatId: roomChatId || null,
        file: "",
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

        // đảm bảo luôn là array
        images: Array.isArray(data.images) ? data.images : [],
        files: Array.isArray(data.files) ? data.files : [],

        _id: data._id || Date.now(),
        createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
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

  //thời gian hoạt động trước đó
  const timeAgo = (date) => {
    if (!date) return "";
    const diff = Date.now() - new Date(date).getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    if (minutes < 1) return `Vừa xong`;
    if (minutes < 60) return `Truy cập ${minutes} phút trước`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `Truy cập ${hours} giờ trước`;
    const days = Math.floor(hours / 24);
    return `Truy cập ${days} ngày trước`;
  };
  //luôn cuộn xuống dưới
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat, typing]);

  //button info chat
  const handleClickInfoChat = () => {
    setButtonActive(!buttonActive);
    setShowMember(false);
  };
  //show member
  const handleShowMember = () => {
    setShowMember(!showMember);
  };
  // Is Admin?
  const isCurrentUserAdmin = dataUser.some(
    (u) => u.user_id._id === state._id && u.role === "admin"
  );
  //remove member
  const handleRemoveUser = async (item) => {
    try {
      const res = await patchData(`/auth/removeMember/${roomChatId}`, {
        memberId: item.user_id._id,
      });
      if (res.success) {
        socketConnection.emit("CLIENT_REMOVE_MEMBER", {
          roomChatId,
          member: item.user_id._id,
        });
      }
    } catch (error) {
      if (error.response) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Không thể kết nối server!");
      }
    }
  };
  //leave group
  const handleLeaveGroup = async (item) => {
    try {
      const res = await patchData(`/auth/leaveGroup/${roomChatId}`, {
        memberId: item.user_id._id,
      });
      if (res.success) {
        socketConnection.emit("CLIENT_LEAVE_GROUP", {
          roomChatId,
        });
      }
    } catch (error) {
      if (error.response) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Không thể kết nối server!");
      }
    }
  };
  return (
    <div className="w-full h-screen flex">
      <div
        className={`flex flex-col h-full ${
          buttonActive || showMember ? "w-2/3" : "w-full"
        } border-r`}
      >
        <div className="flex h-[11%] items-center justify-between px-5 py-1 border-b flex-shrink-0">
          <div className="flex gap-3 relative">
            {roomInfo.typeRoom === "group" ? (
              <div className="flex gap-3 relative">
                <img
                  src={
                    roomInfo.avatar ||
                    "https://jbagy.me/wp-content/uploads/2025/03/Hinh-anh-avatar-nam-cute-5-1.jpg"
                  }
                  alt="avatar"
                  className="w-[45px] rounded-full cursor-pointer"
                  onClick={() => setOpenInfo(true)}
                />

                <div className="flex flex-col justify-between">
                  <div className="text-[16px] font-[500] flex gap-2 items-center group">
                    <span className="cursor-pointer">{roomInfo.title}</span>

                    <AiOutlineEdit
                      onClick={handleClickOpen}
                      className=" text-[18px] opacity-0  group-hover:opacity-100 transition-opacity duration-200 cursor-pointer"
                    />
                    <Dialog
                      open={openDialog}
                      onClose={handleCloseOpen}
                      aria-labelledby="alert-dialog-title"
                      aria-describedby="alert-dialog-description"
                    >
                      <div className="flex p-3 cursor-pointer text-[17px] font-[500]">
                        Chỉnh sửa thông tin nhóm
                      </div>
                      <Divider sx={{ my: 0.2 }} />
                      <div className="px-6 pb-4 py-5">
                        <div className="text-[15px] text-gray-700 text-center mb-3">
                          Bạn chắc muốn sửa thông tin nhóm chứ? Thông tin sau
                          khi chỉnh sửa sẽ được hiển thị với tất cả thành viên.
                        </div>
                        <TextField
                          name="title"
                          id="standard-basic"
                          label="Tên nhóm"
                          variant="standard"
                          size="small"
                          className=" w-full"
                          value={formInfo.title || roomInfo.title || ""}
                          onChange={handleInputChangeRoom}
                        />
                        <div className="flex gap-4 items-center  py-4">
                          <div className="text-[15px] text-gray-600">
                            Ảnh đại diện nhóm:
                          </div>
                          <div className="relative">
                            <img
                              src={
                                formInfo.image
                                  ? URL.createObjectURL(formInfo.image)
                                  : roomInfo.avatar ||
                                    "https://jbagy.me/wp-content/uploads/2025/03/Hinh-anh-avatar-nam-cute-5-1.jpg"
                              }
                              alt="avatar"
                              className=" block rounded-full w-[90px] border-2"
                            />

                            <div
                              className="overlay rounded-full absolute top-0 left-0 w-full h-full
                                  z-50 bg-[rgba(0,0,0,0.7)] flex items-center justify-center
                                  cursor-pointer opacity-0 transition-all hover:opacity-80"
                            >
                              <MdDriveFolderUpload className="text-white text-[25px]" />
                              <input
                                type="file"
                                accept="image/*"
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                name="image"
                                onChange={handleInputChangeRoom}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      <Divider sx={{ my: 0.2 }} />
                      <DialogActions>
                        <Button onClick={handleCloseOpen}>Hủy</Button>
                        <Button onClick={handleConfirm} autoFocus>
                          Xác nhận
                        </Button>
                      </DialogActions>
                    </Dialog>
                  </div>

                  <div
                    className="text-[14px] text-gray-700 flex gap-1 cursor-pointer items-center hover:text-blue-500"
                    onClick={handleShowMember}
                  >
                    <FaRegUser />
                    {dataUser.length} thành viên
                  </div>
                </div>
              </div>
            ) : (
              <>
                {dataUser?.map((item) => {
                  const presence = onlineUsers[item.user_id._id];

                  const isOnline = presence?.status === "online";
                  const lastActive = presence?.lastActive;
                  return (
                    <div className="flex gap-3 relative">
                      <img
                        src={
                          item.user_id.avatar ||
                          "https://jbagy.me/wp-content/uploads/2025/03/Hinh-anh-avatar-nam-cute-5-1.jpg"
                        }
                        alt="avatar"
                        className="w-[45px] rounded-full cursor-pointer"
                        onClick={() => setOpenInfo(true)}
                      />

                      <InfoUser
                        open={openInfo}
                        onClose={() => setOpenInfo(false)}
                        user={item.user_id}
                        type="client"
                      />

                      <div className="flex flex-col justify-between">
                        <div className="text-[16px] font-[500]">
                          {roomInfo.typeGroup === "group" ? (
                            <>{roomInfo.title}</>
                          ) : (
                            item.user_id.name
                          )}
                        </div>

                        {isOnline ? (
                          <div className="text-[14px] text-gray-700">
                            Đang hoạt động
                          </div>
                        ) : (
                          <div className="text-[14px] text-gray-700">
                            {lastActive
                              ? timeAgo(lastActive)
                              : timeAgo(item.user_id.lastActive)}
                          </div>
                        )}
                      </div>

                      {isOnline && (
                        <span className="w-2 h-2 bg-green-600 rounded-full absolute left-9 bottom-1"></span>
                      )}
                    </div>
                  );
                })}
              </>
            )}
          </div>

          <Button>
            <MdDevicesFold
              className={`text-[20px] ${
                buttonActive ? "text-blue-500" : "text-gray-500"
              }`}
              onClick={handleClickInfoChat}
            />
          </Button>
        </div>
        <div className=" flex-1 px-5 bg-blue-50 flex flex-col  gap-2 overflow-y-auto pt-2">
          {chat.map((item, index) => {
            if (item.type === "system") {
              return (
                <div key={item._id} className="flex justify-center my-3">
                  <span className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
                    {renderSystemMessage(item)}
                  </span>
                </div>
              );
            }
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
                  className={`group relative ${
                    isMe
                      ? "bg-blue-100 rounded-xl rounded-br-none"
                      : "bg-white rounded-xl rounded-bl-none"
                  } p-2 max-w-[60%]`}
                >
                  {/* Nội dung text */}

                  {item.content && <div className="mb-1">{item.content}</div>}

                  <Tooltip title="Xem thêm" placement="bottom-start">
                    <div
                      className={`
                      absolute top-1/2 -translate-y-1/2
                      ${isMe ? "-left-10 " : "-right-10"}
                      opacity-0 group-hover:opacity-100
                      transition-opacity cursor-pointer
                      rounded-full bg-white p-1 border border-gray-100
                    `}
                      aria-controls={open ? "fade-menu" : undefined}
                      aria-haspopup="true"
                      aria-expanded={open ? "true" : undefined}
                      onClick={handleClick}
                    >
                      <BsThreeDots />
                    </div>
                  </Tooltip>

                  <Menu
                    id="fade-menu"
                    slotProps={{
                      list: {
                        "aria-labelledby": "fade-button",
                      },
                    }}
                    slots={{ transition: Fade }}
                    anchorEl={anchorEl}
                    open={open}
                    onClose={handleClose}
                  >
                    <MenuItem
                      onClick={handleClose}
                      className="flex items-center gap-3 !text-blue-500 !text-[14px]"
                    >
                      <MdOutlineContentCopy />
                      Sao chép
                    </MenuItem>
                    <MenuItem
                      onClick={handleClose}
                      className="flex items-center gap-3 !text-red-600 !text-[14px]"
                    >
                      <FiDelete />
                      Xóa tin nhắn
                    </MenuItem>
                  </Menu>

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
                  {/* Hiển thị File */}

                  {/* Hiển thị file đã gửi (item.files) */}
                  {item?.files?.map((f, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 p-2 rounded hover:bg-gray-100 transition-colors cursor-pointer"
                    >
                      <MdAttachFile className="text-blue-500" />
                      <a
                        href={f.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 underline break-all hover:text-blue-800"
                      >
                        {f.name}
                      </a>
                      <span className="text-gray-400 text-xs">
                        ({(f.size / 1024).toFixed(1)} KB)
                      </span>
                    </div>
                  ))}

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
          {/* Hiển thị file đang upload */}
          {uploadingFiles.map((file) => (
            <div className="flex justify-end">
              <div
                key={file.id}
                className="flex items-center gap-2 p-2 rounded hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <MdAttachFile className="text-gray-500" />
                <span className="text-sm text-gray-700 break-all">
                  {file.name}
                </span>

                {/* Chỉ hiện spinner nếu đang upload */}
                {file.status === "uploading" && (
                  <svg
                    className="animate-spin h-4 w-4 text-gray-500 ml-1"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    />
                  </svg>
                )}
              </div>
            </div>
          ))}
          {/* typing ui */}
          {typing.type == true && (
            <div className=" flex gap-1 mt-auto items-center">
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

            <label htmlFor="upload-file">
              <FiPaperclip className="text-[18px] cursor-pointer hover:text-blue-500" />
            </label>
            <input
              type="file"
              id="upload-file"
              hidden
              multiple
              onChange={handleSendFile}
            />

            <MdOutlineOndemandVideo
              className="text-[18px] cursor-pointer"
              onClick={() => {
                toast.error(
                  "Sorry bạn nha. Vì dùng cloud free nên sợ không đủ dung lượng nên mình chưa làm chức năng này hehe :)"
                );
              }}
            />
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
      {(buttonActive || showMember) &&
        (showMember && roomInfo.typeRoom === "group" ? (
          <div className="w-1/3 h-full overflow-y-auto">
            <div className="flex h-[11%] gap-8 items-center border-b px-5 py-1 ">
              <MdOutlineKeyboardDoubleArrowLeft
                className="text-[25px]"
                onClick={() => {
                  setShowMember(!showMember);
                }}
              />
              <div className=" font-[500] text-[17px] text-gray-700">
                Thành viên nhóm
              </div>
            </div>
            <div className="py-3 px-3">
              <Button
                variant="contained"
                size="small"
                fullWidth
                sx={{
                  display: "flex",
                  gap: 1,
                }}
                onClick={() => {
                  setOpenGroup(true); // mở modal
                }}
              >
                <AiOutlineUsergroupAdd className="text-[18px]" />
                Thêm thành viên
              </Button>
              <AddMember
                open={openGroup}
                onClose={() => setOpenGroup(false)}
                roomChatId={roomChatId}
                dataUser={dataUser}
              />
              <div className="text-[15px] py-5 text-gray-700">
                Danh sách thành viên ({dataUser.length})
              </div>
              <div className="overflow-y-auto">
                {dataUser?.map((item) => {
                  const isMyself = item.user_id._id === state._id;

                  return (
                    <div
                      key={item._id}
                      className="flex gap-2 items-center mb-4 relative group"
                    >
                      <img
                        src={
                          item.user_id.avatar ||
                          "https://jbagy.me/wp-content/uploads/2025/03/Hinh-anh-avatar-nam-cute-5-1.jpg"
                        }
                        className="w-[37px] rounded-full"
                      />

                      <div className="flex flex-col">
                        <span className="text-[13px] font-[700]">
                          {isMyself ? "Bạn" : item.user_id.name}
                        </span>
                        {item.role === "admin" && (
                          <span className="text-[13px] text-gray-500">
                            Trưởng nhóm
                          </span>
                        )}
                      </div>

                      {/* NÚT 3 CHẤM */}
                      {(isMyself || isCurrentUserAdmin) && (
                        <div
                          className="
            absolute right-2 top-1/2 -translate-y-1/2
            opacity-0 group-hover:opacity-100
            cursor-pointer rounded-full bg-white p-1 border
          "
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuId(item.user_id._id);
                            setOpenMenu(!openMenu);
                          }}
                        >
                          <BsThreeDots />
                        </div>
                      )}

                      {/* MENU */}
                      {openMenuId == item.user_id._id && openMenu && (
                        <div
                          className="
            absolute right-2 top-6 mt-2 z-50
            bg-white border rounded-md shadow-md
            min-w-[140px]
          "
                        >
                          {/* RỜI NHÓM: chỉ cho chính mình */}
                          {isMyself && (
                            <div
                              className="px-3 py-1 hover:bg-gray-100 cursor-pointer text-[14px]"
                              onClick={() => {
                                setOpenMenuId(null);
                                handleLeaveGroup(item);
                              }}
                            >
                              Rời nhóm
                            </div>
                          )}

                          {/* XÓA KHỎI NHÓM: chỉ admin & không xóa chính mình */}
                          {isCurrentUserAdmin && !isMyself && (
                            <div
                              className="px-3 py-1 hover:bg-gray-100 cursor-pointer text-[14px] text-red-500"
                              onClick={() => {
                                setOpenMenuId(null);
                                handleRemoveUser(item);
                              }}
                            >
                              Xóa khỏi nhóm
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="w-1/3 h-full overflow-y-auto">
            <div className="flex h-[11%] items-center justify-center  px-5 py-1 border-b font-[500] text-[17px] text-gray-700">
              Thông tin hội thoại
            </div>
            {roomInfo.typeRoom === "group" ? (
              <>
                <div className="flex flex-col items-center gap-3  py-5 border-b-8">
                  <img
                    src={
                      roomInfo.avatar ||
                      "https://jbagy.me/wp-content/uploads/2025/03/Hinh-anh-avatar-nam-cute-5-1.jpg"
                    }
                    alt="avatar"
                    className="w-[45px] rounded-full cursor-pointer"
                    onClick={() => setOpenInfo(true)}
                  />
                  {/* <InfoUser
                  open={openInfo}
                  onClose={() => setOpenInfo(false)}
                  user={item.user_id}
                  type="client"
                /> */}
                  <div className="flex gap-3 ml-8">
                    <div className="text-[16px] font-[500]">
                      {roomInfo.title}
                    </div>
                    <AiOutlineEdit
                      onClick={handleClickOpen}
                      className=" text-[18px]  cursor-pointer"
                    />
                  </div>
                </div>
                <div className=" text-gray-700 border-b-8 pt-2 ">
                  <span className="text-[15px] font-[500] px-4  py-2 my-2">
                    Thành viên nhóm
                  </span>
                  <div className="flex gap-3 text-[14px] hover:bg-gray-100 cursor-pointer p-3">
                    <HiOutlineUserGroup className="text-[22px]" />
                    <div onClick={handleShowMember}>
                      {dataUser.length} thành viên
                    </div>
                  </div>
                </div>
                <div className="px-5 py-4 text-gray-700 border-b-8">
                  <div
                    className="flex items-center justify-between cursor-pointer select-none"
                    onClick={() => setOpenImages(!openImages)}
                  >
                    <span className="font-medium">Ảnh</span>
                    <IoChevronDownSharp
                      className={`  transition-transform duration-200
                    ${openImages ? "rotate-180" : ""}`}
                    />
                  </div>
                  {openImages && (
                    <div className="flex gap-1 pt-2 overflow-y-auto h-[100px] flex-wrap">
                      {chat.map((item, index) => {
                        const isMe = item.user_id._id === state._id;

                        return (
                          <div key={index} className="">
                            {item.images && item.images.length > 0 && (
                              <div className="mb-1 flex gap-2 ">
                                {item.images.map((image, idx) => (
                                  <img
                                    key={idx}
                                    src={image.url}
                                    alt="chat-image"
                                    className="w-20 h-20 rounded-md object-cover flex"
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
                <div className="px-5 py-4 text-gray-700 border-b-8">
                  <div
                    className="flex items-center justify-between cursor-pointer select-none"
                    onClick={() => setOpenFiles(!openFiles)}
                  >
                    <span className="font-medium">File</span>
                    <IoChevronDownSharp
                      className={`  transition-transform duration-200
                    ${openFiles ? "rotate-180" : ""}`}
                    />
                  </div>
                  {openFiles && (
                    <div className="flex gap-1 pt-2 overflow-y-auto h-[100px] flex-wrap">
                      {chat.map((item, index) => {
                        const isMe = item.user_id._id === state._id;

                        return (
                          <div key={index} className="">
                            {item.files && item.files.length > 0 && (
                              <div className="mb-1  ">
                                {item.files.map((f, idx) => (
                                  <div
                                    key={idx}
                                    className="flex items-center gap-2 p-2 rounded hover:bg-gray-100 transition-colors cursor-pointer"
                                  >
                                    <MdAttachFile className="text-blue-500" />
                                    <a
                                      href={f.url}
                                      rel="noopener noreferrer"
                                      className="text-sm text-blue-600 underline break-all hover:text-blue-800"
                                    >
                                      {f.name}
                                    </a>
                                    <span className="text-gray-400 text-xs">
                                      ({(f.size / 1024).toFixed(1)} KB)
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
                {dataUser?.map((item, idx) => {
                  const isMe = item.user_id._id == state._id;
                  const isAdmin = item.role == "admin";
                  return (
                    <>
                      {isAdmin && isMe && (
                        <div
                          key={idx}
                          className="px-5 pt-4 cursor-pointer flex items-center gap-2 text-[16px] text-red-700 "
                        >
                          <RiDeleteBin6Line />
                          Giải tán nhóm
                        </div>
                      )}
                      {isMe && (
                        <div
                          onClick={() => {
                            handleLeaveGroup(item);
                          }}
                          className="px-5 py-4 flex items-center gap-2 text-[16px] text-red-700 cursor-pointer"
                        >
                          <MdOutlineExitToApp />
                          Rời nhóm
                        </div>
                      )}
                    </>
                  );
                })}
              </>
            ) : (
              <>
                {dataUser?.map((item) => (
                  <>
                    <div className="flex flex-col gap-3 items-center justify-center py-5 border-b-8">
                      <img
                        src={
                          item.user_id.avatar ||
                          "https://jbagy.me/wp-content/uploads/2025/03/Hinh-anh-avatar-nam-cute-5-1.jpg"
                        }
                        alt="avatar"
                        className="w-[45px] rounded-full cursor-pointer"
                        onClick={() => setOpenInfo(true)}
                      />
                      <InfoUser
                        open={openInfo}
                        onClose={() => setOpenInfo(false)}
                        user={item.user_id}
                        type="client"
                      />
                      <div className="text-[16px] font-[500]">
                        {roomInfo.typeGroup === "group" ? (
                          <>{roomInfo.title}</>
                        ) : (
                          item.user_id.name
                        )}
                      </div>
                    </div>
                    <div className="flex item-center gap-2 px-5 py-4 text-gray-700 border-b-8">
                      <HiOutlineUserGroup className="text-[22px]" />
                      <span className="text-[15px]">1 nhóm chung</span>
                    </div>
                    <div className="px-5 py-4 text-gray-700 border-b-8">
                      Ảnh
                      <div className="flex gap-1">
                        {chat.map((item, index) => {
                          const isMe = item.user_id._id === state._id;

                          return (
                            <div key={index}>
                              {item.images && item.images.length > 0 && (
                                <div className="mb-1 flex gap-2 flex-wrap">
                                  {item.images.map((image, idx) => (
                                    <img
                                      key={idx}
                                      src={image.url}
                                      alt="chat-image"
                                      className="w-20 h-20 rounded-md object-cover"
                                    />
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    <div className="px-5 py-4 text-gray-700 border-b-8">
                      <div
                        className="flex items-center justify-between cursor-pointer select-none"
                        onClick={() => setOpenFiles(!openFiles)}
                      >
                        <span className="font-medium">File</span>
                        <IoChevronDownSharp
                          className={`  transition-transform duration-200
                    ${openFiles ? "rotate-180" : ""}`}
                        />
                      </div>
                      {openFiles && (
                        <div className="flex gap-1 pt-2 overflow-y-auto h-[100px] flex-wrap">
                          {chat.map((item, index) => {
                            const isMe = item.user_id._id === state._id;

                            return (
                              <div key={index} className="">
                                {item.files && item.files.length > 0 && (
                                  <div className="mb-1  ">
                                    {item.files.map((f, idx) => (
                                      <div
                                        key={idx}
                                        className="flex items-center gap-2 p-2 rounded hover:bg-gray-100 transition-colors cursor-pointer"
                                      >
                                        <MdAttachFile className="text-blue-500" />
                                        <a
                                          href={f.url}
                                          rel="noopener noreferrer"
                                          className="text-sm text-blue-600 underline break-all hover:text-blue-800"
                                        >
                                          {f.name}
                                        </a>
                                        <span className="text-gray-400 text-xs">
                                          ({(f.size / 1024).toFixed(1)} KB)
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                    <div className="px-5 py-4 flex items-center gap-2 text-[16px] text-red-700 ">
                      <RiDeleteBin6Line />
                      Xóa lịch sử trò chuyện
                    </div>
                  </>
                ))}
              </>
            )}
          </div>
        ))}
    </div>
  );
}
