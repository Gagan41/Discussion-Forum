import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import ProfileView from "./ProfileView.js"; // Import ProfileView component
import { toggle } from "../context/sidebarSlice";
import Search from "../icons/Search";
import Hamburger from "../icons/Hamburger";
import Cancel from "../icons/Cancel";
import Logout from "../icons/Logout";
import Dark from "../icons/Dark";
import Light from "../icons/Light";

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
        H-Forum
      </div>

      {/* Search Bar */}
      <div
        className="searchbar hidden border-none outline-none rounded-md py-1 h-8 px-4 w-96 
        bg-gray-100 md:flex items-center"
      >
        <Search />
        <input
          onChange={handleChange}
          type="text"
          className="border-none outline-none rounded-md py-1 px-2 w-96 bg-gray-100"
          placeholder="Search for Topics"
        />
      </div>

      <div className="flex items-center gap-3">
        {dark ? <Light /> : <Dark />}
        
        {/* Logout Button */}
        <Logout />
        
        <div className="hidden md:flex items-center gap-5">
          <div
            className="flex items-center justify-center gap-2 px-4 py-2 cursor-pointer 
            bg-purple-600 mx-4 rounded-md text-white"
            onClick={() => {
              localStorage.removeItem("user");
              navigate("/login");
            }}
          >
            Logout
          </div>
          
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
              className="relative bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg rounded-md p-6 text-white"
              style={{ width: "300px" }}
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