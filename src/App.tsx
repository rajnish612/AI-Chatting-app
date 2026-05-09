import React from "react";
import { BrowserRouter, Outlet, Route, Routes } from "react-router-dom";
import SignUp from "./components/auth/SignUp";
import { AuthContextProvider } from "./providers/auth.provider";
import SignIn from "./components/auth/SignIn";
import Chat from "./components/chat/Chat";
import Profile from "./components/auth/Profile";
import ForgotPassword from "./components/auth/ForgotPassword";
const App = () => {

  return (
    <AuthContextProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<SignUp />} />
            <Route path="/app" element={<Outlet />}>
              <Route path="chat" element={<Chat />} />
              <Route path="profile" element={<Profile />} />
            </Route>
            <Route path="/signup" element={<SignUp />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
          </Routes>
        </BrowserRouter>
    </AuthContextProvider>
  );
};

export default App;
