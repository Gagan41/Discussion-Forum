import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import ProfileView from "./ProfileView.js"; // Import ProfileView component
import { toggle } from "../context/sidebarSlice";
import Hamburger from "../icons/Hamburger";
import Cancel from "../icons/Cancel";
import Logout from "../icons/Logout";
import Dark from "../icons/Dark";
import Light from "../icons/Light";
import logo from "../images/logoname.png";

const discussionTopics = [
  "Technology",
  "Climate",
  "Space exploration",
  "AI and ethics",
  "Social media",
  "Mental health",
  "Education",
  "Health",
  "Culture",
  "Politics",
  "Sports",
  "Public opinion",
  "History",
  "Economy",
  "Business",
  "Science",
  "Philosophy",
  "Art",
];

const Navbar = () => {
  const open = useSelector((state) => state.sidebar.open);
  const dark = useSelector((state) => state.theme.isDark);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleChange = (e) => {
    const query = e.target.value.toLowerCase();
    const filteredTopics = discussionTopics.filter((topic) =>
      topic.toLowerCase().includes(query)
    );
    console.log("Filtered Topics:", filteredTopics);
  };

  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <div
      className="fixed bg-white dark:bg-[#1E212A]
      top-0 left-0 right-0 z-10 h-14 shadow-md flex items-center justify-between
      px-4 md:px-20"
    >
      <div className="text-sm md:text-base font-bold text-purple-500 cursor-pointer flex items-center gap-4">
        <div
          onClick={() => dispatch(toggle())}
          className="transition-transform ease-linear duration-700 cursor-pointer"
        >
          {!open ? <Hamburger /> : <Cancel />}
        </div>
        <div className="md:flex-[0.5] flex-initial justify-center items-center">
        <img src={logo} alt="logo" className="w-32 cursor-pointer" />
      </div>
      </div>

      <div className="flex items-center gap-3">
        {dark ? <Light /> : <Dark />}

        <div className="flex items-center gap-5">
          {/* Logout Button for Laptop Screens */}
          <div
            className="hidden md:flex items-center justify-center gap-2 px-4 py-2 cursor-pointer 
    bg-purple-600 mx-4 rounded-md text-white"
            onClick={() => {
              localStorage.removeItem("user");
              navigate("/login");
            }}
          >
            Logout
          </div>

          <Logout />
          
          {/* Profile Picture with Clickable Dropdown */}
          <div className="relative">
            <img
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              src={
                user?.profileImage ||
                "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRFY677t7F_8Epm50xo5OfqI882l5OBOPKRDxDWeGo7OQ&s"
              }
              alt="profile"
              className="w-6 h-6 md:w-7 md:h-7 rounded-full cursor-pointer"
            />

            {/* Profile View Dropdown */}
            {isProfileOpen && (
              <div
                className="fixed inset-0 flex items-center justify-center bg-opacity-40 bg-black z-20"
                onClick={() => setIsProfileOpen(false)} // Close when clicking outside
              >
                <div
                  className="relative bg-gradient-to-br from-purple-950 rounded-md p-6 text-white w-full max-w-sm mx-auto"
                  onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
                >
                  <ProfileView user={user} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
