import React from "react";
import { AuthContext } from "../context/AuthContext";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
export const useAuth = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const context = React.useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  const { error, loading } = context;

  React.useEffect(() => {
    if (
      !loading &&
      error.err &&
      error?.status === 401 &&
      pathname !== "/signin" &&
      pathname !== "/signup"
    ) {
      navigate("/signin");
    } else if (!error.err && !loading) {
      navigate("/app/chat");
    }
  }, [error, loading, pathname, navigate]);

  return context;
};
