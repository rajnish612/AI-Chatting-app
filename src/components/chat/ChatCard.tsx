import React from "react";
import type { Me } from "../types/me.type";
import type { Participant } from "../types/participant.type";

import type { Message } from "../types/message.type";

interface Props {
  participants: Participant[];
  me: Me;
  message: Message;
}
const ChatCard: React.FC<Props> = ({ me, message, participants }) => {
  const filteredParticipants = participants.filter(
    (participant) => participant.userId._id != me._id,
  );
  const isSeen = filteredParticipants.some(
    (participant) => participant.lastSeen >= message.createdAt,
  );
  return (
    <div
      className={`max-w-[50%] w-fit  bg-slate-100 border ${me._id == message.senderId && "ml-auto"} rounded-lg gap-x-2 border-slate-500 flex justify-start items-center p-2`}
    >
      <div className="w-10 h-10 rounded-full bg-yellow-300" />
      <span>{message.text}</span>
      {me._id == message.senderId && (
        <span className="text-blue-300">{isSeen ? "seen" : "not seen"}</span>
      )}
    </div>
  );
};

export default React.memo(ChatCard);
