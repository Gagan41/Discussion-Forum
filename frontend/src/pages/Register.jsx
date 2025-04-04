import axios from "axios";
import React from "react";
import upload from "../utils/upload";
import { toast, Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import logo from "../images/logo.png";

const Register = () => {
  const [profileImage] = React.useState(
    "https://img.freepik.com/premium-vector/business-global-economy_24877-41082.jpg"
  );
  const navigate = useNavigate();
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [password_confirmation, setPassword_confirmation] = React.useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== password_confirmation) {
      toast.error("Password and Confirm Password do not match");
      return;
    }

    const user = {
      name,
      email,
      password,
      profileImage,
    };

    console.log("User data:", user);

    try {
      const res = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/send-otp`,
        user
      );
      console.log("Response status:", res.status);
      console.log("Response data:", res.data);
    
      if (res.status === 200) {
        toast.success("OTP sent to your email");
        navigate("/verify-otp", { state: { email, user } });
      }
    } catch (err) {
      console.error("Error:", err);
      // Check if error response has a message from the server
      if (err.response && err.response.data && err.response.data.message) {
        toast.error(err.response.data.message);
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    }
    
  };

  {
    /* const handleFile1 = async (e) => {
    e.preventDefault();

    const files = e.target?.files;
    if (files?.length > 0) {
      const data = new FormData();
      for (const file of files) {
        data.append("file", file);
      }
      //data.append("upload_preset", "fiverr");
      //const url = await upload(data);
      //setProfileImage(url);
      //toast.success("File Uploaded");
    }
  };*/
  }

  return (
    <div className="">
      <Toaster />
      <div className="dark:bg-[#32353F] flex flex-col items-center min-h-screen pt-6 sm:justify-center sm:pt-0">
        <div>
          <a href="/">
            <div className="md:flex-[0.5] flex-initial justify-center items-center">
              <img src={logo} alt="logo" className="w-32 cursor-pointer" />
            </div>
          </a>
        </div>
        <div
          className="w-[80%] md:w-full bg-white dark:bg-[#1E212A] border rounded-md 
          px-6 py-4 mt-6 overflow-hidden shadow-md sm:max-w-md"
        >
          <form>
            <label
              className="mx-auto flex flex-col items-center justify-center w-32 h-32 rounded-full border-2 border-gray-300 
              border-dashed cursor-pointer bg-gray-50 hover:bg-gray-100 dark:text-white"
            >
              <img className="rounded-full" src={profileImage} alt="" />
              <input
                id="dropzone-file"
                //type="file"
                className="hidden"
              />
            </label>
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 dark:text-white"
              >
                Name
              </label>
              <input
                onChange={(e) => setName(e.target.value)}
                type="text"
                name="name"
                className="border border-purple-200 mt-2 w-full h-10 px-3 rounded 
                outline-none shadow-sm"
              />
            </div>
            <div className="mt-4">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 dark:text-white"
              >
                Email
              </label>
              <input
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                name="email"
                className="border border-purple-200 mt-2 w-full h-10 px-3 rounded 
                outline-none shadow-sm"
              />
            </div>
            <div className="mt-4">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 dark:text-white"
              >
                Password
              </label>
              <input
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                name="password"
                className="border border-purple-200 mt-2 w-full h-10 px-3 rounded 
                outline-none shadow-sm"
              />
            </div>
            <div className="mt-4">
              <label
                htmlFor="password_confirmation"
                className="block text-sm font-medium text-gray-700 dark:text-white"
              >
                Confirm Password
              </label>
              <input
                onChange={(e) => setPassword_confirmation(e.target.value)}
                type="password"
                name="password_confirmation"
                className="border border-purple-200 mt-2 w-full h-10 px-3 rounded 
                outline-none shadow-sm"
              />
            </div>
            <div className="flex flex-col items-center justify-center mt-4">
              <button
                onClick={handleSubmit}
                className="inline-flex items-center px-4 py-2 text-xs font-semibold 
                tracking-widest text-white uppercase transition duration-150 ease-in-out 
                bg-purple-950 border border-transparent rounded-md active:bg-gray-900 false"
              >
                Register
              </button>
              <a
                className="text-sm text-gray-600 underline hover:text-gray-900 pt-1"
                href="/login"
              >
                Already have an account? Login
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
