import type { Message } from "./message.type";
import type { Participant } from "./participant.type";
type ChatType = "private" | "group";
export interface Chats {
  _id: string;
  unseenCount?: number;
  participants: Participant[];
  lastMessage: Message;
  type: ChatType;
  createdAt: Date;
  updatedAt: Date;
  name?: string;
}
