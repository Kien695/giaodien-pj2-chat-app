import { useState } from "react";
//toastyfy
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";
import AllRouter from "./Components/AllRouter";

function App() {
  return (
    <>
      <AllRouter />
      <ToastContainer
        position="top-right"
        autoClose={3000}
        closeButton={true}
        hideProgressBar={false}
      />
    </>
  );
}

export default App;
