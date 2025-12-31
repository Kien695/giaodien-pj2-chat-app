import React, { useEffect, useState } from "react";
import { FcSearch } from "react-icons/fc";
import {
  Link,
  NavLink,
  Outlet,
  useLocation,
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
function SideBar() {
  const state = useSelector((state) => state.user);
  const socketConnection = state.socketConnection;
  const [active, setActive] = useState(1);
  const [searchText, setSearchText] = useState("");
  const [text, setText] = useState("");
  const [user, setUser] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [friendStatus, setFriendStatus] = useState({});
  const navigate = useNavigate();
  const { roomChatId } = useParams();
  //dialog
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };
  //gửi lên server
  const handleSendRequire = (userId) => {
    setOpen(false);
    socketConnection.emit("CLIENT_ADD_FRIEND", { userId, text });
  };
  const handleCancelRequire = (userId) => {
    socketConnection.emit("CLIENT_CANCEL_FRIEND", userId);
  };
  //server trả về
  useEffect(() => {
    if (!socketConnection) return;

    const handleStatus = (data) => {
      setFriendStatus((prev) => ({
        ...prev,
        [data.userId]: data.status,
      }));
    };

    socketConnection.on("SERVER_FRIEND_STATUS", handleStatus);

    return () => {
      socketConnection.off("SERVER_FRIEND_STATUS", handleStatus);
    };
  }, [socketConnection, state._id]);

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

  //server trả về message
  // socketConnection.on("SERVER_RETURN_MASSAGE", (data) => {
  //   updateSidebar(data);
  // });
  const updateSidebar = (data) => {};
  return (
    <div className="flex">
      <div className="w-[300px] bg-gray-50 border border-r h-screen">
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
                      <div className="flex  gap-3 mx-3 rounded-md  items-center cursor-pointer bg-gray-100 border px-3 py-4 w-full h-[70px]">
                        <img
                          src={item.avatar}
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
                                {" "}
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
                                      onClick={handleClickOpen}
                                    >
                                      Kết bạn
                                    </Button>
                                    <Dialog
                                      open={open}
                                      onClose={handleClose}
                                      PaperProps={{
                                        sx: {
                                          width: "400px",
                                          paddingX: "15px",
                                          paddingTop: "10px",
                                          maxWidth: "50vw",
                                        },
                                      }}
                                    >
                                      <div className="relative">
                                        <img
                                          src={
                                            item.background ||
                                            "https://cdn-media.sforum.vn/storage/app/media/ctv_seo3/mau-background-dep-6.jpg"
                                          }
                                          alt="background"
                                          className="h-[120px] w-full object-cover rounded-md"
                                        />
                                        <div className="absolute flex gap-3 items-center bottom-[-45px] left-6">
                                          <img
                                            src={
                                              item.avatar ||
                                              "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAKAAAACUCAMAAAAj+tKkAAAAdVBMVEX///8eLjPg4uIYKS85RUoAAAAbLDEAAxHx8vL09fW1uLoAFx4LIij8/PwRJSsAGSAADxjR09QAHiR7gYMAAAqWmpzAwsNpcXNKVFifpKaPlZdzen1CTVIxPkJUXGDHyMkmNTmJjY9eZmmprK5FSEwqMjcWIinVCKR5AAAGK0lEQVR4nO1c2bKiMBBlkbCFAEFFFEXwev//E8dtapyrdqdD4uXB82ZZlTok6b3TjvPBBx98MH1kceSVSbOuNvUJm2rdJKUXxdlv87ogKpdN1bppEBZpLiXnUuZpEQaF31bNsox+l12cVLutTKXw3Qcwcfpju6qS+LfIeU0bhNxnj9zuWPq8CNrGez/J6DDsCwFx+wdRsOHw1rPOvM2Rc3Drfmwk58fae5fQZN1QSAK7G0dZDN1bKHaDkFR2V0gxdNbplbtA8eY9gwh2dil6Pef69M7gsvfs8Uv29Lv3E4zvD5bolfV8NL0LxXld2uCXHDVl4xHymBinF9Whke27goW14Zvo7VJz9M5IV0YZLvcjhfcRYr80Ri9Lgifeylj4wcGUYVlQzK46GF8YoZdVcxv0zphXBvYw6w2Lxz3SfjzDyiI/1803Y/dvHdjk57rBetweNrldfqc9bMbwSwIr8nsPFozwHUo4IjLE0Nd2Hbx2hG+qDtHqWr2d9Qt4Rb7T49cU7+HnuoWWoCzFGy7gFUxoOA7xey7gFaKlpx56nQNmzNcT/KKn8uu+6ex4Ifez2V7qhPXfxHA0Hqgeql/M66T0TiiTeh5SHUg+0A75EBLpydV/knhYSSLFkGRQYp+2vODNj+xV1HCakPmMsoULmormX0+sVflFuyU5wb/2tqQNlKunyb9oRQqk/a26xVuQnNSXtpRoywvlLYwKippgx5feSLknLVSoZmFpRhgSP5oyUDXJcUu5gWIFSF+8ohyyr2jwEpL0cTAPZHKtv8g2FOHzYW/TI52G3KhEUF5KudmyglerKF/LUhVNQxQRxJNbmhcTmvIKENXgkeJq0eL8PJofGGDr0QJ/hTNuSPaJhdh6tMSsRM84q0knzCS2IEnkXFFjcuzNaI6W4SP2Z9gZd8RQJEC+OCMmnwrM9V9QCSJ5i5JKEHNpqLFIiixI89zOsQm8XkbytE4QA3jG2Y4YmrACvjM0vXpecA+eMc0jPCOApYRmmc7IwZC7J+ef5rDtXJMz0qwAtrCk3pjTpV6DBDf0ihLfvbw12U5jOTCtnu00Mkby5SH3GvVR8fp7Haq3fwN7FdEuaGbuCtjv92Y6uSmWPjXxjQ4/l4HGrtzqJS2L4WFVr9ZL0LItpLfoauuGfNv8dzJZs9VMcMOKtXN1075+7vflpSMvi6OyP/3UXIi5kLuwHFEXZmm4rau+r+ptqHX7/q4DaeoxBE/wucxzyUcuAhFM3pg4fwUBRe9aBJkv0iJ8QJEKrYQ6SFDjiEXqfg3rJnlAsx6+3JT+xeARkwmKcLXoXqr+uFusQipFUEiIasbPZwkSuEfJjKZxYDVDU9T8qJTQa44UnwZW1CRTl7aKhd6yJVgV2NRRnAWJhDf3GNT9LthZILhbckOoa8S1MkPY3VJ3WHlL6tbIWtV7CDusyi4/pahxgXLpBXb5lYMmUN0/xUHx05GgaanWp8VrKj/HqdUYImGnYuCORNcWl1ZLfWAJlOdQSvtgqQ9HKZLNtbq1OxV1zbEWFZX0G1IbeQWlmgmaflNJYHKkNvIKlcLpoAlMlRQw12xYU8jP4ylglSQ613wwsMR3EE+iq3zmt2YzmIe3uuBlCMdDbQkTms9/IrzZSqVYh5bCmK9LEA2iVEpheDHRIkGlYiJajrVHUK0cixa07RGUao3fWBnfHkG1lgDU77dGULWpAhMTawSVO0WRxh5bBNUbe5ACmy2CWNnvDnCEY4kgKQ6D2/O4Zut4CaoHSnueEzNoCzm5I/aKHiJIa3CEu8KYq/VeqmPQCdNaRJEmWxasL+20FJRr8GUFtcnW6b5hiWMzIhisGahtymijN/OJQHQ0/VpPvlX+FEG877EB15K6qT/XmP6Dl+k/GZr8o6s3PVsb9Vp76g//pv900vbj01QzUXa/h1N/vjv5B9DO5J+Q23uEn5ib7mJhjAE3OMbAOQ+CMOw5pDvDoyqijeFRGuZnIE18GIkz/XEujqGBOHJvZfuuMDBSiNscKeQYGMpk63T/4TzWSu+g3zLWyjkPBqsnPRjMmfxotQumPZzugthrVhMe73cjCQxI9H97QOINL0dMsimMmLxh0kM6P/jggw9g/AE2JHr0Qs4AMQAAAABJRU5ErkJggg=="
                                            }
                                            alt="avatar"
                                            className="rounded-full w-[60px] border-2"
                                          />
                                          <div className=" font-[500] text-[16px]">
                                            {item.name}
                                          </div>
                                        </div>
                                      </div>
                                      <div className="mt-12">
                                        <textarea
                                          placeholder="Hãy ghi lời chào khi kết bạn vào đây!"
                                          className="w-full border border-gray-300 rounded p-2 focus:!border-blue-500"
                                          rows={3}
                                          onChange={(e) => {
                                            setText(e.target.value);
                                          }}
                                        />
                                      </div>
                                      <DialogActions>
                                        <Button onClick={handleClose}>
                                          Hủy
                                        </Button>
                                        <Button
                                          onClick={() =>
                                            handleSendRequire(item._id)
                                          }
                                          autoFocus
                                        >
                                          Gửi lời mời
                                        </Button>
                                      </DialogActions>
                                    </Dialog>
                                  </>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
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
                  active == 1 ? "text-[#ff5252]" : "text-black"
                }`}
                onClick={() => setActive(1)}
              >
                Tất cả
              </div>
              <div
                className={`text-[13px] font-[500] cursor-pointer ${
                  active == 2 ? "text-[#ff5252]" : "text-black"
                }`}
                onClick={() => setActive(2)}
              >
                Chưa đọc
              </div>
            </div>
            <div className="h-[95%] overflow-y-scroll">
              {rooms.map((item, index) => (
                <Link to={`/chat/${item._id}`} key={index}>
                  <div className="flex gap-3 cursor-pointer hover:bg-gray-100 px-3 py-4">
                    <img
                      src={
                        item.avatar ||
                        item.users?.find((u) => u.user_id?._id !== state._id)
                          ?.user_id?.avatar ||
                        "https://jbagy.me/wp-content/uploads/2025/03/Hinh-anh-avatar-nam-cute-5-1.jpg"
                      }
                      alt=""
                      className="w-[45px] rounded-full"
                    />
                    <div className="flex flex-col justify-between">
                      <div className="flex justify-between">
                        <div className="text-[15px]">
                          {item.typeRoom == "group"
                            ? item.title
                            : item.users?.find(
                                (u) => u.user_id?._id !== state._id
                              )?.user_id?.name}
                        </div>
                        <span className="text-[13px] text-gray-600">3 giờ</span>
                      </div>

                      <div className="line-clamp-1 text-[13px] text-gray-600">
                        Hôm nay bạn như thế nào rồi. Kể tôi nghe đi
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
              {/* <NavLink
                to="/chat/456"
                className={({ isActive }) =>
                  `flex gap-3 cursor-pointer hover:bg-gray-100 px-3 py-4 ${
                    isActive ? "bg-gray-200 " : ""
                  }`
                }
              >
                <img
                  src="https://jbagy.me/wp-content/uploads/2025/03/Hinh-anh-avatar-nam-cute-5-1.jpg"
                  alt=""
                  className="w-[45px] rounded-full"
                />
                <div className="flex flex-col justify-between">
                  <div className="flex justify-between">
                    <div className="text-[15px]">Nguyễn Văn A</div>
                    <span className="text-[13px] text-gray-600">3 giờ</span>
                  </div>

                  <div className="line-clamp-1 text-[13px] text-gray-600">
                    Hôm nay bạn như thế nào rồi. Kể tôi nghe đi
                  </div>
                </div>
              </NavLink>

              <NavLink
                to="/chat/123"
                className={({ isActive }) =>
                  `flex gap-3 cursor-pointer hover:bg-gray-100 px-3 py-4 ${
                    isActive ? "bg-gray-200 " : ""
                  }`
                }
              >
                <img
                  src="https://jbagy.me/wp-content/uploads/2025/03/Hinh-anh-avatar-nam-cute-5-1.jpg"
                  alt=""
                  className="w-[45px] rounded-full"
                />
                <div className="flex flex-col justify-between">
                  <div className="flex justify-between">
                    <div className="text-[15px]">Nguyễn Văn A</div>
                    <span className="text-[13px] text-gray-600">3 giờ</span>
                  </div>

                  <div className="line-clamp-1 text-[13px] text-gray-600">
                    Hôm nay bạn như thế nào rồi. Kể tôi nghe đi
                  </div>
                </div>
              </NavLink>
              <div className="flex gap-3 cursor-pointer  hover:bg-gray-100 px-3 py-4">
                <img
                  src="https://jbagy.me/wp-content/uploads/2025/03/Hinh-anh-avatar-nam-cute-5-1.jpg"
                  alt=""
                  className="w-[45px] rounded-full"
                />
                <div className="flex flex-col justify-between">
                  <div className="flex justify-between">
                    <div className="text-[15px]">Nguyễn Văn A</div>
                    <span className="text-[13px] text-gray-600">3 giờ</span>
                  </div>

                  <div className="line-clamp-1 text-[13px] text-gray-600">
                    Hôm nay bạn như thế nào rồi. Kể tôi nghe đi
                  </div>
                </div>
              </div>
              <div className="flex gap-3 cursor-pointer  hover:bg-gray-200 px-3 py-4">
                <img
                  src="https://jbagy.me/wp-content/uploads/2025/03/Hinh-anh-avatar-nam-cute-5-1.jpg"
                  alt=""
                  className="w-[45px] rounded-full"
                />
                <div className="flex flex-col justify-between">
                  <div className="flex justify-between">
                    <div className="text-[15px]">Nguyễn Văn A</div>
                    <span className="text-[13px] text-gray-600">3 giờ</span>
                  </div>

                  <div className="line-clamp-1 text-[13px] text-gray-600">
                    Hôm nay bạn như thế nào rồi. Kể tôi nghe đi
                  </div>
                </div>
              </div>
              <div className="flex gap-3 cursor-pointer  hover:bg-gray-200 px-3 py-4">
                <img
                  src="https://jbagy.me/wp-content/uploads/2025/03/Hinh-anh-avatar-nam-cute-5-1.jpg"
                  alt=""
                  className="w-[45px] rounded-full"
                />
                <div className="flex flex-col justify-between">
                  <div className="flex justify-between">
                    <div className="text-[15px]">Nguyễn Văn A</div>
                    <span className="text-[13px] text-gray-600">3 giờ</span>
                  </div>

                  <div className="line-clamp-1 text-[13px] text-gray-600">
                    Hôm nay bạn như thế nào rồi. Kể tôi nghe đi
                  </div>
                </div>
              </div>
              <div className="flex gap-3 cursor-pointer  hover:bg-gray-200 px-3 py-4">
                <img
                  src="https://jbagy.me/wp-content/uploads/2025/03/Hinh-anh-avatar-nam-cute-5-1.jpg"
                  alt=""
                  className="w-[45px] rounded-full"
                />
                <div className="flex flex-col justify-between">
                  <div className="flex justify-between">
                    <div className="text-[15px]">Nguyễn Văn A</div>
                    <span className="text-[13px] text-gray-600">3 giờ</span>
                  </div>

                  <div className="line-clamp-1 text-[13px] text-gray-600">
                    Hôm nay bạn như thế nào rồi. Kể tôi nghe đi
                  </div>
                </div>
              </div>
              <div className="flex gap-3 cursor-pointer  hover:bg-gray-200 px-3 py-4">
                <img
                  src="https://jbagy.me/wp-content/uploads/2025/03/Hinh-anh-avatar-nam-cute-5-1.jpg"
                  alt=""
                  className="w-[45px] rounded-full"
                />
                <div className="flex flex-col justify-between">
                  <div className="flex justify-between">
                    <div className="text-[15px]">Nguyễn Văn A</div>
                    <span className="text-[13px] text-gray-600">3 giờ</span>
                  </div>

                  <div className="line-clamp-1 text-[13px] text-gray-600">
                    Hôm nay bạn như thế nào rồi. Kể tôi nghe đi
                  </div>
                </div>
              </div>
              <div className="flex gap-3 cursor-pointer  hover:bg-gray-200 px-3 py-4">
                <img
                  src="https://jbagy.me/wp-content/uploads/2025/03/Hinh-anh-avatar-nam-cute-5-1.jpg"
                  alt=""
                  className="w-[45px] rounded-full"
                />
                <div className="flex flex-col justify-between">
                  <div className="flex justify-between">
                    <div className="text-[15px]">Nguyễn Văn A</div>
                    <span className="text-[13px] text-gray-600">3 giờ</span>
                  </div>

                  <div className="line-clamp-1 text-[13px] text-gray-600">
                    Hôm nay bạn như thế nào rồi. Kể tôi nghe đi
                  </div>
                </div>
              </div>
              <div className="flex gap-3 cursor-pointer  hover:bg-gray-200 px-3 py-4">
                <img
                  src="https://jbagy.me/wp-content/uploads/2025/03/Hinh-anh-avatar-nam-cute-5-1.jpg"
                  alt=""
                  className="w-[45px] rounded-full"
                />
                <div className="flex flex-col justify-between">
                  <div className="flex justify-between">
                    <div className="text-[15px]">Nguyễn Văn A</div>
                    <span className="text-[13px] text-gray-600">3 giờ</span>
                  </div>

                  <div className="line-clamp-1 text-[13px] text-gray-600">
                    Hôm nay bạn như thế nào rồi. Kể tôi nghe đi
                  </div>
                </div>
              </div>
              <div className="flex gap-3 cursor-pointer  hover:bg-gray-200 px-3 py-4">
                <img
                  src="https://jbagy.me/wp-content/uploads/2025/03/Hinh-anh-avatar-nam-cute-5-1.jpg"
                  alt=""
                  className="w-[45px] rounded-full"
                />
                <div className="flex flex-col justify-between">
                  <div className="flex justify-between">
                    <div className="text-[15px]">Nguyễn Văn A</div>
                    <span className="text-[13px] text-gray-600">3 giờ</span>
                  </div>

                  <div className="line-clamp-1 text-[13px] text-gray-600">
                    Hôm nay bạn như thế nào rồi. Kể tôi nghe đi
                  </div>
                </div>
              </div>
              <div className="flex gap-3 cursor-pointer  hover:bg-gray-200 px-3 py-4">
                <img
                  src="https://jbagy.me/wp-content/uploads/2025/03/Hinh-anh-avatar-nam-cute-5-1.jpg"
                  alt=""
                  className="w-[45px] rounded-full"
                />
                <div className="flex flex-col justify-between">
                  <div className="flex justify-between">
                    <div className="text-[15px]">Nguyễn Văn A</div>
                    <span className="text-[13px] text-gray-600">3 giờ</span>
                  </div>

                  <div className="line-clamp-1 text-[13px] text-gray-600">
                    Hôm nay bạn như thế nào rồi. Kể tôi nghe đi
                  </div>
                </div>
              </div>
              <div className="flex gap-3 cursor-pointer py-2 hover:bg-gray-200 px-3 py-4">
                <img
                  src="https://jbagy.me/wp-content/uploads/2025/03/Hinh-anh-avatar-nam-cute-5-1.jpg"
                  alt=""
                  className="w-[45px] rounded-full"
                />
                <div className="flex flex-col justify-between">
                  <div className="flex justify-between">
                    <div className="text-[15px]">Nguyễn Văn A</div>
                    <span className="text-[13px] text-gray-600">3 giờ</span>
                  </div>

                  <div className="line-clamp-1 text-[13px] text-gray-600">
                    Hôm nay bạn như thế nào rồi. Kể tôi nghe đi
                  </div>
                </div>
              </div>
              <div className="flex gap-3 cursor-pointer py-2 hover:bg-gray-200 px-3 py-4">
                <img
                  src="https://jbagy.me/wp-content/uploads/2025/03/Hinh-anh-avatar-nam-cute-5-1.jpg"
                  alt=""
                  className="w-[45px] rounded-full"
                />
                <div className="flex flex-col justify-between">
                  <div className="flex justify-between">
                    <div className="text-[15px]">Nguyễn Văn A</div>
                    <span className="text-[13px] text-gray-600">3 giờ</span>
                  </div>

                  <div className="line-clamp-1 text-[13px] text-gray-600">
                    Hôm nay bạn như thế nào rồi. Kể tôi nghe đi
                  </div>
                </div>
              </div>
              <div className="flex gap-3 cursor-pointer py-2 hover:bg-gray-200 px-3 py-4">
                <img
                  src="https://jbagy.me/wp-content/uploads/2025/03/Hinh-anh-avatar-nam-cute-5-1.jpg"
                  alt=""
                  className="w-[45px] rounded-full"
                />
                <div className="flex flex-col justify-between">
                  <div className="flex justify-between">
                    <div className="text-[15px]">Nguyễn Văn A</div>
                    <span className="text-[13px] text-gray-600">3 giờ</span>
                  </div>

                  <div className="line-clamp-1 text-[13px] text-gray-600">
                    Hôm nay bạn như thế nào rồi. Kể tôi nghe đi
                  </div>
                </div>
              </div> */}
            </div>
          </div>
        )}
      </div>
      <div className="flex-1">
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
