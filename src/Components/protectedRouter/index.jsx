import React from "react";
import { Navigate } from "react-router-dom";

export default function ProtectedRouter({ children }) {
  const token = localStorage.getItem("accessToken");
  return token ? children : <Navigate to="/auth"></Navigate>;
}
