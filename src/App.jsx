import { useEffect, useState } from "react";
//toastyfy
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";
import AllRouter from "./Components/AllRouter";
import { useDispatch } from "react-redux";
import { getData } from "./utils/api";
import { setUser } from "./redux/userSlice";

function App() {
  const [login, setLogin] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("accessToken");
      if (token) {
        setLogin(true);
        const resUser = await getData("/auth/getUser");
        if (resUser.success) {
          dispatch(setUser(resUser.data));
        }
      }
    };
    fetchData();
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
