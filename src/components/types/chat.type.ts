import type { Participant } from "./participant.type";
type ChatType = "private" | "group";
type LastMessageType = "audio" | "image" | "video" | "text";
export interface Chats {
  _id: string;
  unseenCount?: number;
  participants: Participant[];
  lastMessage: string;
  lastMessageType: LastMessageType;
  type: ChatType;
  createdAt: Date;
  updatedAt: Date;
  name?: string;
}
