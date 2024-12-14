import React from "react";

const ProfileView = ({ user }) => {
  if (!user) {
    return <p className="text-gray-500">No user data available.</p>;
  }

  return (
    <div className="p-4">
      <div className="flex flex-col items-center">
        <img
          src={user.profileImage || "https://via.placeholder.com/100"}
          alt="Profile"
          className="w-16 h-16 rounded-full mb-2"
        />
        <h2 className="text-lg font-bold">{user.name || "User Name"}</h2>
        <p className="text-white text-base font-bold">{user.email || "user@example.com"}</p>
      </div>

      
    </div>
  );
};

export default ProfileView;