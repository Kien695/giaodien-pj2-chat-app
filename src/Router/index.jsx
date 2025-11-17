import { Children } from "react";

import { Navigate } from "react-router-dom";
import { Auth } from "../Page/Auth";
import Verify from "../Page/verify";
import ResetPassword from "../Page/resetPassword";
import AuthSuccess from "../Page/AuthSuccess";
import ProtectedRouter from "../Components/protectedRouter";
import Home from "../Page/Home";
import Layout from "../Layout";

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
      { path: "chat/:id", element: <Home /> }, // /123, /456, ...
    ],
  },

  { path: "*", element: <Navigate to="/auth" /> },
];
