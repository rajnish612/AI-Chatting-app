import React from "react";
import axiosInstance from "../../lib/axios";
import type { ApiResponse } from "../../lib/apiResponse";
import ChatCard from "./ChatCard";
import socket from "../../lib/socket";
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
const Chatbox: React.FC<{
  selectedChat: string;
  me: Me;
}> = ({ selectedChat, me }) => {
  const [err, setError] = React.useState<string>("");
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [participants, setParticipants] = React.useState<Participant[]>([]);
  const [textMessage, setTextMessage] = React.useState<string>("");
  const [sendingMessage, setSendingMessage] = React.useState<boolean>(false);
  React.useEffect(() => {
    const fetchedMessages = async () => {
      if (!selectedChat) return;
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
  const sendTextMessage = async () => {
    if (!textMessage || sendingMessage) return;
    setSendingMessage(true);
    try {
      const res = await axiosInstance.post("/message/send/text-message", {
        chatId: selectedChat,
        message: textMessage,
      });
      if (res.data.success) {
        socket.emit("send-message", {
          message: res.data.data,
          chatId: selectedChat,
        });
        setMessages([...messages, res.data.data]);
      }
    } catch (err) {
      console.log("err", err);
    } finally {
      setSendingMessage(false);
    }
  };
  const updateLastSeen = React.useCallback(async () => {
    try {
      console.log("see message");

      const res = await axiosInstance.patch<ApiResponse<string>>(
        `/chats/update-lastseen?chatId=${selectedChat}`,
      );
      console.log("see", res);

      if (res.data.success) {
        console.log("last seen updated");

        console.log("successfully seen messages");
      }
    } catch (err) {
      console.log("see message runned", err);
    }
  }, [selectedChat]);
  React.useEffect(() => {
    if (selectedChat) {
      socket.emit("join-chat", { chatId: selectedChat });
    }
  }, [selectedChat]);
  React.useEffect(() => {
    const handleMessage = ({ message }: { message: Message }) => {
      updateLastSeen();
      setMessages((prev) => [...prev, message]);
    };

    socket.on("receive-message", handleMessage);

    return () => {
      socket.off("receive-message", handleMessage);
    };
  }, [updateLastSeen]);
  React.useEffect(() => {
    const handleMessageSeen = ({
      userId,
      lastSeen,
    }: {
      userId: string;
      lastSeen: Date;
    }) => {

      if (!selectedChat) return;
      setParticipants((prev) => {
        return prev.map((participant) => {
          if (participant.userId._id.toString() === userId) {
            return {
              ...participant,
              lastSeen: new Date(lastSeen),
            };
          } else {
            return {
              ...participant,
            };
          }
        });
      });
    };
    socket.on("message-seen", handleMessageSeen);
    return () => {
      socket.off("message-seen", handleMessageSeen);
    };
  }, [selectedChat]);
  React.useEffect(() => {
    if (selectedChat) {
      updateLastSeen();
    }
  }, [updateLastSeen, selectedChat]);
  React.useEffect(() => {
    const getParticipants = async () => {
      if (!selectedChat) return;
      try {
        const res = await axiosInstance.get<ApiResponse<Participant[]>>(
          `/chats/get-participants?chatId=${selectedChat}`,
        );
        if (res.data.success) {
          setParticipants(res.data.data);
        }
      } catch (err) {}
    };
    getParticipants();
  }, [selectedChat]);

  return (
    <div className=" flex pb-5 h-screen justify-start flex-col items-center min-w-sm bg-white w-full">
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
          <div className=" gap-y-2 overflow-y-scroll flex-1 flex flex-col justify-start  p-2 w-full">
            {messages.map((message, idx) => (
              <ChatCard
                participants={participants}
                key={idx}
                message={message}
                me={me}
              />
            ))}
          </div>
          <div className="max-w-[90%] w-full rounded-full  flex justify-center items-center p-3 border  border-slate-200 mt-auto">
            <input
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const { value } = e.target;
                setTextMessage(value);
              }}
              type="text"
              className="w-full outline-0  bg-white"
              placeholder="enter text"
              name="message"
            />
            <button
              disabled={sendingMessage}
              onClick={() => sendTextMessage()}
              className=" bg-blue-300 p-2 rounded-full text-white"
              type="submit"
            >
              {sendingMessage ? "sending" : "send"}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default React.memo(Chatbox);
