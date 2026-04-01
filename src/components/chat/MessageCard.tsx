import React from "react";
import type { Me } from "../types/me.type";
import type { Participant } from "../types/participant.type";

import type { Message } from "../types/message.type";
import axiosInstance from "../../lib/axios";
import socket from "../../lib/socket";
interface Props {
  participants: Participant[];
  me: Me;
  message: Message;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
}
const MessageCard: React.FC<Props> = ({
  me,
  message,
  participants,
  setMessages,
}) => {
  const filteredParticipants = participants.filter(
    (participant) => participant.userId._id != me._id,
  );
  const isSeen = filteredParticipants.some(
    (participant) => participant.lastSeen >= message.createdAt,
  );
  const handleUnsendMessage = async () => {
    try {
      const res = await axiosInstance.post(
        `/message/unsend?_id=${message._id}`,
      );

      if (res.data.success) {
        setMessages((prev) => prev.filter((msg) => msg._id !== message._id));
      }
    } catch (err) {
      console.error("Error occurred while un sending message:", err.response);
    }
  };
  return (
    <div
      className={`max-w-[50%] w-fit flex flex-col  bg-slate-100 border ${me._id == message.senderId && "ml-auto"} rounded-lg gap-x-2 border-slate-500 flex justify-start items-center p-2`}
    >
      <div className="flex gap-x-2 ">
        <div className="w-10 h-10 rounded-full bg-yellow-300" />
        <span>{message.text}</span>
        {me._id == message.senderId && (
          <span className="text-blue-300">{isSeen ? "seen" : "not seen"}</span>
        )}
      </div>
      {me._id == message.senderId && (
        <button
          className="text-red-400 ml-auto"
          onClick={() => {
            handleUnsendMessage();
          }}
        >
          unsend
        </button>
      )}
    </div>
  );
};

export default React.memo(MessageCard);
