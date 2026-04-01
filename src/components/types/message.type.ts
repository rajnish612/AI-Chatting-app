export interface Message {
  _id: string;
  senderId: string;
  text: string;
  image: string;
  type: "text" | "image" | "video" | "audio";
  createdAt: Date;
  updatedAt: Date;
  chatId: string;
  seenBy: string[];
}
