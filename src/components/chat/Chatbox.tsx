import React from "react";
import axiosInstance from "../../lib/axios";
import type { ApiResponse } from "../../lib/apiResponse";
import ChatCard from "./ChatCard";
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
type Me = {
  fullName?: string;
  email?: string;
  profilePic?: string;
};
const Chatbox: React.FC<{ selectedChat: string; me: Me }> = ({
  selectedChat,
  me,
}) => {
  const [err, setError] = React.useState<string>("");
  const [messages, setMessages] = React.useState<Message[]>([]);

  React.useEffect(() => {
    const fetchedMessages = async () => {
      try {
        const res = await axiosInstance.get<ApiResponse<Message[]>>(
          `/message/get-messages?chatId=${selectedChat}`,
        );

        if (res.data.success) {
          setMessages(res.data.data);
        }
      } catch (err: any) {
        if (err.response) {
          setError(err.response.data.message || "server error");
        } else if (err.request) {
          setError("Internet connection problem or server unreachable");
        } else {
          setError(err.message || "server error");
        }
      }
    };
    fetchedMessages();
  }, [selectedChat]);

  return (
    <div className="min-h-screen flex pb-5  justify-start flex-col items-center min-w-sm bg-white w-full">
      {!selectedChat ? (
        <div className="h-full bg-white flex justify-center items-center">
          No chat Selected
        </div>
      ) : (
        <>
          <div className=" flex justify-start w-full gap-x-4 p-3 border-b border-slate-400 items-center">
            <div className="w-10 h-10 rounded-full bg-red-400"></div>
            <div className="flex flex-col">
              <span className="font-bold"> "loading"</span>
              <span>online</span>
            </div>
          </div>
          <div className="h-full overflow-y-scroll flex flex-col justify-start  p-2 w-full">
            {messages.map((message, idx) => (
              <ChatCard key={idx} message={message} me={me} />
            ))}
          </div>
          <div className="max-w-[90%] w-full rounded-full  flex justify-center items-center p-3 border  border-slate-200 mt-auto">
            <input
              type="text"
              className="w-full outline-0  bg-white"
              placeholder="enter text"
              name="message"
            />
            <button
              className=" bg-blue-300 p-2 rounded-full text-white"
              type="submit"
            >
              Send
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default React.memo(Chatbox);
