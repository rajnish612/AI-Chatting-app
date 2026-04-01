import React from "react";
import type { Chats } from "../components/types/chat.type";
export const ChatContext = React.createContext<{
  chats: Chats[];
  setChats: React.Dispatch<React.SetStateAction<Chats[]>>;
} | null>(null);
