import { AiOutlineUsergroupAdd } from "react-icons/ai";
import { MdOutlineKeyboardArrowLeft } from "react-icons/md";
import { useNavigate } from "react-router-dom";

export default function AddGroup() {
  const navigate = useNavigate();
  return (
    <div className="w-full h-screen flex flex-col px-5">
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
      <div className="flex items-center justify-center">
        <div className="bg-gray-50 w-[100px] rounded-md shadow-md">
          Không có lời mời nào
        </div>
      </div>
    </div>
  );
}
