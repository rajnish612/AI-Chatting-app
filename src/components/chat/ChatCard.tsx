import React from "react";

type Me = {
  _id?: string;
  fullName?: string;
  email?: string;
  profilePic?: string;
};
type Participant = {
  userId: {
    _id: string;
    fullName: string;
    profilePic: string;
  };
  lastSeen: Date;
};
interface Message {
  _id: string;
  senderId: string;
  text: string;
  image: string;
  createdAt: Date;
  updatedAt: Date;
  chatId: string;
  seenBy: string[];
}
const ChatCard: React.FC<{
  participants: Participant[];
  me: Me;
  message: Message;
}> = ({ me, message, participants }) => {
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
