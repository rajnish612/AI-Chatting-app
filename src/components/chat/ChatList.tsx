import React from "react";

import type { ApiResponse } from "../../lib/apiResponse";
import axiosInstance from "../../lib/axios";
import socket from "../../lib/socket";
type Me = {
  _id?: string;
  fullName?: string;
  email?: string;
  profilePic?: string;
};
type ChatType = "private" | "group";
type LastMessageType = "audio" | "image" | "video" | "text";
type User = {
  _id?: string;
  fullName?: string;
  email?: string;
  profilePic?: string;
};
type Participant = {
  userId: {
    _id: string;
    fullName: string;
    profilePic: string;
  };
  lastSeen: Date;
};
interface Chats {
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
const ChatListChatBox: React.FC<{
  chat: Chats;
  selectedChat: string;
  setSelectedChat: React.Dispatch<React.SetStateAction<string>>;
  handleSelectedChat: (chatId: string) => void;
}> = React.memo(
  ({ chat, selectedChat, setSelectedChat, handleSelectedChat }) => {
    const [chatName, setChatName] = React.useState<string>("");
    const [chatPic, setChatPic] = React.useState<string>("");

    React.useEffect(() => {
      if (chat.name && chat.type === "group") {
        setChatName(chat.name);
      } else if (
        !chat.name &&
        chat.type === "private" &&
        chat.participants.length === 1
      ) {
        setChatName(chat.participants[0].userId.fullName);
        setChatPic(chat.participants[0].userId.profilePic);
      }
    }, [chat.name, chat.type, chat.participants]);
    console.log("chat", chat);

    return (
      <div
        onClick={() => {
          handleSelectedChat(chat._id);
        }}
        className=" flex hover:scale-[1.1] justify-start w-full gap-x-4 items-center"
      >
        <div className="min-w-10 relative h-10 rounded-full bg-red-400">
          {chat?.unseenCount && chat?.unseenCount > 0 && (
            <div className="absolute -top-2 -left-2  rounded-full bg-yellow-200 flex justify-center items-center w-6 text-center h-6 text-white">
              {chat.unseenCount}
            </div>
          )}
        </div>
        <div className="flex flex-col">
          <span className="font-bold break-all ">
            {!chat.name ? chatName : chat.name || "user"}{" "}
          </span>
          <span>online</span>
        </div>
      </div>
    );
  },
);
const ChatList: React.FC<{
  me: Me;
  setSelectedChat: React.Dispatch<React.SetStateAction<string>>;
  selectedChat: string;
}> = ({ me, setSelectedChat, selectedChat }) => {
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
  React.useEffect(() => {
    const handleUnseenCount = ({ chatId }: { chatId: string }) => {
      if (selectedChat === chatId) return;
      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat._id === chatId
            ? { ...chat, unseenCount: (chat.unseenCount || 0) + 1 }
            : chat,
        ),
      );
    };
    socket.on("count-unseen", handleUnseenCount);
    return () => {
      socket.off("count-unseen", handleUnseenCount);
    };
  }, [selectedChat]);
  const handleSelectedChat = (chatId: string) => {
    setSelectedChat(chatId);
    setChats((prevChats) =>
      prevChats.map((chat) =>
        chat._id === chatId ? { ...chat, unseenCount: 0 } : chat,
      ),
    );
  };

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
          <ChatListChatBox
            key={idx}
            handleSelectedChat={handleSelectedChat}
            selectedChat={selectedChat}
            setSelectedChat={setSelectedChat}
            chat={chat}
          />
        );
      })}
    </div>
  );
};

export default React.memo(ChatList);
