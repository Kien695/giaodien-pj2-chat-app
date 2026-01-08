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
export default function MyDocument() {
  const [buttonActive, setButtonActive] = useState(false);
  const [message, setMessage] = useState("");
  const [images, setImages] = useState([]);
  //button info chat
  const handleClickInfoChat = () => {
    setButtonActive(!buttonActive);
  };
  return (
    <div className="w-full h-screen flex">
      <div
        className={`flex flex-col h-full ${
          buttonActive ? "w-2/3" : "w-full"
        } border-r`}
      >
        <div className="flex h-[11%] items-center justify-between px-5 py-1 border-b flex-shrink-0">
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
              <div className="text-[14px] text-gray-700 flex gap-1 cursor-pointer items-center hover:text-blue-500">
                Lưu trử thông tin cho riêng cá nhân
              </div>
            </div>
          </div>
          <Button>
            <MdDevicesFold
              className={`text-[20px] ${
                buttonActive ? "text-blue-500" : "text-gray-500"
              }`}
              onClick={handleClickInfoChat}
            />
          </Button>
        </div>
        <div className=" flex-1 px-5 bg-blue-50 flex flex-col  gap-2 overflow-y-auto pt-2"></div>
        <div className="flex flex-col border-t-2 h-[13%]">
          <div className="p-3 relative border-b-2 flex gap-6">
            <ImageUploading multiple dataURLKey="data_url">
              {({
                imageList,
                onImageUpload,
                onImageUpdate,
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
              className="flex-1  border-none focus:outline-none"
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
        <div className="w-1/3 h-full overflow-y-auto">
          <div className="flex h-[11%] items-center justify-center  px-5 py-1 border-b font-[500] text-[17px] text-gray-700">
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
          <div className="px-5 py-4 text-gray-700 border-b-8">
            <div className="flex items-center justify-between cursor-pointer select-none">
              <span className="font-medium">Ảnh</span>
              <IoChevronDownSharp className="transition-transform duration-200" />
            </div>
          </div>
          <div className="px-5 py-4 text-gray-700 border-b-8">
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
