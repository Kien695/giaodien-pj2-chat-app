import React from "react";
import { routes } from "../../Router";
import { useRoutes } from "react-router-dom";
export default function AllRouter() {
  const element = useRoutes(routes);
  return <div>{element}</div>;
}
