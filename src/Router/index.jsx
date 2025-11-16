import { Children } from "react";

import { Navigate } from "react-router-dom";
import { Auth } from "../Page/Auth";
import Verify from "../Page/verify";

import Chat from "../Page/chat";
import ResetPassword from "../Page/resetPassword";
import AuthSuccess from "../Page/AuthSuccess";

export const routes = [
  { path: "/auth", element: <Auth /> },
  { path: "/auth-success", element: <AuthSuccess /> },
  { path: "/verify", element: <Verify /> },
  { path: "/reset-password", element: <ResetPassword /> },
  { path: "/chat", element: <Chat /> },

  { path: "*", element: <Navigate to="/auth" /> },
];
