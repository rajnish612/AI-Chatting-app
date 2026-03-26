import React from "react";
type Me = {
  _id?: string;
  fullName?: string;
  email?: string;
  profilePic?: string;
};
type ResponseError = {
  errorType: "none" | "server" | "internet" | "other";
  err: boolean;
  message: string;
  status?: number;
};

interface Auth {
  loading: boolean;
  me: Me;
  error: ResponseError;
}

export const AuthContext = React.createContext<Auth | null>(null);
