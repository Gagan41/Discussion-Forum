import Content from "./components/Content";
import CreateButton from "./components/CreateButton";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import { Outlet, RouterProvider, createBrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import Askquestion from "./components/Askquestion";
import Register from "./pages/Register";
import Login from "./pages/Login";
import { useEffect, useState } from "react";
import axios from "axios";
import React from "react";
import Chat from "./pages/Chat";
import Myanswers from "./pages/Myanswers";
import VerifyOtp from "./pages/VerifyOtp";
import Explore from "./pages/Explore";
import Notfound from "./components/Notfound";
import { useDispatch, useSelector } from "react-redux";
import { io } from "socket.io-client";
import { addUsers } from "./context/onlineSlice";
import ForgotPassword from "./pages/ForgotPassword";

const queryClient = new QueryClient();

export const socket = io(`${process.env.REACT_APP_BACKEND_URL}`, {
  withCredentials: true,
  secure: true,
});

const Layout = () => {
  const [users, setUsers] = useState([]);
  const dispatch = useDispatch();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
      window.location.href = "/login";
    }

    const handleUserConnected = (users) => {
      console.log("users", users);
      dispatch(addUsers(users));
    };

    const handleUserDisconnected = (users) => {
      console.log("users", users);
      dispatch(addUsers(users));
    };

    socket.connect();
    socket.on("connect", () => {
      console.log("socket connected");
    });
    socket.auth = user;

    socket.on("user-connected", (users) => {
      // console.log("users", users);

      dispatch(addUsers(users));
    });

    socket.on("user-disconnected", (users) => {
      console.log("users", users);
      dispatch(addUsers(users));
    });
    //console.log("backend url", process.env.REACT_APP_BACKEND_URL);
    const getUsers = async () => {
      const res = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/allusers`
      );
      setUsers(res.data);
    };
    getUsers();
    return () => {
      socket.off("user-connected", handleUserConnected);
      socket.off("user-disconnected", handleUserDisconnected);
    };
  }, [dispatch]);

  return (
    <QueryClientProvider client={queryClient} contextSharing={true}>
      <div
        className="relative w-screen flex flex-col justify-center items-center 
      overflow-x-hidden bg-white dark:bg-[#32353F]"
      >
        <Navbar />
        <div
          className="w-full h-screen flex justify-center items-start px-4 
        md:px-12 pt-12 dark:bg-[#32353F]"
        >
          <Sidebar />
          <Outlet />
          <div
            className="right-section
          hidden md:block
          h-80 fixed z-10 top-24 right-28"
          >
            <CreateButton />
            <div
              className="mt-8  py-4 px-3 rounded-md flex
         flex-col items-start gap-5"
              style={{ maxHeight: "400px", overflowY: " auto" }}
            >
              <h2 className="text-gray-600 font-bold text-start">Top Users</h2>
              {users.length > 0 &&
                users.slice(0, users.length).map((user, index) => {
                  // console.log("user", user);
                  return (
                    <div className="flex items-center cursor-pointer">
                      <img
                        src={user?.profileImage}
                        alt="profile"
                        className="w-6 h-6 rounded-full mr-2"
                      />
                      <h3 className="text-xs">{user.name}</h3>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </div>
    </QueryClientProvider>
  );
};

const router = createBrowserRouter([
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/verify-otp",
    element: <VerifyOtp />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/forgot-password", // Forgot Password route
    element: <ForgotPassword />,
  },
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        path: "/",
        element: <Content />,
      },
      {
        path: "/ask",
        element: <Askquestion />,
      },
      {
        path: "/chat",
        element: <Chat />,
      },
      {
        path: "/explore",
        element: <Explore />,
      },
      {
        path: "/explore/:topic",
        element: <Content />,
      },
      {
        path: "/myqna",
        element: <Myanswers />,
      },
      {
        path: "*",
        element: <Notfound />,
      },
    ],
  },
  {
    path: "*",
    element: <Notfound />,
  },
]);

export default function App() {
  const theme = useSelector((state) => state.theme.isDark);

  return (
    <div className={`h-screen ${theme ? "dark" : ""}`}>
      <RouterProvider router={router} />
    </div>
  );
}
