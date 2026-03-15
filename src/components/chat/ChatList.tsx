import React from "react";

import axios from "axios";
import type { ApiResponse } from "../../lib/apiResponse";
import axiosInstance from "../../lib/axios";
type Me = {
  fullName?: string;
  email?: string;
  profilePic?: string;
};
type ChatType = "private" | "group";
type LastMessageType = "audio" | "image" | "video" | "text";

interface Chats {
  _id: string;
  participants: string[];
  lastMessage: string;
  lastMessageType: LastMessageType;
  type: ChatType;
  createdAt: Date;
  updatedAt: Date;
}
const ChatListChatBox: React.FC<{
  chat: Chats;
  setSelectedChat: React.Dispatch<React.SetStateAction<string>>;
}> = React.memo(({ chat, setSelectedChat }) => {
  return (
    <div
      onClick={() => setSelectedChat(chat._id)}
      className=" flex hover:scale-[1.1] justify-start w-full gap-x-4 items-center"
    >
      <div className="w-10 h-10 rounded-full bg-red-400"></div>
      <div className="flex flex-col">
        <span className="font-bold">{chat?.participants[0] || "loading"} </span>
        <span>online</span>
      </div>
    </div>
  );
});
const ChatList: React.FC<{
  me: Me;
  setSelectedChat: React.Dispatch<React.SetStateAction<string>>;
}> = ({ me, setSelectedChat }) => {
  const [chats, setChats] = React.useState<Chats[]>([]);
  const [chatsLoading, setChatsLoading] = React.useState<boolean>(false);
  const getChats = async () => {
    setChatsLoading(true);
    try {
      const res = await axiosInstance.get<ApiResponse<Chats[]>>(
        "/chats/get-chats",
        {
          timeout: 3000,
        },
      );

      if (res.data.success) {
        setChats(res.data.data);
      }
    } catch (err: any) {
      if (err.response) {
        alert(err.response.data?.message || "Server error");
      } else if (err.request) {
        alert("Internet connection problem or server unreachable");
      } else {
        alert(err.message || "Something went wrong");
      }
    } finally {
      setChatsLoading(false);
    }
  };
  React.useEffect(() => {
    getChats();
  }, []);
  if (chatsLoading) return <div>loading</div>;
  return (
    <div className="min-h-screen hidden border-r-2 border-slate-100 overflow-y-scroll gap-y-4 max-w-3xs xl:max-w-sm   w-full p-4 bg-white md:flex flex-col">
      <div className=" flex justify-start w-full gap-x-4 items-center">
        <div className="w-10 h-10 rounded-full bg-red-400"></div>
        <div className="flex flex-col">
          <span className="font-bold">{me?.fullName || "loading"} </span>
          <span>online</span>
        </div>
      </div>
      <div className="h-10 flex justify-start px-4 rounded-full scroll-smooth   bg-sky-100 gap-x-4 w-full items-center">
        <input
          type="text"
          placeholder="search"
          name="search"
          className="w-full h-full outline-0"
        />
      </div>
      <div className=" flex justify-evenly w-full px-4">
        <div className="p-2 hover:scale-[1.1] cursor-pointer transition-transform bg-sky-200 rounded-2xl">
          Chats
        </div>
        <div className="p-2 hover:scale-[1.1] cursor-pointer transition-transform bg-sky-200 rounded-2xl">
          Calls
        </div>
        <div className="p-2 hover:scale-[1.1] cursor-pointer transition-transform bg-sky-200 rounded-2xl">
          Groups
        </div>
      </div>
      <div className=" flex justify-start w-full gap-x-4 items-center">
        <div className="w-10 h-10 rounded-full bg-red-400"></div>
        <div className="flex flex-col">
          <span className="font-bold">{me?.fullName || "loading"} </span>
          <span>online</span>
        </div>
      </div>
      {chats.map((chat, idx) => {
        return (
          <ChatListChatBox setSelectedChat={setSelectedChat} chat={chat} />
        );
      })}
    </div>
  );
};

export default React.memo(ChatList);
