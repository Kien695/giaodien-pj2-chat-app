import {
  Avatar,
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  styled,
  Tab,
  Tabs,
  TextField,
  Tooltip,
} from "@mui/material";

import { HiOutlineUserGroup } from "react-icons/hi2";
import { RiDeleteBin6Line } from "react-icons/ri";
import { SiIconify, SiTruenas } from "react-icons/si";
import { GrImage } from "react-icons/gr";
import {
  FiDelete,
  FiDownload,
  FiFileText,
  FiPaperclip,
  FiSend,
} from "react-icons/fi";
import {
  IoArrowBack,
  IoChevronDown,
  IoChevronDownSharp,
  IoClose,
  IoSearchCircleOutline,
  IoSend,
} from "react-icons/io5";
import React, { useEffect, useState } from "react";
import {
  FaRegSmile,
  FaRegThumbsUp,
  FaRegUser,
  FaLink,
  FaRegCopy,
  FaShareAlt,
  FaRegFolderOpen,
} from "react-icons/fa";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Fade from "@mui/material/Fade";
import {
  MdAttachFile,
  MdDevicesFold,
  MdDriveFolderUpload,
  MdOutlineContentCopy,
  MdOutlineExitToApp,
  MdOutlineKeyboardArrowLeft,
  MdOutlineKeyboardDoubleArrowLeft,
  MdOutlineOndemandVideo,
  MdOutlineSettings,
} from "react-icons/md";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import InfoUser from "../../Components/infoUser";
import { useRef } from "react";
import { deleteData, getData, patchData, postData } from "../../utils/api";

//emoji
import EmojiPicker from "emoji-picker-react";
//image
import ImageUploading from "react-images-uploading";
//viewer image
import { PhotoProvider, PhotoView } from "react-photo-view";
import "react-photo-view/dist/react-photo-view.css";
import { BsThreeDots } from "react-icons/bs";
import {
  AiFillLike,
  AiOutlineEdit,
  AiOutlineUsergroupAdd,
} from "react-icons/ai";
import QRCode from "react-qr-code";
import AddGroup from "../../Components/AddGroup";
import AddMember from "../../Components/AddMember";
import { toast } from "react-toastify";
import { socket } from "../../socket";
import { CiSettings } from "react-icons/ci";
import { FaLinkSlash } from "react-icons/fa6";
import useIsMobile from "../../Components/IsMobile";
import CallDialog from "../../Components/CallDialog";
import { LuPhone, LuVideo } from "react-icons/lu";
import {
  CHAT_FILE_ACCEPT,
  IMAGE_ACCEPT,
  validateChatFilesForUpload,
  validateImageForUpload,
} from "../../utils/uploadValidation";
import { filterChatRooms } from "../../utils/filterChatRooms";
import { formatLastActive } from "../../utils/formatLastActive";
import { formatSystemMessage } from "../../utils/formatSystemMessage";

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialogContent-root": {
    padding: theme.spacing(2),
  },
  "& .MuiDialogActions-root": {
    padding: theme.spacing(1),
  },
}));

export default function ChatDetail() {
  const menuRef = useRef(null);
  const isMobile = useIsMobile();
  const [openInfo, setOpenInfo] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [openMenu, setOpenMenu] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState([]);
  const [callType, setCallType] = useState(null);

  const state = useSelector((state) => state.user);

  const navigate = useNavigate();
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
  const [selectedMessageId, setSelectedMessageId] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);

  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (messageId, message) => {
    setSelectedMessageId(messageId);
    setSelectedMessage(message);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleCopy = async () => {
    handleClose();

    if (!selectedMessage) return;

    try {
      // Nếu là tin nhắn ảnh
      if (selectedMessage.images?.length > 0) {
        const response = await fetch(selectedMessage.images[0].url);
        const blob = await response.blob();

        await navigator.clipboard.write([
          new ClipboardItem({
            [blob.type]: blob,
          }),
        ]);

        toast.success("Đã sao chép ảnh");
      }
      // Nếu là tin nhắn text
      else {
        await navigator.clipboard.writeText(selectedMessage.content);
        toast.success("Đã sao chép");
      }
    } catch (err) {
      console.error(err);
      toast.error("Không thể sao chép");
    }
  };

  const handleDeleteMessage = () => {
    // emit socket delete
    socket.emit("CLIENT_REMOVE_MESSAGE", { selectedMessageId, roomChatId });
    handleClose();
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
  const pickerWrapperRef = useRef(null);
  const [openImages, setOpenImages] = useState(true);
  const [openFiles, setOpenFiles] = useState(true);
  const [chat, setChat] = useState([]);
  const [roomInfo, setRoomInfo] = useState({});
  const [typing, setTyping] = useState({});
  const [images, setImages] = useState([]);
  const [commonGroupCount, setCommonGroupCount] = useState(0);
  const maxNumber = 5;
  const typingTimeoutRef = useRef(null);

  const emitChatMessage = (payload, { optimistic = true } = {}) => {
    const clientMessageId = window.crypto.randomUUID();
    const isCurrentRoom =
      !Array.isArray(payload.roomChatId) &&
      payload.roomChatId?.toString() === roomChatId?.toString();

    if (optimistic && isCurrentRoom) {
      setChat((previous) => [
        ...previous,
        {
          _id: `pending-${clientMessageId}`,
          clientMessageId,
          user_id: { _id: state._id, avatar: state.avatar },
          content: payload.message,
          images: [],
          files: Array.isArray(payload.file) ? payload.file : [],
          type: payload.type,
          createdAt: new Date(),
          deleted: false,
          deliveryStatus: "pending",
        },
      ]);
    }

    socket.emit(
      "CLIENT_SEND_MESSAGE",
      { ...payload, clientMessageId },
      (acknowledgement) => {
        const delivered = acknowledgement?.success === true;
        setChat((previous) =>
          previous.map((item) =>
            item.clientMessageId === clientMessageId
              ? {
                  ...item,
                  deliveryStatus: delivered ? "sent" : "failed",
                }
              : item,
          ),
        );
        if (!delivered) {
          toast.error("Không thể gửi tin nhắn");
        }
      },
    );

    return clientMessageId;
  };

  const onEmojiClick = (emojiData) => {
    setMessage((prev) => prev + emojiData.emoji);
    if (socket) {
      socket.emit("CLIENT_SEND_TYPING", true);
    }
    // bật typing ngay
    setTyping(true);

    // reset timeout 3s
    resetTyping();
  };

  //edit rooms
  const [loading, setLoading] = useState(false);
  const [formInfo, setFormInfo] = useState({
    title: roomInfo.title || "",
    image: null,
  });

  const handleInputChangeRoom = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") {
      const validationError = validateImageForUpload(files[0]);
      if (validationError) {
        toast.error(validationError);
        e.target.value = "";
        return;
      }
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
    if (loading) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", formInfo.title);

      if (formInfo.image) {
        formData.append("image", formInfo.image);
      }

      const res = await patchData("/auth/editRoom/" + roomChatId, formData);
      if (res.success) {
        setOpenDialog(false);
      }
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setLoading(false);
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
    if (!socket) return;

    const handleNewMessage = (msg) => {
      setChat((prev) => [...prev, msg]);
    };

    const handleRoomUpdated = ({ title, avatar }) => {
      updateRoom({ title, avatar });
    };
    const handleRoomUpdateUser = ({ users }) => {
      setDataUser((prev) => {
        const existingIds = prev.map((u) => u.user_id._id);

        const newUsers = users.filter(
          (u) => !existingIds.includes(u.user_id._id),
        );

        return [...prev, ...newUsers];
      });
    };
    const handleRoomremoveUser = ({ users }) => {
      setDataUser(users);
    };

    socket.on("SERVER_NEW_MESSAGE", handleNewMessage);
    socket.on("SERVER_ROOM_UPDATED", handleRoomUpdated);
    socket.on("SERVER_ROOM_UPDATED_USER", handleRoomUpdateUser);
    socket.on("SERVER_ROOM_REMOVE_USERS", handleRoomremoveUser);
    return () => {
      socket.off("SERVER_NEW_MESSAGE", handleNewMessage);
      socket.off("SERVER_ROOM_UPDATED", handleRoomUpdated);
      socket.off("SERVER_ROOM_UPDATED_USER", handleRoomUpdateUser);
      socket.off("SERVER_ROOM_REMOVE_USERS", handleRoomremoveUser);
    };
  }, []);
  //end

  //render message


  //typing input
  const resetTyping = () => {
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      setTyping(false);
      if (socket) socket.emit("CLIENT_SEND_TYPING", false);
    }, 3000);
  };
  const handleInputChange = (e) => {
    const value = e.target.value;
    setMessage(value);

    if (socket) {
      socket.emit("CLIENT_SEND_TYPING", !!value);
    }
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
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenu(null);
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
    const validationError = validateChatFilesForUpload(files);
    if (validationError) {
      toast.error(validationError);
      e.target.value = "";
      return;
    }

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
        console.log(res.data);
        // 4️ Gửi message qua socket
        emitChatMessage({
          message,
          images: "",
          roomChatId: roomChatId || null,
          file: res.data,
          type: "file",
        });
      } else {
        // Nếu BE trả về lỗi, set status error
        setUploadingFiles((prev) =>
          prev.map((f) =>
            tempFiles.some((t) => t.id === f.id)
              ? { ...f, status: "error" }
              : f,
          ),
        );
      }
    } catch {
      // Nếu upload lỗi, set status = error
      setUploadingFiles((prev) =>
        prev.map((f) =>
          tempFiles.some((t) => t.id === f.id) ? { ...f, status: "error" } : f,
        ),
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
          setCommonGroupCount(res.commonGroupCount);
        }
      } catch (error) {
        if (error.response?.data?.link) {
          navigate(error.response.data.link);
        }
      }
    };

    fetchChat();
  }, [navigate, roomChatId]);

  //dán ảnh
  const handlePaste = async (e) => {
    const items = e.clipboardData.items;

    for (const item of items) {
      if (item.type.startsWith("image/")) {
        const file = item.getAsFile();

        const reader = new FileReader();

        reader.onload = () => {
          setImages((prev) => [
            ...prev,
            {
              file,
              data_url: reader.result,
            },
          ]);
        };

        reader.readAsDataURL(file);
      }
    }
  };
  // Gửi tin nhắn đến server
  const handleMessage = async () => {
    if (socket) {
      const base64List = await convertImagesToBase64();
      emitChatMessage({
        message,
        images: base64List,
        roomChatId: roomChatId || null,
        file: "",
        type: "text",
      });
      // tắt typing ngay lập tức
      socket.emit("CLIENT_SEND_TYPING", false);

      setMessage("");
      input.current.value = "";
      setImages([]);
    }
  };
  const handleSendLike = () => {
    emitChatMessage({
      message,
      images: "",
      roomChatId: roomChatId || null,
      file: "",
      type: "emoji",
    });
  };

  //lấy tin nhắn từ server gửi về
  useEffect(() => {
    if (!socket) return;

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
        deleted: false,
        _id: data._id || Date.now(),
        createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
      };

      setChat((prev) => {
        const pendingIndex = prev.findIndex(
          (item) =>
            item.clientMessageId &&
            item.clientMessageId === formatted.clientMessageId,
        );
        if (pendingIndex === -1) {
          return [...prev, { ...formatted, deliveryStatus: "sent" }];
        }

        const next = [...prev];
        next[pendingIndex] = { ...formatted, deliveryStatus: "sent" };
        return next;
      });
    };

    const handleTyping = (data) => {
      setTyping(data);
    };
    const handleRemoveMeassage = (selectedMessageId) => {
      setChat((prev) =>
        prev.map((msg) =>
          msg._id === selectedMessageId ? { ...msg, deleted: true } : msg,
        ),
      );
    };
    socket.on("SERVER_RETURN_MASSAGE", handleMessage);
    socket.on("SERVER_RETURN_TYPING", handleTyping);
    socket.on("SERVER_MESSAGE_DELETED", handleRemoveMeassage);
    return () => {
      socket.off("SERVER_RETURN_MASSAGE", handleMessage);
      socket.off("SERVER_RETURN_TYPING", handleTyping);
      socket.off("SERVER_MESSAGE_DELETED", handleRemoveMeassage);
    };
  }, []);

  //thời gian hoạt động trước đó

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
    (u) => u.user_id._id === state._id && u.role === "admin",
  );
  //remove member
  const handleRemoveUser = async (item) => {
    try {
      const res = await patchData(`/auth/removeMember/${roomChatId}`, {
        memberId: item.user_id._id,
      });
      if (!res.success) return;
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
      if (!res.success) return;
    } catch (error) {
      if (error.response) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Không thể kết nối server!");
      }
    }
  };
  //remove group
  const handleRemoveGroup = async () => {
    try {
      const res = await deleteData(`/auth/removeRoom/${roomChatId}`);
      if (res.success) {
        toast.success(res.message || "Xóa thành công!");
      }
    } catch (error) {
      if (error.response) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Không thể kết nối server!");
      }
    }
  };
  //dark/mode && avatarBG
  const { mode: theme, useAvatarBg } = useSelector((state) => state.theme);

  //link mời
  const [tab, setTab] = useState(0);
  const [rooms, setRooms] = useState([]);
  const [formSend, setFormSend] = useState({
    listRoom: [],
  });
  const handleTickSend = (room) => {
    setFormSend((prev) => {
      const exists = prev.listRoom.includes(room._id);

      return {
        ...prev,
        listRoom: exists
          ? prev.listRoom.filter((id) => id !== room._id)
          : [...prev.listRoom, room._id],
      };
    });
  };
  //get all room chat
  useEffect(() => {
    const fetchRoomChat = async () => {
      try {
        const response = await getData("/auth/getAllRoomChat");
        if (response.success) {
          setRooms(response.data);
        }
      } catch (error) {
        console.error("Lỗi khi lấy danh sách phòng chat:", error);
      }
    };
    fetchRoomChat();
  }, []);
  const filteredRooms = filterChatRooms(rooms, tab);
  const [openInvite, setOpenInvite] = useState(false);
  const inviteUrl = `${window.location.origin}/invite/${roomInfo?.inviteToken}`;
  const handleCopyInvite = () => {
    navigator.clipboard
      .writeText(inviteUrl)
      .then(() => {
        toast.success("Đã sao chép liên kết");
      })
      .catch(() => {
        toast.error("Không thể sao chép liên kết");
      });
  };

  const handleSendLink = async () => {
    if (socket) {
      emitChatMessage({
        images: "",
        file: "",
        roomChatId: formSend.listRoom,
        message: inviteUrl,
        type: "invite",
      }, { optimistic: false });
      setFormSend({
        listRoom: [],
      });
    }
  };

  // Enter group
  const handleEnterGroup = () => {};

  return (
    <React.Fragment>
      <div
        className={`chat-detail w-full h-screen flex min-w-0 ${
          theme == "dark" ? "bg-[#22262b] text-[#cbced3]" : ""
        } `}
      >
        <div
          className={`flex  flex-col h-full border-r ${
            buttonActive || showMember ? "hidden md:flex md:w-2/3" : "w-full"
          }`}
        >
          <div className="chat-header flex h-[72px] items-center justify-between px-5 py-1 border-b flex-shrink-0">
            <div className="flex gap-3 relative">
              {roomInfo.typeRoom === "group" ? (
                <div className="flex gap-3 relative">
                  {isMobile ? (
                    <button
                      onClick={() => navigate("/chat")}
                      className="p-1 rounded-full hover:bg-gray-200"
                    >
                      <IoArrowBack size={26} />
                    </button>
                  ) : (
                    <img
                      src={
                        roomInfo.avatar ||
                        "https://jbagy.me/wp-content/uploads/2025/03/Hinh-anh-avatar-nam-cute-5-1.jpg"
                      }
                      alt="avatar"
                      className="w-[45px] rounded-full cursor-pointer"
                      onClick={() => setOpenInfo(true)}
                    />
                  )}

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
                            khi chỉnh sửa sẽ được hiển thị với tất cả thành
                            viên.
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
                                  accept={IMAGE_ACCEPT}
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
                          <Button
                            disabled={loading}
                            onClick={handleConfirm}
                            autoFocus
                          >
                            {loading ? (
                              <div className="flex gap-2">
                                <CircularProgress size={20} color="inherit" />{" "}
                                Đang xử lí...
                              </div>
                            ) : (
                              "Cập nhật"
                            )}
                          </Button>
                        </DialogActions>
                      </Dialog>
                    </div>

                    <div
                      className={`text-[14px] ${
                        theme == "dark" ? "text-[#8b96a5]" : "text-gray-700"
                      } flex gap-1 cursor-pointer items-center hover:text-blue-500`}
                      onClick={handleShowMember}
                    >
                      <FaRegUser />
                      {dataUser.length} thành viên
                    </div>
                  </div>
                </div>
              ) : roomInfo.typeRoom == "friend" ? (
                <>
                  {dataUser?.map((item, index) => {
                    const presence = onlineUsers[item.user_id._id];

                    const isOnline = presence?.status === "online";
                    const lastActive = presence?.lastActive;
                    return (
                      <div className="flex gap-3 relative" key={index}>
                        {isMobile ? (
                          <button
                            onClick={() => navigate("/chat")}
                            className="p-1 rounded-full hover:bg-gray-200"
                          >
                            <IoArrowBack size={26} />
                          </button>
                        ) : (
                          <img
                            src={
                              item.user_id.avatar ||
                              "https://jbagy.me/wp-content/uploads/2025/03/Hinh-anh-avatar-nam-cute-5-1.jpg"
                            }
                            alt="avatar"
                            className="w-[45px] rounded-full cursor-pointer"
                            onClick={() => setOpenInfo(true)}
                          />
                        )}

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
                            <div
                              className={`text-[14px] ${
                                theme == "dark"
                                  ? "text-[#8b96a5]"
                                  : "text-gray-700"
                              }`}
                            >
                              Đang hoạt động
                            </div>
                          ) : (
                            <div
                              className={`text-[14px] ${
                                theme == "dark"
                                  ? "text-[#8b96a5]"
                                  : "text-gray-700"
                              }`}
                            >
                              {lastActive
                                ? formatLastActive(lastActive)
                                : formatLastActive(item.user_id.lastActive)}
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
              ) : (
                <div className="flex gap-3 relative">
                  {isMobile ? (
                    <button
                      onClick={() => navigate("/chat")}
                      className="p-1 rounded-full hover:bg-gray-200"
                    >
                      <IoArrowBack size={26} />
                    </button>
                  ) : (
                    <img
                      src={
                        roomInfo.avatar ||
                        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ-zvsfyRJwofBZJROisGYWZXLdBygcVh9Wgw&s"
                      }
                      alt="avatar"
                      className="w-[45px] rounded-full cursor-pointer"
                    />
                  )}

                  <div className="flex flex-col justify-between">
                    <div className="text-[16px] font-[500] flex gap-2 items-center group">
                      <span className="cursor-pointer">{roomInfo.title}</span>
                    </div>

                    <div
                      className={`text-[14px] ${
                        theme == "dark" ? "text-[#8b96a5]" : "text-gray-700"
                      } flex gap-1 cursor-pointer items-center `}
                    >
                      Dành cho công việc riêng
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-1">
              {roomInfo.typeRoom !== "system" && (
                <>
                  <Tooltip title="Gọi thoại">
                    <button
                      className="chat-header-action"
                      onClick={() => setCallType("voice")}
                      aria-label="Gọi thoại"
                    >
                      <LuPhone />
                    </button>
                  </Tooltip>
                  <Tooltip title="Gọi video">
                    <button
                      className="chat-header-action"
                      onClick={() => setCallType("video")}
                      aria-label="Gọi video"
                    >
                      <LuVideo />
                    </button>
                  </Tooltip>
                </>
              )}
              <Tooltip title="Thông tin hội thoại">
                <button
                  className={`chat-header-action ${buttonActive ? "is-active" : ""}`}
                  onClick={handleClickInfoChat}
                  aria-label="Thông tin hội thoại"
                >
                  <MdDevicesFold />
                </button>
              </Tooltip>
            </div>
          </div>
          <div
            className={`message-canvas flex-1 px-5 ${
              theme === "dark" ? "bg-[#16191d]" : "bg-blue-50"
            } flex flex-col gap-2 overflow-y-auto pt-2`}
            style={{
              backgroundRepeat: "no-repeat",
              backgroundSize: "cover",
              backgroundPosition: "center",

              //  CHỈ hiện avatar khi switch = true
              backgroundImage:
                useAvatarBg && state.avatar ? `url(${state.avatar})` : "none",

              //  fallback màu nền
              backgroundColor: theme === "dark" ? "#16191d" : "#eff6ff",
            }}
          >
            {chat.map((item, index) => {
              if (item.type === "system") {
                return (
                  <div key={item._id} className="flex justify-center my-3">
                    <span className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
                      {formatSystemMessage(item, state._id)}
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
                      src={
                        item.user_id.avatar ||
                        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSsGuNeeq7R_EoWkiZPOvfRF5B0ZSbLCwRAnA&s"
                      }
                      className="w-6 h-6 md:w-8 md:h-8 rounded-full"
                    />
                  )}

                  <div
                    className={`message-bubble group relative ${
                      item?.files?.length > 0 ? "has-files" : ""
                    } ${
                      isMe
                        ? `${
                            theme === "dark" ? "bg-[#1f344d]" : "bg-blue-100"
                          } rounded-xl rounded-br-none`
                        : `${
                            theme === "dark" ? "bg-[#262b30]" : "bg-white"
                          }  rounded-xl rounded-bl-none`
                    } p-2 max-w-[60%]`}
                  >
                    {/* Nội dung text */}

                    {item.deleted ? (
                      <i className="text-gray-400">Tin nhắn đã bị xóa</i>
                    ) : (
                      <>
                        {item.type === "emoji" ? (
                          <div className="text-4xl">
                            <AiFillLike className="text-yellow-500" />
                          </div>
                        ) : (
                          <div
                            className={`${
                              theme === "dark" ? "text-white" : "text-gray-600"
                            } mb-1`}
                          >
                            {item.type === "invite" ? (
                              <div className="p-3 rounded-lg border">
                                <QRCode value={item.content} size={120} />
                                <Button onClick={handleEnterGroup}>
                                  Tham gia nhóm
                                </Button>
                              </div>
                            ) : (
                              item.content
                            )}
                          </div>
                        )}

                        {/* HIỂN THỊ ẢNH */}
                        {item.images?.length > 0 && (
                          <div
                            className={`message-gallery mt-2 ${
                              item.images.length === 1 ? "is-single" : ""
                            }`}
                          >
                            <PhotoProvider>
                              {item.images.map((img, i) => (
                                <PhotoView key={i} src={img.url}>
                                  <img
                                    src={img.url}
                                    alt={`Ảnh đã gửi ${i + 1}`}
                                    loading="lazy"
                                    className="message-gallery-image"
                                  />
                                </PhotoView>
                              ))}
                            </PhotoProvider>
                          </div>
                        )}
                        {/* Hiển thị File */}

                        {/* Hiển thị file đã gửi (item.files) */}
                        {item?.files?.length > 0 && (
                          <div className="mt-2 flex flex-col gap-2">
                            {item.files.map((f, i) => (
                              <a
                                key={i}
                                href={f.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`message-file-card ${theme === "dark" ? "is-dark" : ""}`}
                              >
                                <span className="message-file-icon">
                                  <FiFileText />
                                </span>
                                <span className="min-w-0 flex-1">
                                  <span className="block truncate text-sm font-medium text-slate-700">
                                    {f.name}
                                  </span>
                                  <span className="mt-0.5 block text-xs text-slate-400">
                                    {f.size >= 1048576
                                      ? `${(f.size / 1048576).toFixed(1)} MB`
                                      : `${(f.size / 1024).toFixed(1)} KB`}
                                  </span>
                                </span>
                                <span className="message-file-download">
                                  <FiDownload />
                                </span>
                              </a>
                            ))}
                          </div>
                        )}
                      </>
                    )}

                    <Tooltip title="Xem thêm" placement="bottom-start">
                      <div
                        className={`
                      absolute top-1/2 -translate-y-1/2
                      ${isMe ? "-left-10 " : "-right-10"}
                      opacity-0 group-hover:opacity-100
                      transition-opacity cursor-pointer
                      rounded-full  border ${
                        theme == "dark"
                          ? "bg-[#2e3034] border-gray-700"
                          : "bg-white border-gray-200"
                      } p-1  
                    `}
                        aria-controls={open ? "fade-menu" : undefined}
                        aria-haspopup="true"
                        aria-expanded={open ? "true" : undefined}
                        onClick={() => {
                          handleClick(item._id, item);
                          setOpenMenu(openMenu === item._id ? null : item._id);
                        }}
                      >
                        <BsThreeDots />
                      </div>
                    </Tooltip>

                    <div className="relative">
                      {openMenu === item._id && !item.deleted && (
                        <div
                          ref={menuRef}
                          className={`absolute bottom-0 w-44 rounded-lg bg-white shadow-lg border z-50 ${
                            isMe ? "right-full mr-2" : "left-full ml-2"
                          }`}
                        >
                          {!item.files?.length && item.type !== "invite" && (
                            <button
                              onClick={handleCopy}
                              className="flex w-full items-center gap-3 px-4 py-2 hover:bg-gray-100 text-blue-500"
                            >
                              <MdOutlineContentCopy />
                              Sao chép
                            </button>
                          )}
                          <button
                            onClick={() => setOpenInvite(true)}
                            className="flex w-full items-center gap-3 px-4 py-2 hover:bg-gray-100 text-green-600"
                          >
                            <FiSend />
                            Gửi
                          </button>
                          {isMe && (
                            <button
                              onClick={handleDeleteMessage}
                              className="flex w-full items-center gap-3 px-4 py-2 hover:bg-gray-100 text-red-600"
                            >
                              <FiDelete />
                              Xóa tin nhắn
                            </button>
                          )}
                        </div>
                      )}
                    </div>
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
                  className={`flex items-center gap-2 p-2 rounded  ${
                    theme ? "hover:bg-[#2d3136]" : "hover:bg-gray-100"
                  } transition-colors cursor-pointer`}
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
                    src={
                      typing.avatar ||
                      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSsGuNeeq7R_EoWkiZPOvfRF5B0ZSbLCwRAnA&s"
                    }
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

          <div className="composer flex flex-col border-t h-[116px]">
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
                accept={CHAT_FILE_ACCEPT}
                value={images}
                onChange={onChange}
                maxNumber={maxNumber}
                dataURLKey="data_url"
              >
                {({
                  imageList,
                  onImageUpload,
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

              <MdOutlineOndemandVideo className="text-[18px] cursor-pointer" />
            </div>

            <div className="flex items-center gap-2  px-3 h-12">
              <input
                className={`flex-1 px-3 py-1 rounded outline-none ${
                  theme === "dark"
                    ? "bg-[#22262b] text-white "
                    : "bg-white text-black "
                }`}
                onPaste={handlePaste}
                type="text"
                placeholder="Nhập tin nhắn"
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
                <FaRegThumbsUp
                  className="text-blue-600 text-[25px] cursor-pointer"
                  onClick={handleSendLike}
                />
              )}
            </div>
          </div>
        </div>
        {(buttonActive || showMember) &&
          (showMember && roomInfo.typeRoom === "group" ? (
            <div className="w-full  md:w-1/3 h-full overflow-y-auto">
              <div className="flex h-[11%] gap-8 items-center border-b px-5 py-1 ">
                <MdOutlineKeyboardDoubleArrowLeft
                  className="text-[25px]"
                  onClick={() => {
                    setShowMember(!showMember);
                  }}
                />
                <div
                  className={`font-[500] text-[17px] ${
                    theme == "dark" ? "text-white" : "text-gray-700"
                  } `}
                >
                  Thành viên nhóm
                </div>
              </div>
              <div className="py-3 px-3 flex-1">
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
                <div
                  className={`text-[15px] py-5  ${
                    theme == "dark" ? "text-white" : "text-gray-700"
                  }`}
                >
                  Danh sách thành viên ({dataUser.length})
                </div>
                <div className="overflow-y-auto ">
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
          ) : roomInfo.typeRoom === "system" ? (
            <div className="w-full md:block md:w-1/3 h-full overflow-y-auto">
              <div
                className={`flex h-[11%] items-center justify-center px-5 py-1 border-b font-[500] text-[17px] ${
                  theme == "dark" ? "text-[#8b96a5]" : "text-gray-700"
                }`}
              >
                Thông tin hội thoại
              </div>

              <div className="flex flex-col items-center gap-3  py-5 border-b-8">
                <img
                  src={
                    roomInfo.avatar ||
                    "https://jbagy.me/wp-content/uploads/2025/03/Hinh-anh-avatar-nam-cute-5-1.jpg"
                  }
                  alt="avatar"
                  className="w-[45px] h-[45px] rounded-full cursor-pointer"
                />

                <div className="text-[16px] font-[500]">{roomInfo.title}</div>
              </div>

              <div className="px-5 py-4  border-b-8">
                <div
                  className="flex items-center justify-between cursor-pointer select-none"
                  onClick={() => setOpenImages(!openImages)}
                >
                  <span
                    className={`${
                      theme == "dark" ? "text-[#8b96a5]" : "text-gray-700"
                    }font-medium`}
                  >
                    Ảnh
                  </span>
                  <IoChevronDownSharp
                    className={`  transition-transform duration-200
                    ${openImages ? "rotate-180" : ""}`}
                  />
                </div>
                {openImages && (
                  <div className="flex gap-1 pt-2 overflow-y-auto h-[100px] flex-wrap">
                    {chat.map((item, index) => {
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
              <div
                className={`px-5 py-4  border-b-8 ${
                  theme == "dark" ? "text-[#8b96a5]" : "text-gray-700"
                }`}
              >
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
                  <div className="shared-file-list mt-3 flex max-h-[260px] flex-col gap-2 overflow-y-auto pr-1">
                    {chat
                      .filter((item) => item.files?.length > 0)
                      .map((item, index) => {
                        return (
                          <div key={index} className="">
                            {item.files && item.files.length > 0 && (
                              <div className="flex flex-col gap-2">
                                {item.files.map((f, idx) => (
                                  <a
                                    key={idx}
                                    href={f.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="conversation-file-card"
                                  >
                                    <span className="message-file-icon">
                                      <FiFileText />
                                    </span>
                                    <span className="min-w-0 flex-1">
                                      <span className="block truncate text-sm font-medium text-slate-700">
                                        {f.name}
                                      </span>
                                      <span className="mt-0.5 block text-xs text-slate-400">
                                        {f.size >= 1048576
                                          ? `${(f.size / 1048576).toFixed(1)} MB`
                                          : `${(f.size / 1024).toFixed(1)} KB`}
                                      </span>
                                    </span>
                                    <span className="message-file-download">
                                      <FiDownload />
                                    </span>
                                  </a>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="w-full md:block md:w-1/3 h-full overflow-y-auto">
              <div
                className={`flex h-[11%] items-center justify-between   px-5 py-1 border-b font-[500] text-[17px] ${
                  theme == "dark" ? "text-[#8b96a5]" : "text-gray-700"
                }`}
              >
                <MdOutlineKeyboardArrowLeft
                  className="text-[30px] cursor-pointer"
                  onClick={() => {
                    setButtonActive(false);
                  }}
                />
                Thông tin hội thoại
                <div></div>
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
                  <div
                    className={`${
                      theme == "dark" ? "text-[#8b96a5]" : "text-gray-700"
                    } border-b-8 pt-2`}
                  >
                    <span className="text-[15px] font-[500] px-4  py-2 my-2">
                      Thành viên nhóm
                    </span>
                    <div
                      className={`flex gap-3 text-[14px] ${
                        theme == "dark"
                          ? "hover:bg-[#2d3136]"
                          : "hover:bg-gray-100"
                      } cursor-pointer p-3`}
                    >
                      <HiOutlineUserGroup className="text-[22px]" />
                      <div onClick={handleShowMember}>
                        {dataUser.length} thành viên
                      </div>
                    </div>
                  </div>
                  <div className="px-5 py-4  border-b-8">
                    <div
                      className="flex items-center justify-between cursor-pointer select-none"
                      onClick={() => setOpenImages(!openImages)}
                    >
                      <span
                        className={`${
                          theme == "dark" ? "text-[#8b96a5]" : "text-gray-700"
                        }font-medium`}
                      >
                        Ảnh
                      </span>
                      <IoChevronDownSharp
                        className={`  transition-transform duration-200
                    ${openImages ? "rotate-180" : ""}`}
                      />
                    </div>
                    {openImages && (
                      <div className="flex gap-1 pt-2 overflow-y-auto h-[100px] flex-wrap">
                        {chat.map((item, index) => {
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
                  <div
                    className={`px-5 py-4  border-b-8 ${
                      theme == "dark" ? "text-[#8b96a5]" : "text-gray-700"
                    }`}
                  >
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
                      <div className="shared-file-list mt-3 flex max-h-[260px] flex-col gap-2 overflow-y-auto pr-1">
                        {chat
                          .filter((item) => item.files?.length > 0)
                          .map((item, index) => {
                            return (
                              <div key={index} className="">
                                {item.files && item.files.length > 0 && (
                                  <div className="flex flex-col gap-2">
                                    {item.files.map((f, idx) => (
                                      <a
                                        key={idx}
                                        href={f.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="conversation-file-card"
                                      >
                                        <span className="message-file-icon">
                                          <FiFileText />
                                        </span>
                                        <span className="min-w-0 flex-1">
                                          <span className="block truncate text-sm font-medium text-slate-700">
                                            {f.name}
                                          </span>
                                          <span className="mt-0.5 block text-xs text-slate-400">
                                            {f.size >= 1048576
                                              ? `${(f.size / 1048576).toFixed(1)} MB`
                                              : `${(f.size / 1024).toFixed(1)} KB`}
                                          </span>
                                        </span>
                                        <span className="message-file-download">
                                          <FiDownload />
                                        </span>
                                      </a>
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                      </div>
                    )}
                  </div>
                  <div className="px-5 py-2 flex items-center gap-2 text-[14px]  cursor-pointer">
                    <MdOutlineSettings />
                    Cài đặt nhóm
                  </div>
                  <hr />
                  <div className="px-5 py-4 border-b-8">
                    <div className="flex items-center gap-2 text-[14px]  mb-3">
                      <FaLink />
                      <span>Link nhóm</span>
                    </div>

                    <div
                      className={`rounded-lg border p-3 break-all text-sm ${
                        theme === "dark"
                          ? "bg-[#2d3136] border-[#3d434b] text-white"
                          : "bg-gray-50 border-gray-200 text-gray-700"
                      }`}
                    >
                      {inviteUrl}
                    </div>

                    <div className="flex gap-3 mt-3">
                      <button
                        onClick={handleCopyInvite}
                        className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition"
                      >
                        <FaRegCopy />
                        Sao chép
                      </button>

                      <button
                        onClick={() => setOpenInvite(true)}
                        className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border hover:bg-gray-100 dark:hover:bg-[#2d3136] transition"
                      >
                        <FaShareAlt />
                        Chia sẻ
                      </button>
                    </div>
                  </div>

                  <hr />
                  {dataUser?.map((item, idx) => {
                    const isMe = item.user_id._id == state._id;
                    const isAdmin = item.role == "admin";
                    return (
                      <div key={idx}>
                        {isAdmin && isMe && (
                          <div
                            key={idx}
                            className="px-5 pt-4 cursor-pointer flex items-center gap-2 text-[16px] text-red-700 "
                            onClick={handleRemoveGroup}
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
                      </div>
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
                      {commonGroupCount > 0 && (
                        <div className="flex item-center gap-2 px-5 py-4 text-gray-700 border-b-8">
                          <HiOutlineUserGroup className="text-[22px]" />
                          <span className="text-[15px]">
                            {commonGroupCount} nhóm chung
                          </span>
                        </div>
                      )}

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
                          <div className="shared-file-list mt-3 flex max-h-[200px] flex-col gap-2 overflow-y-auto pr-1">
                            {chat
                              .filter((item) => item.files?.length > 0)
                              .map((item, index) => {
                                return (
                                  <div key={index} className="">
                                    {item.files && item.files.length > 0 && (
                                      <div className="flex flex-col gap-2">
                                        {item?.files?.map((f, idx) => (
                                          <a
                                            key={idx}
                                            href={f.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="conversation-file-card"
                                          >
                                            <span className="message-file-icon">
                                              <FiFileText />
                                            </span>
                                            <span className="min-w-0 flex-1">
                                              <span className="block truncate text-sm font-medium text-slate-700">
                                                {f.name}
                                              </span>
                                              <span className="mt-0.5 block text-xs text-slate-400">
                                                {f.size >= 1048576
                                                  ? `${(f.size / 1048576).toFixed(1)} MB`
                                                  : `${(f.size / 1024).toFixed(1)} KB`}
                                              </span>
                                            </span>
                                            <span className="message-file-download">
                                              <FiDownload />
                                            </span>
                                          </a>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                          </div>
                        )}
                      </div>
                      <div className="px-5 py-4 cursor-pointer flex items-center gap-2 text-[16px] text-red-700 ">
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

      <BootstrapDialog
        aria-labelledby="customized-dialog-title"
        open={openInvite}
        transitionDuration={0}
        onClose={() => setOpenInvite(false)}
        PaperProps={{
          sx: {
            width: "450px",
            height: "min(680px, 88vh)",
            maxWidth: "90vw",
            borderRadius: "14px",
          },
        }}
      >
        <div className="flex h-14 items-center justify-between border-b border-slate-200 px-5">
          <div>
            <div className="text-base font-semibold text-slate-800">
              Chia sẻ
            </div>
            <div className="text-xs text-slate-500">
              Chọn cuộc trò chuyện để gửi
            </div>
          </div>
          <IconButton
            size="small"
            sx={{ color: "#667085", "&:hover": { backgroundColor: "#f2f4f7" } }}
            onClick={() => setOpenInvite(false)}
            aria-label="Đóng"
          >
            <IoClose className="text-[21px]" />
          </IconButton>
        </div>
        <DialogContent className="flex flex-col p-0">
          {/* Search */}
          <div className="px-4 pb-3 pt-4">
            <TextField
              fullWidth
              size="small"
              placeholder="Tìm kiếm cuộc trò chuyện"
              InputProps={{
                startAdornment: (
                  <IoSearchCircleOutline
                    fontSize="small"
                    className="mr-2 text-gray-500"
                  />
                ),
              }}
            />
          </div>

          {/* Tabs */}
          <div className="border-b border-slate-200 px-3">
            <Tabs
              value={tab}
              onChange={(e, value) => setTab(value)}
              variant="scrollable"
              scrollButtons={false}
            >
              <Tab label="Tất cả" />
              <Tab label="Nhóm trò chuyện" />
              <Tab label="Bạn bè" />
            </Tabs>
          </div>

          {/* List */}
          <div className="min-h-0 flex-1 overflow-y-auto px-2 py-2">
            <div className="flex flex-col gap-1">
              {filteredRooms.map((item) => (
                <div
                  key={item._id}
                  className={`share-room-item flex items-center gap-3 rounded-lg px-2 py-2 cursor-pointer ${formSend.listRoom.includes(item._id) ? "is-selected" : ""}`}
                  onClick={() => handleTickSend(item)}
                >
                  <Checkbox
                    size="small"
                    checked={formSend.listRoom.includes(item._id)}
                    onChange={() => handleTickSend(item)}
                    onClick={(event) => event.stopPropagation()}
                    sx={{
                      color: "#98a2b3",
                      "&.Mui-checked": { color: "#0068ff" },
                    }}
                  />

                  <Avatar src={item.avatar} sx={{ width: 42, height: 42 }} />

                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-slate-700">
                      {item.typeRoom === "friend"
                        ? item.users.find((u) => u.user_id?._id !== state._id)
                            ?.user_id?.name
                        : item.title}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
        <div className="flex min-h-16 items-center justify-between gap-3 border-t border-slate-200 px-4 py-3">
          <span className="text-xs text-slate-500">
            {formSend.listRoom.length > 0
              ? `Đã chọn ${formSend.listRoom.length} cuộc trò chuyện`
              : "Chưa chọn cuộc trò chuyện"}
          </span>
          <div className="flex gap-2">
            <Button
              variant="text"
              sx={{ color: "#475467", px: 2 }}
              onClick={() => setOpenInvite(false)}
            >
              Hủy
            </Button>
            <Button
              variant="contained"
              sx={{ backgroundColor: "#0068ff", px: 2.5 }}
              disabled={formSend.listRoom.length > 0 ? false : true}
              onClick={handleSendLink}
            >
              Chia sẻ
            </Button>
          </div>
        </div>
      </BootstrapDialog>
      <CallDialog
        open={Boolean(callType)}
        type={callType}
        dataUser={dataUser}
        roomInfo={roomInfo}
        onClose={() => setCallType(null)}
      />
    </React.Fragment>
  );
}
