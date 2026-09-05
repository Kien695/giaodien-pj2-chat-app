import React, { useState } from "react";
import logoMyDocument from "../../assets/my-documents-icon-260nw-21989287.webp";
import ImageUploading from "react-images-uploading";
import { Button } from "@mui/material";
import { MdDevicesFold, MdOutlineOndemandVideo } from "react-icons/md";
import { SiIconify } from "react-icons/si";
import { GrImage } from "react-icons/gr";
import { FiPaperclip } from "react-icons/fi";
import { FaRegThumbsUp } from "react-icons/fa";
import { IoChevronDownSharp } from "react-icons/io5";
import { IoSend } from "react-icons/io5";
import { toast } from "react-toastify";
export default function MyDocument() {
  const [buttonActive, setButtonActive] = useState(false);
  const [message] = useState("");
  const [images] = useState([]);
  //button info chat
  const handleClickInfoChat = () => {
    setButtonActive(!buttonActive);
  };
  return (
    <div className="app-panel flex h-screen w-full">
      <div
        className={`flex flex-col h-full ${
          buttonActive ? "w-2/3" : "w-full"
        } app-divider border-r`}
      >
        <div className="app-divider flex h-[11%] flex-shrink-0 items-center justify-between border-b px-5 py-1">
          <div className="flex gap-3 relative">
            <img
              src={
                logoMyDocument ||
                "https://jbagy.me/wp-content/uploads/2025/03/Hinh-anh-avatar-nam-cute-5-1.jpg"
              }
              alt="avatar"
              className="w-[45px] rounded-full cursor-pointer"
            />

            <div className="flex flex-col ">
              <div className="text-[16px] font-[500] flex gap-2 items-center ">
                <span className="cursor-pointer">My Documents</span>
              </div>
              <div className="app-muted flex cursor-pointer items-center gap-1 text-[14px] hover:text-[var(--primary)]">
                Lưu trử thông tin cho riêng cá nhân
              </div>
            </div>
          </div>
          <Button>
            <MdDevicesFold
              className={`text-[20px] ${
                buttonActive ? "text-[var(--primary)]" : "text-[var(--muted)]"
              }`}
              onClick={handleClickInfoChat}
            />
          </Button>
        </div>
        <div className="flex flex-1 flex-col gap-2 overflow-y-auto bg-[var(--canvas)] px-5 pt-2"></div>
        <div className="app-divider flex h-[13%] flex-col border-t-2">
          <div className="app-divider relative flex gap-6 border-b-2 p-3">
            <ImageUploading multiple dataURLKey="data_url">
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
            <input type="file" id="upload-file" hidden multiple />

            <MdOutlineOndemandVideo
              className="text-[18px] cursor-pointer"
              onClick={() => {
                toast.error(
                  "Sorry bạn nha. Mình chưa làm chức năng này hehe :)"
                );
              }}
            />
          </div>

          <div className="flex items-center gap-2 px-3 h-12">
            <input
              type="text"
              placeholder="Nhập tin nhắn"
              className="app-input min-w-0 flex-1 border-none px-2 py-1"
            />
            {message.trim() !== "" || images.length > 0 ? (
              <IoSend className="text-blue-600 text-[23px]" />
            ) : (
              <FaRegThumbsUp className="text-blue-600 text-[25px] cursor-pointer" />
            )}
          </div>
        </div>
      </div>
      {buttonActive && (
        <div className="app-panel h-full w-1/3 overflow-y-auto">
          <div className="app-divider flex h-[11%] items-center justify-center border-b px-5 py-1 text-[17px] font-[500] text-[var(--text-primary)]">
            Thông tin hội thoại
          </div>
          <div className="flex flex-col gap-3 items-center justify-center py-5 border-b-8">
            <img
              src={
                "https://jbagy.me/wp-content/uploads/2025/03/Hinh-anh-avatar-nam-cute-5-1.jpg"
              }
              alt="avatar"
              className="w-[45px] rounded-full cursor-pointer"
            />

            <div className="text-[16px] font-[500]">My documents</div>
          </div>
          <div className="app-divider px-5 py-4 text-[var(--text-secondary)] border-b-8">
            <div className="flex items-center justify-between cursor-pointer select-none">
              <span className="font-medium">Ảnh</span>
              <IoChevronDownSharp className="transition-transform duration-200" />
            </div>
          </div>
          <div className="app-divider px-5 py-4 text-[var(--text-secondary)] border-b-8">
            <div className="flex items-center justify-between cursor-pointer select-none">
              <span className="font-medium">File</span>
              <IoChevronDownSharp className="transition-transform duration-200" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
