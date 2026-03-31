export interface Message {
  _id: string;
  senderId: string;
  text: string;
  image: string;
  createdAt: Date;
  updatedAt: Date;
  chatId: string;
  seenBy: string[];
}
