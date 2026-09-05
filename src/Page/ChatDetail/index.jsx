import {
  Avatar,
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
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
import { SiIconify } from "react-icons/si";
import { GrImage, GrSearch } from "react-icons/gr";
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
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useState,
} from "react";
import {
  FaRegThumbsUp,
  FaRegUser,
  FaLink,
  FaRegCopy,
  FaShareAlt,
} from "react-icons/fa";
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

import AddMember from "../../Components/AddMember";
import { toast } from "react-toastify";
import { socket } from "../../socket";

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
import {
  appendUniqueMessages,
  prependUniqueMessages,
} from "../../utils/mergeMessagePages";
import MessageSearchPanel from "../../Components/MessageSearchPanel";

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialogContent-root": {
    padding: theme.spacing(2),
  },
  "& .MuiDialogActions-root": {
    padding: theme.spacing(1),
  },
}));

const MAX_MESSAGE_OUTBOX_SIZE = 100;
const MEDIA_OUTBOX_TTL_MS = 10 * 60 * 1000;
const MESSAGE_ACK_TIMEOUT_MS = 10 * 1000;

const renderHighlightedText = (content, keyword) => {
  if (!content || !keyword) return content;
  const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return String(content)
    .split(new RegExp(`(${escaped})`, "gi"))
    .map((part, index) =>
      index % 2 === 1 ? (
        <mark
          className="rounded bg-yellow-200 px-0.5 text-yellow-950 dark:bg-yellow-700 dark:text-yellow-50"
          key={`${part}-${index}`}
        >
          {part}
        </mark>
      ) : (
        part
      ),
    );
};

export default function ChatDetail() {
  const menuRef = useRef(null);
  const isMobile = useIsMobile();
  const [openInfo, setOpenInfo] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [openMenu, setOpenMenu] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState([]);
  const [callType, setCallType] = useState(null);
  const [messageSearchOpen, setMessageSearchOpen] = useState(false);
  const [activeSearchKeyword, setActiveSearchKeyword] = useState("");
  const [highlightedMessageId, setHighlightedMessageId] = useState(null);

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
  const messageCanvasRef = useRef(null);
  const pendingScrollRestoreRef = useRef(null);
  const shouldScrollToBottomRef = useRef(true);
  const isNearBottomRef = useRef(true);
  const stickToBottomRef = useRef(true);
  const initialRoomScrollRef = useRef(true);
  const activeRoomIdRef = useRef(roomChatId);
  const latestIncomingMessageRef = useRef(null);
  const syncCursorRef = useRef(null);
  const syncInFlightRef = useRef(false);
  const messageOutboxRef = useRef(new Map());
  const sendOutboxEntryRef = useRef(null);
  const [dataUser, setDataUser] = useState([]);
  const [message, setMessage] = useState("");
  const [showPicker, setShowPicker] = useState(false);
  const pickerWrapperRef = useRef(null);
  const [openImages, setOpenImages] = useState(true);
  const [openFiles, setOpenFiles] = useState(true);
  const [chat, setChat] = useState([]);
  const [messagePagination, setMessagePagination] = useState({
    nextCursor: null,
    hasMore: false,
    limit: 30,
  });
  const [isLoadingOlder, setIsLoadingOlder] = useState(false);
  const [newMessageCount, setNewMessageCount] = useState(0);
  const [roomInfo, setRoomInfo] = useState({});
  const [typing, setTyping] = useState({});
  const [images, setImages] = useState([]);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [commonGroupCount, setCommonGroupCount] = useState(0);
  const maxNumber = 5;
  const typingTimeoutRef = useRef(null);

  const handleCloseMessageSearch = () => {
    setMessageSearchOpen(false);
    setActiveSearchKeyword("");
    setHighlightedMessageId(null);
  };

  const handleOpenMobileMessageSearch = () => {
    setButtonActive(false);
    setShowMember(false);
    setMessageSearchOpen(true);
  };

  const handleSelectSearchResult = async (result, keyword) => {
    const requestedRoomId = roomChatId;
    try {
      const response = await getData(
        `/chat/${requestedRoomId}/messages/${encodeURIComponent(result._id)}/context`,
      );
      if (activeRoomIdRef.current !== requestedRoomId || !response.success)
        return;
      shouldScrollToBottomRef.current = false;
      stickToBottomRef.current = false;
      setActiveSearchKeyword(keyword);
      setHighlightedMessageId(response.targetMessageId);
      setChat((current) => {
        const messages = new Map();
        current.concat(response.data || []).forEach((messageItem) => {
          messages.set(messageItem._id?.toString(), messageItem);
        });
        return Array.from(messages.values()).sort((first, second) => {
          const timeDifference =
            new Date(first.createdAt) - new Date(second.createdAt);
          return (
            timeDifference ||
            String(first._id).localeCompare(String(second._id))
          );
        });
      });
    } catch {
      toast.error("Không thể mở tin nhắn này. Vui lòng thử lại.");
    }
  };

  const scrollToLatestMessage = useCallback((behavior = "smooth") => {
    const canvas = messageCanvasRef.current;
    if (!canvas) return;
    canvas.scrollTo({ top: canvas.scrollHeight, behavior });
    isNearBottomRef.current = true;
    stickToBottomRef.current = true;
    setNewMessageCount(0);
  }, []);

  const handleMessageCanvasScroll = () => {
    const canvas = messageCanvasRef.current;
    if (!canvas) return;
    const distanceFromBottom =
      canvas.scrollHeight - canvas.scrollTop - canvas.clientHeight;
    const isNearBottom = distanceFromBottom < 120;
    isNearBottomRef.current = isNearBottom;
    stickToBottomRef.current = isNearBottom;
    if (isNearBottom) setNewMessageCount(0);
  };

  const handleMessageMediaLoad = () => {
    if (stickToBottomRef.current) scrollToLatestMessage("auto");
  };

  const updateOutgoingStatus = (clientMessageId, deliveryStatus) => {
    setChat((previous) =>
      previous.map((item) =>
        item.clientMessageId === clientMessageId
          ? { ...item, deliveryStatus }
          : item,
      ),
    );
  };

  sendOutboxEntryRef.current = (entry) => {
    if (!entry || entry.inFlight || !socket.connected) return;

    if (entry.expiresAt && Date.now() >= entry.expiresAt) {
      messageOutboxRef.current.delete(entry.clientMessageId);
      updateOutgoingStatus(entry.clientMessageId, "failed");
      toast.error("Tệp đính kèm đã hết thời gian gửi lại");
      return;
    }

    entry.inFlight = true;
    entry.attempt += 1;
    const currentAttempt = entry.attempt;
    updateOutgoingStatus(entry.clientMessageId, "pending");

    socket
      .timeout(MESSAGE_ACK_TIMEOUT_MS)
      .emit(
        "CLIENT_SEND_MESSAGE",
        entry.payload,
        (timeoutError, acknowledgement) => {
          const queuedEntry = messageOutboxRef.current.get(
            entry.clientMessageId,
          );
          if (!queuedEntry || queuedEntry.attempt !== currentAttempt) return;

          queuedEntry.inFlight = false;
          if (timeoutError && !socket.connected) {
            updateOutgoingStatus(entry.clientMessageId, "queued");
            return;
          }

          messageOutboxRef.current.delete(entry.clientMessageId);
          const delivered = !timeoutError && acknowledgement?.success === true;
          updateOutgoingStatus(
            entry.clientMessageId,
            delivered ? "sent" : "failed",
          );
          if (!delivered) toast.error("Không thể gửi tin nhắn");
        },
      );
  };

  const emitChatMessage = (payload, { optimistic = true } = {}) => {
    if (messageOutboxRef.current.size >= MAX_MESSAGE_OUTBOX_SIZE) {
      toast.error("Hàng đợi gửi tin đã đầy, vui lòng chờ kết nối");
      return null;
    }

    const clientMessageId = window.crypto.randomUUID();
    const isCurrentRoom =
      !Array.isArray(payload.roomChatId) &&
      payload.roomChatId?.toString() === roomChatId?.toString();

    if (optimistic && isCurrentRoom) {
      shouldScrollToBottomRef.current = true;
      setChat((previous) => [
        ...previous,
        {
          _id: `pending-${clientMessageId}`,
          clientMessageId,
          user_id: { _id: state._id, avatar: state.avatar },
          content: payload.message,
          images: Array.isArray(payload.images) ? payload.images : [],
          files: Array.isArray(payload.file) ? payload.file : [],
          type: payload.type,
          createdAt: new Date(),
          deleted: false,
          deliveryStatus: socket.connected ? "pending" : "queued",
        },
      ]);
    }

    const hasMedia =
      (Array.isArray(payload.images) && payload.images.length > 0) ||
      (Array.isArray(payload.file) && payload.file.length > 0);
    const entry = {
      clientMessageId,
      payload: { ...payload, clientMessageId },
      inFlight: false,
      attempt: 0,
      expiresAt: hasMedia ? Date.now() + MEDIA_OUTBOX_TTL_MS : null,
    };
    messageOutboxRef.current.set(clientMessageId, entry);
    sendOutboxEntryRef.current(entry);

    return clientMessageId;
  };

  useEffect(() => {
    const flushMessageOutbox = () => {
      messageOutboxRef.current.forEach((entry) => {
        sendOutboxEntryRef.current(entry);
      });
    };
    const queueInFlightMessages = () => {
      messageOutboxRef.current.forEach((entry) => {
        entry.attempt += 1;
        entry.inFlight = false;
        updateOutgoingStatus(entry.clientMessageId, "queued");
      });
    };

    socket.on("connect", flushMessageOutbox);
    socket.on("disconnect", queueInFlightMessages);
    return () => {
      socket.off("connect", flushMessageOutbox);
      socket.off("disconnect", queueInFlightMessages);
    };
  }, []);

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
      shouldScrollToBottomRef.current = true;
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
  const onChange = (imageList) => {
    const validationError = imageList
      .map((image) => validateImageForUpload(image.file))
      .find(Boolean);
    if (validationError) {
      toast.error(validationError);
      return;
    }
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
    let active = true;
    activeRoomIdRef.current = roomChatId;
    latestIncomingMessageRef.current = null;
    syncCursorRef.current = null;
    pendingScrollRestoreRef.current = null;
    shouldScrollToBottomRef.current = true;
    isNearBottomRef.current = true;
    stickToBottomRef.current = true;
    initialRoomScrollRef.current = true;
    setNewMessageCount(0);
    setMessageSearchOpen(false);
    setActiveSearchKeyword("");
    setHighlightedMessageId(null);
    setIsLoadingOlder(false);
    setMessagePagination({ nextCursor: null, hasMore: false, limit: 30 });
    setChat([]);

    const fetchChat = async () => {
      try {
        const res = await getData(`/chat/${roomChatId}?limit=30`);
        if (active && res.success) {
          setChat(res.data);
          setMessagePagination(
            res.pagination || { nextCursor: null, hasMore: false, limit: 30 },
          );
          syncCursorRef.current = res.pagination?.syncCursor || null;
          setDataUser(res.users);
          setRoomInfo(res.room);
          setCommonGroupCount(res.commonGroupCount);

          const latestIncomingMessage = [...res.data]
            .reverse()
            .find(
              (item) =>
                item.type !== "system" &&
                (typeof item.user_id === "object"
                  ? item.user_id?._id
                  : item.user_id) !== state._id,
            );
          if (latestIncomingMessage?._id) {
            latestIncomingMessageRef.current = latestIncomingMessage;
            const receiptEvent =
              document.visibilityState === "visible"
                ? "CLIENT_READ_ROOM"
                : "CLIENT_MESSAGE_DELIVERED";
            socket.emit(receiptEvent, {
              roomChatId,
              messageId: latestIncomingMessage._id,
            });
          }
        }
      } catch (error) {
        if (active && error.response?.data?.link) {
          navigate(error.response.data.link);
        }
      }
    };

    fetchChat();
    return () => {
      active = false;
    };
  }, [navigate, roomChatId, state._id]);

  const handleLoadOlderMessages = async () => {
    if (
      isLoadingOlder ||
      !messagePagination.hasMore ||
      !messagePagination.nextCursor
    ) {
      return;
    }

    const requestedRoomId = roomChatId;
    const canvas = messageCanvasRef.current;
    if (canvas) {
      pendingScrollRestoreRef.current = {
        scrollHeight: canvas.scrollHeight,
        scrollTop: canvas.scrollTop,
      };
    }
    shouldScrollToBottomRef.current = false;
    setIsLoadingOlder(true);

    try {
      const cursor = encodeURIComponent(messagePagination.nextCursor);
      const res = await getData(
        `/chat/${requestedRoomId}?limit=${messagePagination.limit}&cursor=${cursor}`,
      );
      if (activeRoomIdRef.current !== requestedRoomId || !res.success) return;

      setChat((current) => prependUniqueMessages(current, res.data));
      setMessagePagination(res.pagination);
    } catch {
      pendingScrollRestoreRef.current = null;
      toast.error("Không thể tải tin nhắn cũ");
    } finally {
      if (activeRoomIdRef.current === requestedRoomId) {
        setIsLoadingOlder(false);
      }
    }
  };

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
    if (!socket || isUploadingImages) return;

    setIsUploadingImages(images.length > 0);
    try {
      let uploadedImages = [];
      if (images.length > 0) {
        const formData = new FormData();
        images.forEach((image) => formData.append("images", image.file));
        const response = await postData(`/chat/${roomChatId}/images`, formData);
        if (!response.success || !Array.isArray(response.data)) {
          throw new Error("Invalid image upload response");
        }
        uploadedImages = response.data;
      }

      emitChatMessage({
        message,
        images: uploadedImages,
        roomChatId: roomChatId || null,
        file: "",
        type: "text",
      });
      // tắt typing ngay lập tức
      socket.emit("CLIENT_SEND_TYPING", false);

      setMessage("");
      input.current.value = "";
      setImages([]);
    } catch {
      toast.error("Không thể tải ảnh lên");
    } finally {
      setIsUploadingImages(false);
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

      const senderId =
        typeof data.user_id === "object" ? data.user_id?._id : data.user_id;
      const isCurrentRoom =
        data.roomChatId?.toString() === activeRoomIdRef.current?.toString();
      if (
        isCurrentRoom &&
        (senderId === state._id || isNearBottomRef.current)
      ) {
        shouldScrollToBottomRef.current = true;
        stickToBottomRef.current = true;
        setNewMessageCount(0);
      } else if (isCurrentRoom) {
        stickToBottomRef.current = false;
        setNewMessageCount((count) => count + 1);
      }

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

      if (
        data.syncCursor &&
        data.roomChatId?.toString() === activeRoomIdRef.current?.toString()
      ) {
        syncCursorRef.current = data.syncCursor;
      }
      if (
        senderId !== state._id &&
        data.roomChatId?.toString() === activeRoomIdRef.current?.toString()
      ) {
        latestIncomingMessageRef.current = data;
        const receiptEvent =
          document.visibilityState === "visible"
            ? "CLIENT_READ_ROOM"
            : "CLIENT_MESSAGE_DELIVERED";
        socket.emit(receiptEvent, {
          roomChatId: data.roomChatId,
          messageId: data._id,
        });
      }
    };

    const handleMessageReceipt = (receipt) => {
      if (
        !["delivered", "read"].includes(receipt?.status) ||
        receipt.roomChatId?.toString() !== activeRoomIdRef.current?.toString()
      ) {
        return;
      }

      setChat((previous) =>
        previous.map((item) => {
          if (item._id?.toString() !== receipt.messageId?.toString()) {
            return item;
          }
          const deliveredBy = Array.from(
            new Set([...(item.deliveredBy || []), receipt.userId]),
          );
          if (receipt.status === "read") {
            const readBy = Array.from(
              new Set([...(item.readBy || []), receipt.userId]),
            );
            return {
              ...item,
              deliveryStatus: "read",
              deliveredBy,
              readBy,
            };
          }
          return item.deliveryStatus === "read"
            ? { ...item, deliveredBy }
            : { ...item, deliveryStatus: "delivered", deliveredBy };
        }),
      );
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
    socket.on("SERVER_MESSAGE_RECEIPT", handleMessageReceipt);
    return () => {
      socket.off("SERVER_RETURN_MASSAGE", handleMessage);
      socket.off("SERVER_RETURN_TYPING", handleTyping);
      socket.off("SERVER_MESSAGE_DELETED", handleRemoveMeassage);
      socket.off("SERVER_MESSAGE_RECEIPT", handleMessageReceipt);
    };
  }, [state._id]);

  useEffect(() => {
    const syncMissedMessages = async () => {
      const requestedRoomId = activeRoomIdRef.current;
      let cursor = syncCursorRef.current;
      if (!requestedRoomId || !cursor || syncInFlightRef.current) return;

      syncInFlightRef.current = true;
      try {
        for (let page = 0; page < 20; page += 1) {
          const response = await getData(
            `/chat/${requestedRoomId}/sync?limit=50&cursor=${encodeURIComponent(cursor)}`,
          );
          if (
            activeRoomIdRef.current !== requestedRoomId ||
            !response.success
          ) {
            return;
          }

          setChat((current) => appendUniqueMessages(current, response.data));
          cursor = response.pagination.nextCursor;
          syncCursorRef.current = cursor;

          const latestIncomingMessage = [...response.data]
            .reverse()
            .find(
              (item) =>
                item.type !== "system" &&
                (typeof item.user_id === "object"
                  ? item.user_id?._id
                  : item.user_id) !== state._id,
            );
          if (latestIncomingMessage) {
            latestIncomingMessageRef.current = latestIncomingMessage;
          }
          if (!response.pagination.hasMore) break;
        }

        const latestIncomingMessage = latestIncomingMessageRef.current;
        if (latestIncomingMessage?._id) {
          const receiptEvent =
            document.visibilityState === "visible"
              ? "CLIENT_READ_ROOM"
              : "CLIENT_MESSAGE_DELIVERED";
          socket.emit(receiptEvent, {
            roomChatId: requestedRoomId,
            messageId: latestIncomingMessage._id,
          });
        }
      } catch {
        // Keep the last successful cursor so the next reconnect can retry safely.
      } finally {
        syncInFlightRef.current = false;
      }
    };

    socket.on("connect", syncMissedMessages);
    return () => {
      socket.off("connect", syncMissedMessages);
    };
  }, [state._id]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      const latestIncomingMessage = latestIncomingMessageRef.current;
      if (
        document.visibilityState !== "visible" ||
        !latestIncomingMessage?._id
      ) {
        return;
      }
      socket.emit("CLIENT_READ_ROOM", {
        roomChatId: activeRoomIdRef.current,
        messageId: latestIncomingMessage._id,
      });
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  //thời gian hoạt động trước đó

  //luôn cuộn xuống dưới
  useLayoutEffect(() => {
    const canvas = messageCanvasRef.current;
    const pending = pendingScrollRestoreRef.current;

    if (canvas && pending) {
      canvas.scrollTop =
        canvas.scrollHeight - pending.scrollHeight + pending.scrollTop;
      pendingScrollRestoreRef.current = null;
      return;
    }

    if (shouldScrollToBottomRef.current && chat.length > 0) {
      scrollToLatestMessage(initialRoomScrollRef.current ? "auto" : "smooth");
      shouldScrollToBottomRef.current = false;
      initialRoomScrollRef.current = false;
    }
  }, [chat, scrollToLatestMessage]);

  useLayoutEffect(() => {
    if (!highlightedMessageId) return;
    const target = messageCanvasRef.current?.querySelector(
      `[data-message-id="${highlightedMessageId}"]`,
    );
    target?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [chat, highlightedMessageId]);

  useEffect(() => {
    const canvas = messageCanvasRef.current;
    if (!canvas || typeof ResizeObserver === "undefined") return undefined;
    let frameId;
    const observer = new ResizeObserver(() => {
      if (!stickToBottomRef.current) return;
      cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(() => scrollToLatestMessage("auto"));
    });
    canvas
      .querySelectorAll(".message-bubble")
      .forEach((element) => observer.observe(element));
    return () => {
      cancelAnimationFrame(frameId);
      observer.disconnect();
    };
  }, [chat, scrollToLatestMessage]);

  useEffect(() => {
    const canvas = messageCanvasRef.current;
    if (!canvas) return;

    const distanceFromBottom =
      canvas.scrollHeight - canvas.scrollTop - canvas.clientHeight;
    if (distanceFromBottom < 120) {
      scrollToLatestMessage("smooth");
    }
  }, [typing, scrollToLatestMessage]);

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
  const [openInvite, setOpenInvite] = useState(false);
  const [isLoadingShareRooms, setIsLoadingShareRooms] = useState(false);
  const shareRoomsLoadedRef = useRef(false);
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
    if (!openInvite || shareRoomsLoadedRef.current) return;
    let active = true;

    const fetchRoomChat = async () => {
      setIsLoadingShareRooms(true);
      try {
        const response = await getData("/auth/getAllRoomChat");
        if (active && response.success) {
          setRooms(response.data);
          shareRoomsLoadedRef.current = true;
        }
      } catch {
        if (active) {
          toast.error("Không thể tải danh sách cuộc trò chuyện");
        }
      } finally {
        if (active) setIsLoadingShareRooms(false);
      }
    };

    fetchRoomChat();
    return () => {
      active = false;
    };
  }, [openInvite]);
  const filteredRooms = filterChatRooms(rooms, tab);
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
      emitChatMessage(
        {
          images: "",
          file: "",
          roomChatId: formSend.listRoom,
          message: inviteUrl,
          type: "invite",
        },
        { optimistic: false },
      );
      setFormSend({
        listRoom: [],
      });
    }
  };

  // Enter group
  const handleEnterGroup = () => {};

  return (
    <React.Fragment>
      <div className="chat-detail app-panel flex h-screen min-w-0 w-full">
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
                      className="app-hover rounded-full p-1"
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
                          <div className="mb-3 text-center text-[15px] text-[var(--text-secondary)]">
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
                            <div className="text-[15px] text-[var(--text-secondary)]">
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
                      className="app-muted flex cursor-pointer items-center gap-1 text-[14px] hover:text-[var(--primary)]"
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
                            className="app-hover rounded-full p-1"
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
                              className="app-muted text-[14px]"
                            >
                              Đang hoạt động
                            </div>
                          ) : (
                            <div
                              className="app-muted text-[14px]"
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
                      className="app-hover rounded-full p-1"
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
                      className="app-muted flex cursor-pointer items-center gap-1 text-[14px]"
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
              <Tooltip title="Tìm tin nhắn">
                <button
                  className={`chat-header-action !hidden md:!flex ${messageSearchOpen ? "is-active" : ""}`}
                  onClick={() =>
                    setMessageSearchOpen((openSearch) => !openSearch)
                  }
                  aria-label="Tìm tin nhắn"
                >
                  <GrSearch />
                </button>
              </Tooltip>
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
          {messageSearchOpen && (
            <MessageSearchPanel
              roomId={roomChatId}
              onClose={handleCloseMessageSearch}
              onSelect={handleSelectSearchResult}
            />
          )}
          <div className="relative min-h-0 flex-1">
            <div
              ref={messageCanvasRef}
              onScroll={handleMessageCanvasScroll}
              className="message-canvas flex h-full flex-col gap-2 overflow-y-auto px-5 pt-2"
              style={{
                backgroundRepeat: "no-repeat",
                backgroundSize: "cover",
                backgroundPosition: "center",

                //  CHỈ hiện avatar khi switch = true
                backgroundImage:
                  useAvatarBg && state.avatar ? `url(${state.avatar})` : "none",

                //  fallback màu nền
                backgroundColor: "var(--chat-canvas)",
              }}
            >
              {messagePagination.hasMore && (
                <div className="flex justify-center py-2">
                  <button
                    type="button"
                    onClick={handleLoadOlderMessages}
                    disabled={isLoadingOlder}
                    className="settings-interactive app-card rounded-full border px-4 py-2 text-sm text-[var(--primary)] shadow disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isLoadingOlder ? "Đang tải..." : "Tải tin nhắn cũ"}
                  </button>
                </div>
              )}
              {chat.map((item, index) => {
                if (item.type === "system") {
                  return (
                    <div key={item._id} className="flex justify-center my-3">
                      <span className="rounded-full bg-[var(--disabled-surface)] px-3 py-1 text-xs text-[var(--text-secondary)]">
                        {formatSystemMessage(item, state._id)}
                      </span>
                    </div>
                  );
                }
                const isMe = item.user_id._id === state._id;

                return (
                  <div
                    key={item._id || item.clientMessageId || index}
                    data-message-id={item._id}
                    className={`flex rounded-lg transition-shadow ${
                      highlightedMessageId?.toString() === item._id?.toString()
                        ? "ring-2 ring-yellow-400 ring-offset-2"
                        : ""
                    } ${isMe ? "justify-end" : "gap-2"} mb-2`}
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
                          ? "rounded-xl rounded-br-none bg-[var(--surface-selected)]"
                          : "rounded-xl rounded-bl-none bg-[var(--surface-raised)]"
                      } p-2 max-w-[60%]`}
                    >
                      {/* Nội dung text */}

                      {item.deleted ? (
                        <i className="app-muted">Tin nhắn đã bị xóa</i>
                      ) : (
                        <>
                          {item.type === "emoji" ? (
                            <div className="text-4xl">
                              <AiFillLike className="text-yellow-500" />
                            </div>
                          ) : (
                            <div
                              className="mb-1 text-[var(--text-primary)]"
                            >
                              {item.type === "invite" ? (
                                <div className="p-3 rounded-lg border">
                                  <QRCode value={item.content} size={120} />
                                  <Button onClick={handleEnterGroup}>
                                    Tham gia nhóm
                                  </Button>
                                </div>
                              ) : (
                                renderHighlightedText(
                                  item.content,
                                  activeSearchKeyword,
                                )
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
                                      onLoad={handleMessageMediaLoad}
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
                                    <span className="block truncate text-sm font-medium text-[var(--text-primary)]">
                                      {f.name}
                                    </span>
                                    <span className="app-muted mt-0.5 block text-xs">
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
                          app-card rounded-full border p-1
                    `}
                          aria-controls={open ? "fade-menu" : undefined}
                          aria-haspopup="true"
                          aria-expanded={open ? "true" : undefined}
                          onClick={() => {
                            handleClick(item._id, item);
                            setOpenMenu(
                              openMenu === item._id ? null : item._id,
                            );
                          }}
                        >
                          <BsThreeDots />
                        </div>
                      </Tooltip>

                      <div className="relative">
                        {openMenu === item._id && !item.deleted && (
                          <div
                            ref={menuRef}
                            className={`app-card absolute bottom-0 z-50 w-44 rounded-lg border shadow-lg ${
                              isMe ? "right-full mr-2" : "left-full ml-2"
                            }`}
                          >
                            {!item.files?.length && item.type !== "invite" && (
                              <button
                                onClick={handleCopy}
                                className="app-hover flex w-full items-center gap-3 px-4 py-2 text-blue-500"
                              >
                                <MdOutlineContentCopy />
                                Sao chép
                              </button>
                            )}
                            <button
                              onClick={() => setOpenInvite(true)}
                              className="app-hover flex w-full items-center gap-3 px-4 py-2 text-green-600 dark:text-green-400"
                            >
                              <FiSend />
                              Gửi
                            </button>
                            {isMe && (
                              <button
                                onClick={handleDeleteMessage}
                                className="app-hover flex w-full items-center gap-3 px-4 py-2 text-red-600 dark:text-red-400"
                              >
                                <FiDelete />
                                Xóa tin nhắn
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                      {/* Thời gian */}
                      <div className="app-muted mt-1 text-right text-[11px]">
                        {new Date(item.createdAt).toLocaleTimeString("vi-VN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                        {isMe && item.deliveryStatus && (
                          <span className="ml-1">
                            {item.deliveryStatus === "queued" &&
                              "· Đang chờ mạng"}
                            {item.deliveryStatus === "pending" && "· Đang gửi"}
                            {item.deliveryStatus === "sent" && "· Đã gửi"}
                            {item.deliveryStatus === "delivered" && "· Đã nhận"}
                            {item.deliveryStatus === "read" && "· Đã xem"}
                            {item.deliveryStatus === "failed" && "· Gửi lỗi"}
                          </span>
                        )}
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
                    className="app-hover flex cursor-pointer items-center gap-2 rounded p-2"
                  >
                    <MdAttachFile className="app-muted" />
                    <span className="break-all text-sm text-[var(--text-primary)]">
                      {file.name}
                    </span>

                    {/* Chỉ hiện spinner nếu đang upload */}
                    {file.status === "uploading" && (
                      <svg
                        className="app-muted ml-1 h-4 w-4 animate-spin"
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
                    <div className="text-[13px] text-[var(--text-secondary)]">
                      Đang soạn tin
                    </div>
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
            {newMessageCount > 0 && (
              <button
                type="button"
                onClick={() => scrollToLatestMessage("smooth")}
                className="absolute bottom-4 right-4 z-10 flex items-center gap-1 rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <IoChevronDown />
                {newMessageCount === 1
                  ? "Có tin nhắn mới"
                  : `${newMessageCount} tin nhắn mới`}
              </button>
            )}
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
                {({ imageList, onImageUpload, onImageRemove, dragProps }) => (
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
                        <div className="app-card absolute left-4 top-[-100px] mt-3 flex flex-wrap gap-2 rounded-md border px-4 py-2">
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
                className="app-input min-w-0 flex-1 rounded border px-3 py-1"
                onPaste={handlePaste}
                type="text"
                placeholder="Nhập tin nhắn"
                ref={input}
                onChange={handleInputChange}
                onKeyDown={(e) =>
                  e.key === "Enter" && !isUploadingImages && handleMessage()
                }
                value={message}
              />
              {message.trim() !== "" || images.length > 0 ? (
                <IoSend
                  className={`text-blue-600 text-[23px] ${
                    isUploadingImages
                      ? "opacity-50 pointer-events-none"
                      : "cursor-pointer"
                  }`}
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
                <div className="text-[17px] font-[500] text-[var(--text-primary)]">
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
                <div className="py-5 text-[15px] text-[var(--text-primary)]">
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
                            <span className="app-muted text-[13px]">
                              Trưởng nhóm
                            </span>
                          )}
                        </div>

                        {/* NÚT 3 CHẤM */}
                        {(isMyself || isCurrentUserAdmin) && (
                          <div
                            className="app-card
            absolute right-2 top-1/2 -translate-y-1/2
            opacity-0 group-hover:opacity-100
            cursor-pointer rounded-full border p-1
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
                            className="app-card
            absolute right-2 top-6 mt-2 z-50
            border rounded-md shadow-md
            min-w-[140px]
          "
                          >
                            {/* RỜI NHÓM: chỉ cho chính mình */}
                            {isMyself && (
                              <div
                                className="app-hover cursor-pointer px-3 py-1 text-[14px]"
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
                                className="app-hover cursor-pointer px-3 py-1 text-[14px] text-red-500 dark:text-red-400"
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
              <div className="app-divider flex h-[11%] items-center justify-center border-b px-5 py-1 text-[17px] font-[500] text-[var(--text-secondary)]">
                Thông tin hội thoại
              </div>

              <button
                type="button"
                onClick={handleOpenMobileMessageSearch}
                className="app-divider app-hover flex w-full items-center gap-3 border-b px-5 py-4 text-left text-sm md:hidden"
              >
                <GrSearch className="text-lg" />
                Tìm kiếm tin nhắn
              </button>

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
                  <span className="font-medium text-[var(--text-secondary)]">
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
              <div className="app-divider border-b-8 px-5 py-4 text-[var(--text-secondary)]">
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
                                      <span className="block truncate text-sm font-medium text-[var(--text-primary)]">
                                        {f.name}
                                      </span>
                                      <span className="app-muted mt-0.5 block text-xs">
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
              <div className="app-divider flex h-[11%] items-center justify-between border-b px-5 py-1 text-[17px] font-[500] text-[var(--text-secondary)]">
                <MdOutlineKeyboardArrowLeft
                  className="text-[30px] cursor-pointer"
                  onClick={() => {
                    setButtonActive(false);
                  }}
                />
                Thông tin hội thoại
                <div></div>
              </div>
              <button
                type="button"
                onClick={handleOpenMobileMessageSearch}
                className="app-divider app-hover flex w-full items-center gap-3 border-b px-5 py-4 text-left text-sm md:hidden"
              >
                <GrSearch className="text-lg" />
                Tìm kiếm tin nhắn
              </button>
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
                  <div className="app-divider border-b-8 pt-2 text-[var(--text-secondary)]">
                    <span className="text-[15px] font-[500] px-4  py-2 my-2">
                      Thành viên nhóm
                    </span>
                    <div className="app-hover flex cursor-pointer gap-3 p-3 text-[14px]">
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
                      <span className="font-medium text-[var(--text-secondary)]">
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
                  <div className="app-divider border-b-8 px-5 py-4 text-[var(--text-secondary)]">
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
                                          <span className="block truncate text-sm font-medium text-[var(--text-primary)]">
                                            {f.name}
                                          </span>
                                          <span className="app-muted mt-0.5 block text-xs">
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

                    <div className="app-card break-all rounded-lg border p-3 text-sm">
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
                        className="app-hover app-divider flex flex-1 items-center justify-center gap-2 rounded-lg border py-2 transition"
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
                        <div className="app-divider flex items-center gap-2 border-b-8 px-5 py-4 text-[var(--text-secondary)]">
                          <HiOutlineUserGroup className="text-[22px]" />
                          <span className="text-[15px]">
                            {commonGroupCount} nhóm chung
                          </span>
                        </div>
                      )}

                      <div className="app-divider border-b-8 px-5 py-4 text-[var(--text-secondary)]">
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
                      <div className="app-divider border-b-8 px-5 py-4 text-[var(--text-secondary)]">
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
                                              <span className="block truncate text-sm font-medium text-[var(--text-primary)]">
                                                {f.name}
                                              </span>
                                              <span className="app-muted mt-0.5 block text-xs">
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
        <div className="app-divider flex h-14 items-center justify-between border-b px-5">
          <div>
            <div className="text-base font-semibold text-[var(--text-primary)]">
              Chia sẻ
            </div>
            <div className="app-muted text-xs">
              Chọn cuộc trò chuyện để gửi
            </div>
          </div>
          <IconButton
            size="small"
            sx={{ color: "text.secondary" }}
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
                    className="app-muted mr-2"
                  />
                ),
              }}
            />
          </div>

          {/* Tabs */}
          <div className="app-divider border-b px-3">
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
              {isLoadingShareRooms ? (
                <div className="flex justify-center py-8">
                  <CircularProgress size={26} />
                </div>
              ) : (
                filteredRooms.map((item) => (
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
                      sx={{ color: "text.secondary" }}
                    />

                    <Avatar src={item.avatar} sx={{ width: 42, height: 42 }} />

                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-[var(--text-primary)]">
                        {item.typeRoom === "friend"
                          ? item.users.find((u) => u.user_id?._id !== state._id)
                              ?.user_id?.name
                          : item.title}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </DialogContent>
        <div className="app-divider flex min-h-16 items-center justify-between gap-3 border-t px-4 py-3">
          <span className="app-muted text-xs">
            {formSend.listRoom.length > 0
              ? `Đã chọn ${formSend.listRoom.length} cuộc trò chuyện`
              : "Chưa chọn cuộc trò chuyện"}
          </span>
          <div className="flex gap-2">
            <Button
              variant="text"
              sx={{ color: "text.secondary", px: 2 }}
              onClick={() => setOpenInvite(false)}
            >
              Hủy
            </Button>
            <Button
              variant="contained"
              sx={{ px: 2.5 }}
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
