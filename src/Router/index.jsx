import { Children } from "react";

import { Navigate } from "react-router-dom";
import { Auth } from "../Page/Auth";

export const routes = [
  { path: "/auth", element: <Auth /> },

  { path: "*", element: <Navigate to="/auth" /> },
];
