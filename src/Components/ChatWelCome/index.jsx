import React from "react";

export default function ChatWelcome() {
  return (
    <div className="app-page w-full">
      <div
        className="flex min-h-screen w-full flex-col items-center justify-center gap-2 bg-cover bg-center dark:bg-blend-multiply"
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

        <div className="text-[18px] text-[var(--danger)]">
          Hãy bắt đầu cuộc trò chuyện với mợi người ngay đi nào !
        </div>
      </div>
    </div>
  );
}
