import Content from "./components/Content";
import CreateButton from "./components/CreateButton";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import { Outlet, RouterProvider, createBrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Askquestion from "./components/Askquestion";
import Register from "./pages/Register";
import Login from "./pages/Login";
import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import React from "react";
import Chat from "./pages/Chat";
import Myanswers from "./pages/Myanswers";
import Explore from "./pages/Explore";
import Notfound from "./components/Notfound";
import { io } from "socket.io-client";
import config from "./config";
import { Provider } from "react-redux";
import store from "./store";

const queryClient = new QueryClient();

const Layout = ({ socket, users, toggleSidebar, sidebarOpen, toggleTheme }) => {
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
      window.location.href = "/login";
    }

    // Ensure socket exists before setting auth
    if (socket) {
      socket.auth = user;
      socket.connect();

      socket.on("connect", () => {
        console.log("Socket connected");
      });

      socket.on("user-connected", (users) => {
        console.log("users", users);
      });

      socket.on("user-disconnected", (users) => {
        console.log("users", users);
      });
    }

    const getUsers = async () => {
      try {
        const res = await axios.get(`${config.BACKEND_URL}/api/allusers`);
        users.setUsers(res.data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    if (users && users.setUsers) {
      getUsers();
    }

    // Cleanup socket listeners when component unmounts
    return () => {
      if (socket) {
        socket.off("user-connected");
        socket.off("user-disconnected");
        socket.disconnect();
      }
    };
  }, [socket, users]);

  return (
    <QueryClientProvider client={queryClient} contextSharing={true}>
      <div className="relative w-screen flex flex-col justify-center items-center overflow-x-hidden bg-white dark:bg-[#32353F]">
        <Navbar
          toggleSidebar={toggleSidebar}
          sidebarOpen={sidebarOpen}
          toggleTheme={toggleTheme}
        />
        <div className="w-full h-screen flex justify-center items-start px-4 md:px-12 pt-12 dark:bg-[#32353F]">
          <Sidebar open={sidebarOpen} toggleSidebar={toggleSidebar} />
          <Outlet />
          <div className="right-section hidden md:block h-80 fixed z-10 top-24 right-28">
            <CreateButton />
            <div className="mt-8 py-4 px-3 rounded-md flex flex-col items-start gap-5">
              <h2 className="text-gray-600 font-bold text-start">Top Users</h2>
              {users?.list?.length > 0 &&
                users.list.slice(0, 5).map((user, index) => {
                  return (
                    <div
                      className="flex items-center cursor-pointer"
                      key={index}
                    >
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
  { path: "/register", element: <Register /> },
  { path: "/login", element: <Login /> },
  {
    path: "/",
    element: <Layout />,
    children: [
      { path: "/", element: <Content /> },
      { path: "/ask", element: <Askquestion /> },
      { path: "/chat", element: <Chat /> },
      { path: "/explore", element: <Explore /> },
      { path: "/explore/:topic", element: <Content /> },
      { path: "/myqna", element: <Myanswers /> },
      { path: "*", element: <Notfound /> },
    ],
  },
  { path: "*", element: <Notfound /> },
]);

export default function App() {
  const [theme, setTheme] = useState(false); // Theme state
  const [sidebarOpen, setSidebarOpen] = useState(false); // Sidebar toggle state
  const [users, setUsers] = useState({ list: [] }); // Initialize as an object with a list property
  const socket = useMemo(
    () =>
      io(`${config.BACKEND_URL}`, {
        withCredentials: true,
        secure: true,
      }),
    []
  );

  const toggleTheme = () => setTheme((prevTheme) => !prevTheme); // Toggle Theme function
  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  return (
    <Provider store={store}>
      {" "}
      {/* Wrap entire RouterProvider in Redux Provider */}
      <div className={`h-screen ${theme ? "dark" : ""}`}>
        <RouterProvider
          router={router}
          createElement={(Component, props) => (
            <Component
              {...props}
              socket={socket}
              users={{ list: users.list, setUsers }}
              toggleTheme={toggleTheme}
              toggleSidebar={toggleSidebar}
              sidebarOpen={sidebarOpen}
            />
          )}
        />
      </div>
    </Provider>
  );
}
