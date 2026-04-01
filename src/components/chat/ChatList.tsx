import React from "react";

import type { ApiResponse } from "../../lib/apiResponse";
import axiosInstance from "../../lib/axios";
import socket from "../../lib/socket";
import type { Me } from "../types/me.type";
import type { Chats } from "../types/chat.type";
import { useChat } from "../../hooks/useChat";

interface ChatListProps {
  chat: Chats;
  me: Me;
  setChats: React.Dispatch<React.SetStateAction<Chats[]>>;
  // selectedChat: string;
  // setSelectedChat: React.Dispatch<React.SetStateAction<string>>;
  handleSelectedChat: (chatId: string) => void;
}
const ChatListChatBox: React.FC<ChatListProps> = React.memo(
  ({ chat, handleSelectedChat, me, setChats }) => {
    const chatName = React.useMemo(() => {
      if (chat.type === "group") {
        return chat.name || "group";
      } else if (chat.type === "private") {
        return (
          chat.participants.filter(
            (participant) =>
              participant.userId._id.toString() !== me._id?.toString(),
          )[0]?.userId.fullName ||
          chat.name ||
          "user"
        );
      }
    }, [chat.type, chat.name, chat.participants, me]);
    const handleDeleteChat = async () => {
      try {
        const res = await axiosInstance.delete(
          `/chats/delete-chat?chatId=${chat._id}`,
        );
        if (res.data.success) {
          setChats((prevChats) => prevChats.filter((c) => c._id !== chat._id));
        }
      } catch (err: any) {
        if (err.response) {
          alert(err.response.data?.message || "Server error");
        } else if (err.request) {
          alert("Internet connection problem or server unreachable");
        } else {
          alert(err.message || "Something went wrong");
        }
      }
    };
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
        <div className="flex w-full  flex-col">
          <div className="flex  justify-between">
            <span className="font-bold break-all ">{chatName}</span>
            <span onClick={() => handleDeleteChat()} className="text-red-500">
              Delete
            </span>
          </div>
          <span>{chat?.lastMessage?.text || "No messages yet"}</span>
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
  const [chatsLoading, setChatsLoading] = React.useState<boolean>(false);
  const { chats, setChats } = useChat();
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
    const handleUpdateChat = ({
      chatId,
      updatedChat,
    }: {
      chatId: string;
      updatedChat: Chats;
    }) => {
      setChats((prevChats) => {
        return [
          {
            ...prevChats.find((chat) => chat._id === chatId),
            ...updatedChat,
            unseenCount:
              selectedChat === chatId
                ? 0
                : (prevChats.find((chat) => chat._id === chatId)?.unseenCount ||
                    0) + 1,
          },
          ...prevChats.filter((chat) => chat._id !== chatId),
        ];
      });
    };

    socket.on("chat-update", handleUpdateChat);
    return () => {
      socket.off("chat-update", handleUpdateChat);
    };
  }, [selectedChat, setChats]);
  React.useEffect(() => {
    const handleUpdateChat = ({
      chatId,
      updatedChat,
    }: {
      chatId: string;
      updatedChat: Chats;
    }) => {
      setChats((prevChats) => {
        return prevChats.map((chat) =>
          chat._id === chatId ? { ...chat, ...updatedChat } : chat,
        );
      });
    };

    socket.on("message-unsend", handleUpdateChat);
    return () => {
      socket.off("message-unsend", handleUpdateChat);
    };
  }, [selectedChat, setChats]);

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
      {chats.map((chat) => {
        return (
          <ChatListChatBox
            key={chat._id}
            setChats={setChats}
            me={me}
            handleSelectedChat={handleSelectedChat}
            // selectedChat={selectedChat}
            // setSelectedChat={setSelectedChat}
            chat={chat}
          />
        );
      })}
    </div>
  );
};

export default React.memo(ChatList);
