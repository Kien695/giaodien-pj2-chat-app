import React, { useState } from "react";

import {
  Link,
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import Function from "../Function";
function SideBar() {
  const [active, setActive] = useState(1);
  const navigate = useNavigate();
  const { id } = useParams();
  return (
    <div className="flex">
      <div className="w-[300px] bg-gray-50 border border-r h-screen">
        <Function />

        <div className="border-b-2 h-[4%] flex gap-2 px-3">
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

        <div className="h-[85%] overflow-y-scroll">
          <NavLink
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
          </div>
        </div>
      </div>
      <div className="flex-1">
        {id ? (
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
