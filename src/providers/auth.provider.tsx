import React from "react";
import axiosInstance from "../lib/axios";
import { AuthContext } from "../context/AuthContext";
type Me = {
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


export const AuthContextProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [loading, setLoading] = React.useState<boolean>(true);
  const [me, setMe] = React.useState<Me>({});
  const [error, setError] = React.useState<ResponseError>({
    errorType: "none",
    err: false,
    message: "",
    status: 0,
  });
  const checkAuth = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/auth/check-auth", {
        timeout: 3000,
      });

      if (res.data && res.data.success) {
        setMe(res.data.data);
      }
    } catch (err: any) {
      if (err.response) {
        setError({
          errorType: "server",
          status: err.response.status || 500,
          err: true,
          message: err.response.data.message || "request time out",
        });
      } else if (err.request) {
        setError({
          errorType: "other",
          status: 500,
          err: true,
          message: "Internet connection problem or server unreachable",
        });
      } else {
        setError({
          errorType: "other",
          status: 500,
          err: true,
          message: err.message || "request time out",
        });
      }
    } finally {
      setLoading(false);
    }
  };
  React.useEffect(() => {
    checkAuth();
  }, []);
  return (
    <AuthContext.Provider value={{ loading: loading, me: me, error: error }}>
      {children}
    </AuthContext.Provider>
  );
};
