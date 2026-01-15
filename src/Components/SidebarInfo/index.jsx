import React, { useEffect, useRef, useState } from "react";
import { FcSearch } from "react-icons/fc";
import logoMyDocument from "../../assets/my-documents-icon-260nw-21989287.webp";
import {
  Link,
  NavLink,
  Outlet,
  useLocation,
  useMatch,
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
import { MdAttachFile } from "react-icons/md";
import { socket } from "../../socket";

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

  const [currentRoomId, setCurrentRoomId] = useState(roomChatId);
  const currentRoomIdRef = useRef(roomChatId); // init luôn với roomChatId

  useEffect(() => {
    setCurrentRoomId(roomChatId); // cập nhật state
    currentRoomIdRef.current = roomChatId; // cập nhật ref
  }, [roomChatId]);

  //dialog
  const [open, setOpen] = React.useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

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
  }, [socket, state._id]);

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
      users,
      removedUserId,
      action,
    }) => {
      if (action === "leave" && removedUserId === state._id) {
        setRooms((prev) =>
          prev.filter((room) => room._id.toString() !== roomChatId.toString())
        );
        navigateRef.current("/chat");
      }

      if (action === "remove" && removedUserId === state._id) {
        setRooms((prev) =>
          prev.filter((room) => room._id.toString() !== roomChatId.toString())
        );
        navigateRef.current("/chat");
      }
    };
    const handleRemoveRoom = ({ roomChatId }) => {
      setRooms((prev) =>
        prev.filter((room) => room._id.toString() !== roomChatId.toString())
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
  }, [socket, state._id]);
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
  }, [socket]);

  const updateSidebar = (message) => {
    setRooms((prev) => {
      const updated = prev.map((room) => {
        if (room._id === message.roomChatId) {
          const currentUserId = state._id;

          // Nếu đang ở phòng đó thì unread = 0, chữ không in đậm
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
            updatedAt: message.createdAt, // dùng để sort room lên đầu
          };
        }
        return room;
      });

      // Sort room mới nhất lên đầu
      updated.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

      return updated;
    });
  };

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
            : room
        )
      );
    };

    socket.on("SERVER_READ_ROOM", handleReadRoom);

    return () => {
      socket.off("SERVER_READ_ROOM", handleReadRoom);
    };
  }, [socket]);
  // Hàm định format thời gian
  const timeAgo = (date) => {
    if (!date) return "";
    const diff = Date.now() - new Date(date).getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    if (minutes < 1) return `Vừa xong`;
    if (minutes < 60) return `${minutes} phút `;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} giờ `;
    const days = Math.floor(hours / 24);
    return `${days} ngày `;
  };
  //thêm document vào rooms

  //dark/mode
  const theme = useSelector((state) => state.theme.mode);
  return (
    <div className="flex">
      <div
        className={`w-full md:w-[300px]  ${
          roomChatId ? "hidden md:block" : "block"
        } ${
          theme == "dark" ? "bg-[#22262b] text-white" : "bg-gray-50 "
        }    border border-r h-screen`}
      >
        <Function setSearchText={setSearchText} setUser={setUser} />

        {searchText !== "" ? (
          <>
            {user.length > 0 ? (
              <div className="h-[89%]  flex py-4">
                <div className="flex flex-col gap-3">
                  {user.map((item, index) => {
                    const friend = item.FriendList?.find(
                      (f) => String(f.user_id) === String(state._id)
                    );

                    const isFriend = !!friend;
                    const roomChatId = friend?.room_chat_id;

                    return (
                      <div
                        key={index}
                        className="flex  gap-3 mx-3 rounded-md  items-center cursor-pointer bg-gray-100 border px-3 py-4 w-full h-[70px]"
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
                        maxWidth: "50vw",
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
                <div className="text-[18px] text-gray-500">
                  Không tìm thấy kết quả
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="h-[89%]">
            <div className="border-b-2 h-[5%] flex gap-2 px-3">
              <div
                className={`text-[13px] font-[500] cursor-pointer ${
                  active == 1
                    ? "text-[#ff5252]"
                    : `${theme == "dark" ? "text-white" : "text-[#2d3136]"}`
                }`}
                onClick={() => setActive(1)}
              >
                Tất cả
              </div>
              <div
                className={`text-[13px] font-[500] cursor-pointer ${
                  active == 2
                    ? "text-[#ff5252]"
                    : `${theme == "dark" ? "text-white" : "text-[#2d3136]"}`
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
                      //  ROOM CHAT THẬT
                      setRooms((prev) =>
                        prev.map((room) =>
                          room._id === item._id
                            ? {
                                ...room,
                                unreadCount: {
                                  ...room.unreadCount,
                                  [state._id]: 0,
                                },
                              }
                            : room
                        )
                      );

                      socket.emit("CLIENT_READ_ROOM", {
                        roomChatId: item._id,
                      });

                      navigate(`/chat/${item._id}`);
                    }}
                  >
                    <div
                      className={`flex gap-3 cursor-pointer px-3 py-4
                        ${
                          theme == "dark"
                            ? "hover:bg-[#2d3136]"
                            : "hover:bg-gray-100"
                        }
                        ${unread > 0 ? "bg-blue-50" : ""}`}
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
                      <div className="flex-1 flex-col justify-between">
                        <div className="flex justify-between">
                          <div className="text-[15px]">
                            {item?.typeRoom === "system"
                              ? item?.title
                              : item?.typeRoom === "group"
                              ? item?.title
                              : item?.users?.find(
                                  (u) => u.user_id?._id !== state._id
                                )?.user_id?.name}
                          </div>
                          <div
                            className={`text-[13px] ${
                              theme == "dark"
                                ? "text-[#cccfd4]"
                                : "text-gray-600"
                            }`}
                          >
                            {timeAgo(item?.lastMessage?.createdAt)}
                          </div>
                        </div>

                        <div
                          className={`line-clamp-1 text-[13px]
                         ${
                           unread > 0
                             ? "font-semibold text-white"
                             : `${
                                 theme == "dark"
                                   ? "text-[#cccfd4]"
                                   : "text-gray-600"
                               }`
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
                          ) : item?.lastMessage?.content ? (
                            <span>{item.lastMessage.content}</span>
                          ) : (
                            "Chưa có tin nhắn"
                          )}
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

              <div className="text-[#ff5252] text-[18px]">
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
