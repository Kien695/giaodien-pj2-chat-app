import { Children } from "react";

import { Navigate } from "react-router-dom";
import { Auth } from "../Page/Auth";
import Verify from "../Page/verify";
import ResetPassword from "../Page/resetPassword";
import AuthSuccess from "../Page/AuthSuccess";
import ProtectedRouter from "../Components/protectedRouter";

import Layout from "../Layout";

import SideBar from "../Components/SidebarInfo";
import ChatDetail from "../Page/ChatDetail";
import Friend from "../Components/Friend";
import Friends from "../Page/Friends";
import MyDocument from "../Page/MyDcument";

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
      {
        path: "chat",
        element: <SideBar />,
        children: [
          { path: "my-document", element: <MyDocument /> },
          { path: ":roomChatId", element: <ChatDetail /> },
        ],
      },

      {
        path: "friend",
        element: <Friend />,
        children: [{ path: ":id", element: <Friends /> }],
      },
    ],
  },
];
