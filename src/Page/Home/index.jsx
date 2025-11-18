import React from "react";

export default function Home() {
  return (
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
  );
}
