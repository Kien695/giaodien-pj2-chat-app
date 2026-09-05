import React, { useCallback, useEffect, useRef, useState } from "react";
import { FcSearch } from "react-icons/fc";
import {
  Link,
  NavLink,
  Outlet,
  useNavigate,
  useParams,
} from "react-router-dom";
import Function from "../Function";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { useSelector } from "react-redux";
import { getData } from "../../utils/api";
import { CiImageOn } from "react-icons/ci";
import { MdAttachFile, MdOutlineInsertEmoticon } from "react-icons/md";
import { socket } from "../../socket";
import { AiFillLike } from "react-icons/ai";
import { IoQrCodeOutline } from "react-icons/io5";

function SideBar() {
  const state = useSelector((state) => state.user);

  const [active, setActive] = useState(1);
  const [searchText, setSearchText] = useState("");
  const [text, setText] = useState("");
  const [user, setUser] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [friendStatus, setFriendStatus] = useState({});

  const navigate = useNavigate();

  const { roomChatId } = useParams();

  const currentRoomIdRef = useRef(roomChatId); // init luôn với roomChatId
  const roomSyncInFlightRef = useRef(false);

  useEffect(() => {
    currentRoomIdRef.current = roomChatId; // cập nhật ref
  }, [roomChatId]);

  //dialog
  const [open, setOpen] = React.useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  //update time- render mỗi phút
  const [, forceRender] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      forceRender((v) => v + 1);
    }, 60 * 1000);

    return () => clearInterval(interval);
  }, []);
  //gửi lên server
  const handleSendRequire = (userId) => {
    setOpen(false);
    socket.emit("CLIENT_ADD_FRIEND", { userId, text });
  };
  const handleCancelRequire = (userId) => {
    socket.emit("CLIENT_CANCEL_FRIEND", userId);
  };
  //server trả về
  useEffect(() => {
    if (!socket) return;

    const handleStatus = (data) => {
      setFriendStatus((prev) => ({
        ...prev,
        [data.userId]: data.status,
      }));
    };

    socket.on("SERVER_FRIEND_STATUS", handleStatus);

    return () => {
      socket.off("SERVER_FRIEND_STATUS", handleStatus);
    };
  }, []);

  const fetchRoomChat = useCallback(async () => {
    if (roomSyncInFlightRef.current) return;
    roomSyncInFlightRef.current = true;
    try {
      const response = await getData("/auth/getAllRoomChat");
      if (response.success) {
        setRooms(response.data);
        if (
          currentRoomIdRef.current &&
          !response.data.some(
            (room) =>
              room._id?.toString() === currentRoomIdRef.current?.toString(),
          )
        ) {
          navigate("/chat");
        }
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách phòng chat:", error);
    } finally {
      roomSyncInFlightRef.current = false;
    }
  }, [navigate]);

  useEffect(() => {
    fetchRoomChat();
    socket.on("connect", fetchRoomChat);
    return () => {
      socket.off("connect", fetchRoomChat);
    };
  }, [fetchRoomChat]);
  //server return all room
  const navigateRef = useRef();
  useEffect(() => {
    navigateRef.current = navigate;
  }, [navigate]);
  useEffect(() => {
    if (!socket) return;
    const handleRoomUpdateSideBar = ({ roomChat }) => {
      setRooms((prev) => {
        // tránh add trùng room
        const exists = prev.some((r) => r._id === roomChat._id);

        if (exists) return prev;

        return [roomChat, ...prev]; // add lên đầu sidebar
      });
    };
    const handleRoomremoveUser = ({
      roomChatId,
      removedUserId,
      action,
    }) => {
      if (action === "leave" && removedUserId === state._id) {
        setRooms((prev) =>
          prev.filter((room) => room._id.toString() !== roomChatId.toString()),
        );
        navigateRef.current("/chat");
      }

      if (action === "remove" && removedUserId === state._id) {
        setRooms((prev) =>
          prev.filter((room) => room._id.toString() !== roomChatId.toString()),
        );
        navigateRef.current("/chat");
      }
    };
    const handleRemoveRoom = ({ roomChatId }) => {
      setRooms((prev) =>
        prev.filter((room) => room._id.toString() !== roomChatId.toString()),
      );
      navigateRef.current("/chat");
    };
    const handleCreateRoom = (room) => {
      setRooms((prev) => [room, ...prev]);
    };
    socket.on("SERVER_ROOM_UPDATED_SIDEBAR", handleRoomUpdateSideBar);
    socket.on("SERVER_ROOM_REMOVE_USERS", handleRoomremoveUser);
    socket.on("SERVER_RETURN_ROOM", handleRemoveRoom);
    socket.on("SERVER_RETURN_NEW_ROOM", handleCreateRoom);
    return () => {
      socket.off("SERVER_ROOM_UPDATED_SIDEBAR", handleRoomUpdateSideBar);
      socket.off("SERVER_ROOM_REMOVE_USERS", handleRoomremoveUser);
      socket.off("SERVER_RETURN_ROOM", handleRemoveRoom);
      socket.off("SERVER_RETURN_NEW_ROOM", handleCreateRoom);
    };
  }, [state._id]);

  const updateSidebar = useCallback((message) => {
    setRooms((prev) => {
      const updated = prev.map((room) => {
        if (room._id === message.roomChatId) {
          const currentUserId = state._id;
          const unread =
            currentRoomIdRef.current === message.roomChatId
              ? 0
              : message.unreadCountForUsers?.[currentUserId] || 0;
          return {
            ...room,
            lastMessage: {
              content: message.content,
              images: message.images,
              files: message.files,
              sender: message.user_id,
              createdAt: message.createdAt,
            },
            unreadCount: {
              ...room.unreadCount,
              [currentUserId]: unread,
            },
            updatedAt: message.createdAt,
          };
        }
        return room;
      });
      updated.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      return updated;
    });
  }, [state._id]);
  //server trả về message hiện thị lên sidebar
  useEffect(() => {
    if (!socket) return;

    const handleMessage = (data) => {
      updateSidebar(data);
    };

    socket.on("SERVER_RETURN_SIDEBAR", handleMessage);

    return () => {
      socket.off("SERVER_RETURN_SIDEBAR", handleMessage);
    };
  }, [updateSidebar]);

  //update sidebar khi click vào tin nhắn mới
  useEffect(() => {
    if (!socket) return;

    const handleReadRoom = ({ roomChatId, userId }) => {
      setRooms((prev) =>
        prev.map((room) =>
          room._id === roomChatId
            ? {
                ...room,
                unreadCount: {
                  ...room.unreadCount,
                  [userId]: 0,
                },
              }
            : room,
        ),
      );
    };

    socket.on("SERVER_READ_ROOM", handleReadRoom);

    return () => {
      socket.off("SERVER_READ_ROOM", handleReadRoom);
    };
  }, []);
  // Hàm định format thời gian
  const timeAgo = (date) => {
    if (!date) return "";
    const diff = Date.now() - new Date(date).getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    if (minutes < 1) return `Vừa xong`;
    if (minutes < 60) return `${minutes} phút `;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} giờ `;
    if (hours < 48) return `Hôm qua`;
    const days = Math.floor(hours / 24);
    if (days >= 2 && days < 30) return `${days} ngày`;
    const months = Math.floor(days / 30);
    if (months < 12) return `${months} tháng`;
    const years = Math.floor(months / 12);
    return `${years} năm`;
  };
  //thêm document vào rooms

  return (
    <div className="conversation-layout flex min-w-0">
      <div
        className={`conversation-sidebar w-full md:w-[340px] md:max-w-[340px] shrink-0 ${
          roomChatId ? "hidden md:block" : "block"
        } app-panel app-divider h-screen border-r`}
      >
        <Function setSearchText={setSearchText} setUser={setUser} />

        {searchText !== "" ? (
          <>
            {user.length > 0 ? (
              <div className="h-[89%]  flex py-4">
                <div className="flex flex-col gap-3">
                  {user.map((item, index) => {
                    const friend = item.FriendList?.find(
                      (f) => String(f.user_id) === String(state._id),
                    );

                    const isFriend = !!friend;
                    const roomChatId = friend?.room_chat_id;

                    return (
                      <div
                        key={index}
                        className="app-card mx-3 flex h-[70px] w-full cursor-pointer items-center gap-3 rounded-md border px-3 py-4"
                      >
                        <img
                          src={
                            item.avatar ||
                            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSsGuNeeq7R_EoWkiZPOvfRF5B0ZSbLCwRAnA&s"
                          }
                          alt="avatar"
                          className="w-[40px] h-[40px] rounded-full"
                        />

                        <div className="ml-4">
                          <div className="text-[14px] font-[500] ml-1">
                            {item.name}
                          </div>
                          <div>
                            {isFriend && (
                              <Link
                                to={isFriend ? `/chat/${roomChatId}` : "/chat/"}
                              >
                                <Button
                                  size="small"
                                  color="error"
                                  sx={{
                                    textTransform: "none",
                                  }}
                                >
                                  Nhắn tin
                                </Button>
                              </Link>
                            )}

                            {isFriend ? null : (
                              <>
                                {friendStatus[item._id] === "pending" ||
                                item.friendStatus === "pending" ? (
                                  <Button
                                    size="small"
                                    sx={{
                                      textTransform: "none",
                                    }}
                                    onClick={() =>
                                      handleCancelRequire(item._id)
                                    }
                                  >
                                    Hủy kết bạn
                                  </Button>
                                ) : (
                                  <>
                                    <Button
                                      size="small"
                                      sx={{
                                        textTransform: "none",
                                      }}
                                      onClick={() => {
                                        setSelectedUser(item);
                                        setOpen(true);
                                      }}
                                    >
                                      Kết bạn
                                    </Button>
                                  </>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <Dialog
                    open={open}
                    onClose={() => setOpen(false)}
                    PaperProps={{
                      sx: {
                        width: "400px",
                        paddingX: "15px",
                        paddingTop: "10px",
                        maxWidth: "66vw",
                      },
                    }}
                  >
                    {selectedUser && (
                      <>
                        <div className="relative">
                          <img
                            src={
                              selectedUser.background ||
                              "https://cdn-media.sforum.vn/storage/app/media/ctv_seo3/mau-background-dep-6.jpg"
                            }
                            className="h-[120px] w-full object-cover rounded-md"
                          />

                          <div className="absolute flex gap-3 items-center bottom-[-45px] left-6">
                            <img
                              src={
                                selectedUser.avatar ||
                                "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSsGuNeeq7R_EoWkiZPOvfRF5B0ZSbLCwRAnA&s"
                              }
                              className="rounded-full w-[60px] border-2"
                            />
                            <div className="font-[500] text-[16px]">
                              {selectedUser.name}
                            </div>
                          </div>
                        </div>

                        <div className="mt-12">
                          <textarea
                            placeholder="Hãy ghi lời chào khi kết bạn vào đây!"
                            className="w-full border rounded p-2"
                            rows={3}
                            onChange={(e) => setText(e.target.value)}
                          />
                        </div>

                        <DialogActions>
                          <Button onClick={() => setOpen(false)}>Hủy</Button>
                          <Button
                            onClick={() => handleSendRequire(selectedUser._id)}
                          >
                            Gửi lời mời
                          </Button>
                        </DialogActions>
                      </>
                    )}
                  </Dialog>
                </div>
              </div>
            ) : (
              <div className="h-[89%] flex  items-center justify-center">
                <FcSearch className="text-[60px]" />{" "}
                <div className="app-muted text-[18px]">
                  Không tìm thấy kết quả
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="h-[89%] ">
            <div className="border-b-2 h-[5%] flex gap-2 px-3">
              <div
                className={`text-[13px] font-[500] cursor-pointer ${
                  active == 1
                    ? "text-[var(--primary)]"
                    : "text-[var(--text-secondary)]"
                }`}
                onClick={() => setActive(1)}
              >
                Tất cả
              </div>
              <div
                className={`text-[13px] font-[500] cursor-pointer ${
                  active == 2
                    ? "text-[var(--primary)]"
                    : "text-[var(--text-secondary)]"
                }`}
                onClick={() => setActive(2)}
              >
                Chưa đọc
              </div>
            </div>
            <div className="h-[95%] overflow-y-scroll">
              {rooms.map((item, index) => {
                const unread = item?.unreadCount?.[state._id] || 0;

                return (
                  <div
                    key={index}
                    onClick={() => {
                      navigate(`/chat/${item._id}`);
                    }}
                  >
                    <div
                      className={`conversation-item app-hover flex cursor-pointer gap-3 px-3 py-3 ${unread > 0 ? "app-selected" : ""}`}
                    >
                      <img
                        src={
                          item?.avatar ||
                          item?.users?.find((u) => u.user_id?._id !== state._id)
                            ?.user_id?.avatar ||
                          "https://jbagy.me/wp-content/uploads/2025/03/Hinh-anh-avatar-nam-cute-5-1.jpg"
                        }
                        alt=""
                        className="w-[45px] rounded-full"
                      />
                      <div className="flex flex-1 flex-col justify-between">
                        <div className="flex justify-between">
                          <div className="text-[15px]">
                            {item?.typeRoom === "system"
                              ? item?.title
                              : item?.typeRoom === "group"
                                ? item?.title
                                : item?.users?.find(
                                    (u) => u.user_id?._id !== state._id,
                                  )?.user_id?.name}
                          </div>
                          <div
                            className={`text-[13px] truncate${
                              unread > 0
                                ? "font-semibold"
                                : "app-muted"
                            }`}
                          >
                            {timeAgo(item?.lastMessage?.createdAt)}
                          </div>
                        </div>
                        <div className="flex justify-between">
                          <div
                            className={`line-clamp-1 text-[13px]
                         ${
                           unread > 0
                             ? "font-semibold"
                             : "app-muted"
                         }`}
                          >
                            {item?.lastMessage?.files?.length > 0 ? (
                              <div className="flex gap-1 items-center">
                                <MdAttachFile className="text-[15px]" />
                                <span>Tệp đính kèm</span>
                              </div>
                            ) : item?.lastMessage?.images?.length > 0 ? (
                              <div className="flex gap-1 items-center">
                                <CiImageOn className="text-[17px]" />
                                <span>Hình ảnh</span>
                              </div>
                            ) : item?.lastMessage?.type === "emoji" ? (
                              <span className="flex gap-1 items-center">
                                <MdOutlineInsertEmoticon /> emoji
                              </span>
                            ) : item?.lastMessage?.type === "invite" ? (
                              <span className="flex gap-1 items-center">
                                <IoQrCodeOutline /> QR Code
                              </span>
                            ) : item?.lastMessage?.content ? (
                              <span>{item.lastMessage.content}</span>
                            ) : (
                              "Chưa có tin nhắn"
                            )}
                          </div>
                          <div
                            className={`w-[14px] h-[14px] mr-3 font-semibold text-[10px] flex text-white items-center justify-center rounded-full bg-red-500 ${
                              unread > 0 ? "block" : "hidden"
                            }`}
                          >
                            {unread}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
      <div
        className={`
      w-full flex-1
      ${roomChatId ? "block" : "hidden md:flex"}
    `}
      >
        {roomChatId ? (
          <Outlet />
        ) : (
          <div className="w-full">
            <div
              className="w-full min-h-screen bg-cover bg-center  flex flex-col gap-2 items-center justify-center"
              style={{
                backgroundImage:
                  "url('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ2Vy2WLJn5Qc1yFBHxIP23xrPAI4kLAwEpbA&s')",
              }}
            >
              <div className="text-[45px] font-[700] italic">XIN CHÀO!</div>
              <img
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQqXOnaxgaF8MShXWWprLv-RfTh-sD50-vLZg&s"
                alt=""
                className="rounded-full"
              />

              <div className="text-[18px] text-[var(--danger)]">
                Hãy bắt đầu cuộc trò chuyện với mợi người ngay đi nào !
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SideBar;
