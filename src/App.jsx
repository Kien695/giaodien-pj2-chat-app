import { useEffect, useState } from "react";
//toastyfy
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import "./App.css";
import AllRouter from "./Components/AllRouter";
import { useDispatch, useSelector } from "react-redux";
import { getData } from "./utils/api";
import {
  setListFriend,
  setUser,
  setCountFriend,
  setListGroup,
  setCountGroup,
} from "./redux/userSlice";

function App() {
  const isLogin = useSelector((state) => state.user);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) return;
      const resUser = await getData("/auth/getUser");
      if (resUser.success) {
        dispatch(setUser(resUser.data));
      }
      const resListFriend = await getData("/auth/friendList");
      if (resListFriend.success) {
        dispatch(setListFriend(resListFriend.data));
        dispatch(setCountFriend(resListFriend.count));
      }
      const resListGroup = await getData("/auth/getRoom");
      if (resListGroup.success) {
        dispatch(setListGroup(resListGroup.data));
        dispatch(setCountGroup(resListGroup.count));
      }
    };
    if (isLogin) {
      fetchData();
    }
  }, [dispatch]);

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
