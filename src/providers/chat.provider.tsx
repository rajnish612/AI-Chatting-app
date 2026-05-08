import React from "react";
import { ChatContext } from "../context/Chat.context";
import type { Chats } from "../components/types/chat.type";
export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [chats, setChats] = React.useState<Chats[]>([]);
  const [onCall, setOnCall] = React.useState<boolean>(false);
  const [currentCall, setCurrentCall] = React.useState<any | null>(null);
  const [isOutgoing, setIsOutgoing] = React.useState<boolean>(false);
  const [caller, setCaller] = React.useState<{ fullName?: string; profilePic?: string } | null>(null);
  const [remoteStream, setRemoteStream] = React.useState<MediaStream | null>(null);
  const [localStream, setLocalStream] = React.useState<MediaStream | null>(null);
  // const handleUpdateChat = ({
  //   chatId,
  //   updatedChat,
  // }: {
  //   chatId: string;
  //   updatedChat: Chats;
  // }) => {
  //   setChats((prevChats) =>
  //     prevChats.map((chat) => (chat._id === chatId ? updatedChat : chat)),
  //   );
  // };

  return (
    <ChatContext.Provider value={{ chats, setChats, onCall, setOnCall, currentCall, setCurrentCall, isOutgoing, setIsOutgoing, caller, setCaller, remoteStream, setRemoteStream, localStream, setLocalStream }}>
      {children}
    </ChatContext.Provider>
  );
};
