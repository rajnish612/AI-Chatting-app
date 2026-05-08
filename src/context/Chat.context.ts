import React from "react";
import type { Chats } from "../components/types/chat.type";
import type { MediaConnection } from "peerjs";

export type CallerInfo = { fullName?: string; profilePic?: string };

export const ChatContext = React.createContext<{
  chats: Chats[];
  setChats: React.Dispatch<React.SetStateAction<Chats[]>>;
  onCall: boolean;
  setOnCall: React.Dispatch<React.SetStateAction<boolean>>;
  currentCall?: MediaConnection | null;
  setCurrentCall?: React.Dispatch<React.SetStateAction<MediaConnection | null>>;
  isOutgoing?: boolean;
  setIsOutgoing?: React.Dispatch<React.SetStateAction<boolean>>;
  caller?: CallerInfo | null;
  setCaller?: React.Dispatch<React.SetStateAction<CallerInfo | null>>;
  remoteStream?: MediaStream | null;
  setRemoteStream?: React.Dispatch<React.SetStateAction<MediaStream | null>>;
  localStream?: MediaStream | null;
  setLocalStream?: React.Dispatch<React.SetStateAction<MediaStream | null>>;
} | null>(null);
