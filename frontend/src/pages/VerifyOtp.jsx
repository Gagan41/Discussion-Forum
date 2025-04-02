import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";

const VerifyOtp = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { email, user } = location.state || {}; // Safeguard against missing state
  const [otp, setOtp] = useState("");

  // Redirect to register if required state is missing
  React.useEffect(() => {
    if (!email || !user) {
      toast.error("Missing information. Please register again.");
      navigate("/register", { replace: true });
    }
  }, [email, user, navigate]);

  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/verify-otp`,
        { email, otp }
      );
      if (res.status === 200) {
        toast.success("OTP verified successfully", { duration: 2000 });
        // Proceed with user registration
        await axios.post(`${process.env.REACT_APP_BACKEND_URL}/signup`, user);
        toast.success("User registered successfully. Please log in.", { duration: 2000 });
        navigate("/login", { replace: true });
      } else {
        toast.error("Invalid OTP. Please try again.");
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <Toaster />
      <h1 className="text-2xl font-bold mb-4">Verify OTP</h1>
      <p className="text-sm md:text-base text-black dark:text-white text-center">
        Please check the Email that you have provided <br />
        (If not found, check Spam Folder also.)
      </p>
      <div className="w-80 p-4 bg-white rounded shadow-md">
        <form onSubmit={handleVerifyOtp}>
          <label
            htmlFor="otp"
            className="block text-sm font-medium text-gray-700"
          >
            Enter OTP
          </label>
          <input
            type="text"
            name="otp"
            id="otp"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="block w-full p-2 mt-2 border rounded"
          />
          <button
            type="submit"
            className="w-full px-4 py-2 mt-4 text-white bg-purple-600 rounded"
          >
            Verify OTP
          </button>
        </form>
      </div>
    </div>
  );
};

export default VerifyOtp;
