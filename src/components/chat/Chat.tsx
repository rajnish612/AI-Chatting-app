import React from "react";
import ChatList from "./ChatList";
import Chatbox from "./Chatbox";
import ChatDetails from "./ChatDetails";
import { useAuth } from "../../hooks/useAuth";

const Chat: React.FC = () => {
  const [selectedChat, setSelectedChat] = React.useState<string>("");
  const authContext = useAuth();
  const { loading, me, error } = authContext;

  if (loading) return <div>loading</div>;
  if (error.err) return <div>{error.message}</div>;

  return (
    <div className="min-h-screen   h-full w-full flex justify-start items-center bg-slate-100">
      <ChatList setSelectedChat={setSelectedChat} me={me} />
      <Chatbox me={me} selectedChat={selectedChat} />
      <ChatDetails />
    </div>
  );
};

export default React.memo(Chat);
