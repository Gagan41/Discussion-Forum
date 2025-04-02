import { useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [step, setStep] = useState(1); // 1: Enter Email, 2: Enter OTP, 3: Reset Password
  const navigate = useNavigate();

  // Step 1: Send OTP for password reset
  const handleSendOtp = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/send-reset-otp`,
        { email }
      );
      if (res.status === 200) {
        toast.success("OTP sent to your email");
        setStep(2); // Move to OTP verification step
      } else {
        toast.error("Failed to send OTP. Try again.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong. Try again.");
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/verify-reset-otp`,
        { email, otp }
      );
      if (res.status === 200) {
        toast.success("OTP verified. You can reset your password now.");
        setStep(3); // Move to password reset step
      } else {
        toast.error("Invalid OTP. Try again.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong. Try again.");
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    try {
      const res = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/reset-password`,
        { email, newPassword }
      );
      if (res.status === 200) {
        toast.success("Password reset successfully. Please login.");
        navigate("/login");
      } else {
        toast.error("Failed to reset password. Try again.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong. Try again.");
    }
  };

  return (
    <div className="h-screen flex justify-center items-center bg-gray-100">
      <ToastContainer />
      <div className="bg-white p-6 rounded shadow-md w-96">
        <h2 className="text-2xl font-bold mb-4 text-center">Reset Password</h2>

        {step === 1 && (
          <form onSubmit={handleSendOtp}>
            <div className="mb-4">
              <label className="block text-gray-700">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-purple-600 text-white py-2 rounded"
            >
              Send OTP
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyOtp}>
            <div className="mb-4">
              <p className="text-sm md:text-base text-black dark:text-white text-center">
                Please check the Email that you have provided <br />
                (If not found, check Spam Folder also.)
              </p>
              <label className="block text-gray-700">Enter OTP</label>
              <input
                type="text"
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-purple-600 text-white py-2 rounded"
            >
              Verify OTP
            </button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleResetPassword}>
            <div className="mb-4">
              <label className="block text-gray-700">New Password</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700">Confirm Password</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-purple-600 text-white py-2 rounded"
            >
              Reset Password
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
