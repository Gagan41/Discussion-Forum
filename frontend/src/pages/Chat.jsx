import React, { useEffect, useState } from "react";
import Write from "../icons/Write";
import moment from "moment";
import { socket } from "../App"; // Ensure this imports the socket.io-client instance
import { useSelector, useDispatch } from "react-redux";
import { setOnlineUsers, addUsers, removeUsers } from "../context/onlineSlice"; // Import actions

const discussionTopics = [
  "technology", "Climate", "Space", "Artificial intelligence", "Social media",
  "health", "education", "globalization", "culture", "Political", "Sports", "Public opinion",
];

const Chat = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState(
    JSON.parse(localStorage.getItem("messages")) || {
      technology: [],
      Climate: [],
      Space: [],
      health: [],
      education: [],
      globalization: [],
      culture: [],
      Political: [],
      Sports: [],
    }
  );

  const storedUser = JSON.parse(localStorage.getItem("user"));
  const [user] = useState(storedUser);
  const [room, setRoom] = useState(localStorage.getItem("room") || "technology");

  const onlineUsers = useSelector((state) => state.online.onlineUsers);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!user) {
      console.error("User is not defined");
      return;
    }

    const storedRoom = localStorage.getItem("room") || "technology";
    setRoom(storedRoom);

    if (socket.connected) {
      socket.emit("join-room", { room: storedRoom, user });
    }

    socket.on("user-joined", (newUser) => {
      console.log("User joined:", newUser);
      dispatch(addUsers(newUser));
    });

    socket.on("user-left", (userId) => {
      console.log("User left:", userId);
      dispatch(removeUsers({ _id: userId }));
    });

    socket.on("receive-message", ({ message, room, user }) => {
      setMessages((prev) => {
        const updatedMessages = {
          ...prev,
          [room]: [
            ...(prev[room] || []),
            { message, user, createdAt: new Date() },
          ],
        };
        localStorage.setItem("messages", JSON.stringify(updatedMessages));
        return updatedMessages;
      });
    });

    socket.on("update-online-users", (users) => {
      dispatch(setOnlineUsers(users));
    });

    return () => {
      // Clean up socket listeners to prevent duplicate listeners when the component rerenders
      socket.off("user-joined");
      socket.off("user-left");
      socket.off("receive-message");
      socket.off("update-online-users");
    };
  }, [room, dispatch, user]);

  const handleClick = () => {
    if (message.trim() !== "") {
      socket.emit("send-message", { message, room, user });
      setMessage("");
    }
  };

  const handleRoomChange = (newRoom) => {
    if (room !== newRoom) {
      setRoom(newRoom);
      localStorage.setItem("room", newRoom);
      if (socket.connected) {
        socket.emit("join-room", { room: newRoom, user });
      }
    }
  };

  return (
    <div className="h-full overflow-y-hidden w-full md:w-[60%] flex flex-col items-center gap-4 mt-8">
      {/* Online Users Display */}
      <div className="w-full md:w-[80%] text-sm md:text-base flex justify-between items-center dark:text-white">
        <h1 className="flex gap-4 text-sm md:text-base text-inherit">
          Online Users
          <span className="text-purple-600 text-sm flex gap-2">
            {onlineUsers.map((user) => (
              <img
                key={user._id}
                alt="profile"
                className="rounded-full h-6 md:h-8 w-6 md:w-8 bg-purple-100"
                src={user.profileImage}
              />
            ))}
          </span>
        </h1>
        <h1 className="text-sm md:text-base text-inherit">
          {onlineUsers.length ? onlineUsers.length : 0}
        </h1>
      </div>

      {/* Chat Box */}
      <div className="w-full relative border-2 overflow-y-scroll p-3 px-2 md:p-4 rounded-md md:w-[80%] h-[90%] md:h-[80%] flex flex-col">
        {messages[room]?.map((msg, index) => (
          <div key={index} className={`w-max mb-2 ${user?._id === msg.user._id ? "ml-auto" : ""}`}>
            <div className={`text-sm md:text-base text-white py-2 px-3 rounded-md ${user?._id === msg.user._id ? "bg-purple-600" : "bg-purple-400"}`}>
              {msg.message}
            </div>
            <span className="text-xs text-gray-500">
              {msg.user._id === user?._id ? "(You) " : msg.user.name + " "}
              {moment(msg.createdAt).fromNow()}
            </span>
          </div>
        ))}

        {/* Input area */}
        <div className="w-full mt-auto bg-purple-600 dark:bg-slate-900 flex items-center gap-2 px-2 md:px-5 py-1 md:py-2 rounded-lg shadow-md">
          <Write />
          <input
            onChange={(e) => setMessage(e.target.value)}
            className="w-full h-8 border-none outline-none rounded-md py-1 px-2"
            type="text"
            value={message}
            placeholder="Write a comment"
          />
          <svg
            onClick={handleClick}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-5 h-5 text-white cursor-pointer hover:scale-110 hover:translate-x-1 hover:transform transition-all duration-300"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
          </svg>
        </div>
      </div>

      {/* Room Selection */}
      <div className="w-full flex justify-center my-4 overflow-x-auto">
        <div className="flex gap-1">
          {discussionTopics.map((topic) => (
            <button
              key={topic}
              className={`px-2 py-1 text-sm rounded-md ${room === topic ? "bg-purple-600 text-white" : "bg-gray-300"}`}
              onClick={() => handleRoomChange(topic)}
            >
              {topic}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Chat;
