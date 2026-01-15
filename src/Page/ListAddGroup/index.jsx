import { AiOutlineUsergroupAdd } from "react-icons/ai";
import { MdOutlineKeyboardArrowLeft } from "react-icons/md";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

export default function AddGroup() {
  const navigate = useNavigate();
  //dark/mode
  const theme = useSelector((state) => state.theme.mode);
  return (
    <div
      className={`w-full h-screen flex flex-col px-5 ${
        theme == "dark" ? "bg-[#16191d] text-[#c2c5cd]" : "text-[#4f5c6f]"
      }`}
    >
      <div className="flex h-[8%] items-center   py-1 border-b flex-shrink-0">
        <div className="flex gap-3">
          <MdOutlineKeyboardArrowLeft
            className="text-[30px] cursor-pointer md:hidden "
            onClick={() => {
              navigate("/friend");
            }}
          />
          <AiOutlineUsergroupAdd className="text-[22px]" />
          <div className="text-[16px]">Lời mời vào nhóm</div>
        </div>
      </div>
      <div className="flex items-center justify-center mt-4 shadow-md">
        <div className=" w-full p-10 flex items-center justify-center font-[500] rounded-md shadow-md italic text-[20px]">
          Không có lời mời nào!
        </div>
      </div>
    </div>
  );
}
