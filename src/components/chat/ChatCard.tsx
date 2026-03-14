import React from "react";

const ChatCard: React.FC = () => {
  return (
    <div className="max-w-[50%] w-fit bg-slate-100 border rounded-lg gap-x-2 border-slate-500 flex justify-start items-center p-2">
      <div className="w-10 h-10 rounded-full bg-yellow-300" />
      <span>asdasdasdasd</span>
    </div>
  );
};

export default React.memo(ChatCard);
