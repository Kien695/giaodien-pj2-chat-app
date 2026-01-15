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
import { socket } from "../../socket";
function Friend() {
  const dispatch = useDispatch();
  const [friendStatus, setFriendStatus] = useState({});
  const state = useSelector((state) => state.user);

  const { id } = useParams();
  const totalAccept = state.lengthAcceptFriend ?? 0;

  const [active, setActive] = useState(1);
  const [searchText, setSearchText] = useState("");
  const [user, setUser] = useState([]);
  const [text, setText] = useState("");
  //dialog
  const [open, setOpen] = React.useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };
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
  }, [socket]);
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
                                onClick={() => {
                                  setSelectedUser(item);
                                  setOpen(true);
                                }}
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
                                        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSsGuNeeq7R_EoWkiZPOvfRF5B0ZSbLCwRAnA&s"
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
