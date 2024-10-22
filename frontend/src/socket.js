import { io } from "socket.io-client";
import config from './config';

// Get the user from localStorage (if available)
const user = JSON.parse(localStorage.getItem("user"));

// Initialize the socket connection with auth
const socket = io(`${config.BACKEND_URL}`, {
  withCredentials: true,
  secure: true,
  auth: {
    user, // Send user object (if available) as part of the socket's auth data
  },
});

export default socket;
