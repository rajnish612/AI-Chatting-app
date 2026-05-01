import React from "react";
import axiosInstance from "../../lib/axios";
import type { ApiResponse } from "../../lib/apiResponse";
import type { Chats } from "../types/chat.type";
import type { User } from "../types/user.type";
interface UserProps extends User {
  setSelectedChat: React.Dispatch<React.SetStateAction<string>>;
  setNewChatModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}
const UserCard: React.FC<UserProps> = ({
  setSelectedChat,
  fullName,
  _id,
  setNewChatModalOpen,
}) => {
  const handleSelectChat = async () => {
    try {
      const res = await axiosInstance.get<ApiResponse<Chats>>(
        "/chats/create-or-get-private-chat?userId=" + _id,
        {
          timeout: 3000,
        },
      );
      if (res.data.success) {
        setNewChatModalOpen(false);

        setSelectedChat(res.data.data._id);
      }
    } catch (err) {
      console.log(err.response.data);
    }
  };
  return (
    <div className="w-full flex items-center justify-between">
      <div className="w-10 h-10 bg-amber-400 rounded-full" />
      <span>{fullName}</span>
      <div>
        <button onClick={handleSelectChat}>Message</button>
      </div>
    </div>
  );
};
interface ChatModelProps {
  setNewChatModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedChat: React.Dispatch<React.SetStateAction<string>>;
}
const ChatModel: React.FC<ChatModelProps> = ({
  setNewChatModalOpen,
  setSelectedChat,
}) => {
  const [users, setUsers] = React.useState<User[]>([]);
  const fetchUsers = async () => {
    try {
      const res = await axiosInstance.get<ApiResponse<User[]>>("/user");
      if (res.data.success) {
        setUsers(res.data.data);
      }
    } catch (err) {
    }
  };
  React.useEffect(() => {
    fetchUsers();
  }, []);
  return (
    <div className="absolute inset-0 z-10 flex justify-center items-center bg-black/10 backdrop-blur-xl">
      <div className="max-w-xl px-5 max-h-50 gap-y-3 flex flex-col  w-full bg-white p-2 rounded-lg">
        {users.map((user) => (
          <UserCard
            setNewChatModalOpen={setNewChatModalOpen}
            key={user._id}
            {...user}
            setSelectedChat={setSelectedChat}
          />
        ))}
      </div>
    </div>
  );
};

export default ChatModel;
