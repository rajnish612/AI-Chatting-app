export type Participant = {
  userId: {
    _id: string;
    fullName: string;
    profilePic: string;
    isOnline?: boolean;
    botOn?: boolean;
  };
  lastSeen: Date;
};
