import { AiOutlineUsergroupAdd } from "react-icons/ai";

export default function AddGroup() {
  return (
    <div className="w-full h-screen flex flex-col px-5">
      <div className="flex h-[8%] items-center   py-1 border-b flex-shrink-0">
        <div className="flex gap-3">
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
