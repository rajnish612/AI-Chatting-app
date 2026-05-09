export type Participant = {
  userId: {
    _id: string;
    fullName: string;
    profilePic: string;
    isOnline?: boolean;
  };
  lastSeen: Date;
};
