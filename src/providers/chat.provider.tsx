import React from "react";
import { ChatContext } from "../context/Chat.context";
import type { Chats } from "../components/types/chat.type";
export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [chats, setChats] = React.useState<Chats[]>([]);

  const handleUpdateChat = ({
    chatId,
    updatedChat,
  }: {
    chatId: string;
    updatedChat: Chats;
  }) => {
    setChats((prevChats) =>
      prevChats.map((chat) => (chat._id === chatId ? updatedChat : chat)),
    );
  };

  return (
    <ChatContext.Provider value={{ chats, setChats, handleUpdateChat }}>
      {children}
    </ChatContext.Provider>
  );
};
