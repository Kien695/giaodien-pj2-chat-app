import React, { useEffect, useState } from "react";
import Function from "../Function";
import { NavLink, Outlet, useParams } from "react-router-dom";
import { LuUserPlus, LuUserRoundCheck } from "react-icons/lu";
import { FiUsers } from "react-icons/fi";
import { AiOutlineUsergroupAdd } from "react-icons/ai";
import { FcSearch } from "react-icons/fc";
import { Badge, Button, Dialog, DialogActions } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { resetAcceptFriends } from "../../redux/userSlice";
function Friend() {
  const dispatch = useDispatch();
  const [friendStatus, setFriendStatus] = useState({});
  const state = useSelector((state) => state.user);
  const socketConnection = state.socketConnection;
  const { id } = useParams();
  const totalAccept =
    (state.lengthAcceptFriend ?? 0) +
    Number(localStorage.getItem("lengthAcceptFriend") ?? 0);

  const [active, setActive] = useState(1);
  const [searchText, setSearchText] = useState("");
  const [user, setUser] = useState([]);
  const [text, setText] = useState("");
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
  }, [socketConnection]);
  //dark/mode
  const theme = useSelector((state) => state.theme.mode);
  return (
    <div className="flex">
      <div
        className={`w-full md:w-[300px]  ${id ? "hidden md:block" : "block"} ${
          theme == "dark" ? "bg-[#22262b] text-[#c2c5cd]" : "bg-gray-50 "
        }   border border-r h-screen`}
      >
        <Function setSearchText={setSearchText} setUser={setUser} />
        {searchText !== "" ? (
          <>
            {user.length > 0 ? (
              <div className="h-[89%]  flex py-4">
                <div className="flex flex-col gap-3">
                  {user.map((item, index) => (
                    <div
                      className="flex  gap-3 mx-3 rounded-md  items-center cursor-pointer bg-gray-100 border px-3 py-4 w-full h-[70px]"
                      key={index}
                    >
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
                          <Button
                            size="small"
                            color="error"
                            sx={{
                              textTransform: "none",
                            }}
                          >
                            Nhắn tin
                          </Button>
                          {friendStatus[item._id] === "pending" ||
                          item.friendStatus === "pending" ? (
                            <Button
                              size="small"
                              sx={{
                                textTransform: "none",
                              }}
                              onClick={() => handleCancelRequire(item._id)}
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
                                        "data:image/png;base64,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"
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
                                  <Button onClick={handleClose}>Hủy</Button>
                                  <Button
                                    onClick={() => handleSendRequire(item._id)}
                                    autoFocus
                                  >
                                    Gửi lời mời
                                  </Button>
                                </DialogActions>
                              </Dialog>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
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
          <>
            <NavLink
              to="/friend/1"
              className={({ isActive }) =>
                `cursor-pointer flex gap-4 ${
                  theme == "dark" ? "hover:bg-[#2d3136]" : "hover:bg-gray-100"
                }  font-[500] px-4 py-4 items-center  ${
                  isActive
                    ? `${theme == "dark" ? "bg-[#1f344d]" : "bg-gray-200"}`
                    : ""
                }`
              }
            >
              <LuUserRoundCheck className="text-[22px]" />
              <div className="text-[17px]">Danh sách bạn bè</div>
            </NavLink>
            <NavLink
              to="/friend/2"
              className={({ isActive }) =>
                `cursor-pointer flex gap-4  ${
                  theme == "dark" ? "hover:bg-[#2d3136]" : "hover:bg-gray-100"
                }  font-[500] px-4 py-4 items-center  ${
                  isActive
                    ? `${theme == "dark" ? "bg-[#1f344d]" : "bg-gray-200"}`
                    : ""
                }`
              }
            >
              <FiUsers className="text-[22px]" />
              <div className="text-[17px]">Danh sách nhóm</div>
            </NavLink>
            <NavLink
              to="/friend/3"
              className={({ isActive }) =>
                `cursor-pointer flex gap-4  ${
                  theme == "dark" ? "hover:bg-[#2d3136]" : "hover:bg-gray-100"
                }  font-[500] px-4 py-4 items-center  ${
                  isActive
                    ? `${theme == "dark" ? "bg-[#1f344d]" : "bg-gray-200"}`
                    : ""
                }`
              }
              onClick={() => {
                dispatch(resetAcceptFriends());
                localStorage.removeItem("lengthAcceptFriend");
              }}
            >
              {totalAccept > 0 ? (
                <>
                  <Badge
                    sx={{
                      "& .MuiBadge-badge": {
                        fontSize: "9px", // chữ nhỏ hơn
                        minWidth: 16,
                        height: 16,
                      },
                    }}
                    color="error"
                    badgeContent={totalAccept}
                    max={9}
                  >
                    <LuUserPlus className="text-[22px]" />
                  </Badge>
                  <div className="text-[17px]">Lời mời kết bạn</div>
                </>
              ) : (
                <>
                  <LuUserPlus className="text-[22px]" />
                  <div className="text-[17px]">Lời mời kết bạn</div>
                </>
              )}
            </NavLink>
            <NavLink
              to="/friend/4"
              className={({ isActive }) =>
                `cursor-pointer flex gap-4  ${
                  theme == "dark" ? "hover:bg-[#2d3136]" : "hover:bg-gray-100"
                }  font-[500] px-4 py-4 items-center  ${
                  isActive
                    ? `${theme == "dark" ? "bg-[#1f344d]" : "bg-gray-200"}`
                    : ""
                }`
              }
            >
              <AiOutlineUsergroupAdd className="text-[22px] " />
              <div className="text-[17px]">Lời mời vào nhóm</div>
            </NavLink>
          </>
        )}
      </div>
      <div
        className={`
            w-full flex-1
            ${id ? "block" : "hidden md:flex"}
          `}
      >
        <Outlet />
      </div>
    </div>
  );
}

export default Friend;
