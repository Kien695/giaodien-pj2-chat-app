import { AiOutlineUsergroupAdd } from "react-icons/ai";
import { MdOutlineKeyboardArrowLeft } from "react-icons/md";
import { useNavigate } from "react-router-dom";

export default function AddGroup() {
  const navigate = useNavigate();
  return (
    <div className="app-page flex h-screen w-full flex-col px-5">
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
      <div className="mt-4 flex items-center justify-center">
        <div className="app-card flex w-full items-center justify-center rounded-md border p-10 text-[20px] font-[500] italic shadow-md">
          Không có lời mời nào!
        </div>
      </div>
    </div>
  );
}
