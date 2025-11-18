import { Children } from "react";

import { Navigate } from "react-router-dom";
import { Auth } from "../Page/Auth";
import Verify from "../Page/verify";
import ResetPassword from "../Page/resetPassword";
import AuthSuccess from "../Page/AuthSuccess";
import ProtectedRouter from "../Components/protectedRouter";

import Layout from "../Layout";
import Chat from "../Page/Chat";
import Home from "../Page/Home";

export const routes = [
  { path: "/auth", element: <Auth /> },
  { path: "/auth-success", element: <AuthSuccess /> },
  { path: "/verify", element: <Verify /> },
  { path: "/reset-password", element: <ResetPassword /> },
  {
    path: "/",
    element: (
      <ProtectedRouter>
        <Layout />
      </ProtectedRouter>
    ),
    children: [
      { path: "/", element: <Home /> },
      { path: "chat/:id", element: <Chat /> }, // /123, /456, ...
    ],
  },

  { path: "*", element: <Navigate to="/auth" /> },
];
