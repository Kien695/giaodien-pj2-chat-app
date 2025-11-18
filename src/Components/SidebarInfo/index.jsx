import { InputAdornment, TextField, Tooltip } from "@mui/material";
import React from "react";
import { IoSearch } from "react-icons/io5";
import { AiOutlineUserAdd } from "react-icons/ai";
import { AiOutlineUsergroupAdd } from "react-icons/ai";
function SideBar() {
  return (
    <div className="w-[33%] bg-gray-50 border border-r ">
      <div className="flex h-[10%] items-center justify-between px-3 py-3">
        <TextField
          variant="outlined"
          placeholder="Tìm kiếm..."
          size="small"
          sx={{
            "& .MuiInputBase-input": {
              padding: "5px 10px", // thu nhỏ chiều cao
              fontSize: "14px",
            },
            "& .MuiInputBase-root": {
              borderRadius: "8px",
            },
          }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <IoSearch />
                </InputAdornment>
              ),
            },
          }}
        />
        <div className="flex gap-3">
          <Tooltip title="Thêm bạn bè" placement="top-end">
            <AiOutlineUserAdd className="text-[20px]" />
          </Tooltip>
          <Tooltip title="Tạo nhóm" placement="top-end">
            <AiOutlineUsergroupAdd className="text-[20px]" />
          </Tooltip>
        </div>
      </div>
      <div className="border-b-2 h-[4%] flex gap-2 px-3">
        <div className="text-[13px] font-[500] cursor-pointer">Tất cả</div>
        <div className="text-[13px] font-[500] cursor-pointer">Chưa đọc</div>
      </div>

      <div className="h-[85%] overflow-y-scroll">
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
  );
}

export default SideBar;
