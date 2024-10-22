import express from "express";
import connectDB from "./connect.js";
{/*import User from "./models/user.js";
import Question from "./models/question.js";
import Reply from "./models/reply.js";*/}
import cors from "cors";
import dotenv from "dotenv"; // Load environment variables
import { Server } from "socket.io";
import authRoutes from './routes/authRoutes.js'; 
import userRoutes from './routes/userRoutes.js';

// Initialize environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// Connect to MongoDB Atlas
connectDB();

// Routes
app.get("/", (req, res) => {
  res.send("Hello World");
});

// Use auth routes for login and signup
app.use('/api', authRoutes); 
app.use('/api', userRoutes); // This handles login, signup, and other auth routes

// Other routes (if you have more to add in the future)

// WebSocket configuration
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const io = new Server(server, {
  secure: true,
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("socket connected");

  const users = [];
  for (let [id, socket] of io.of("/").sockets) {
    if (socket.handshake.auth._id)
      users.push({
        ...socket.handshake.auth,
        socketId: socket.handshake.auth._id,
      });
  }

  io.emit("user-connected", users);

  socket.on("join-room", ({ room, user }) => {
    socket.join(room);
  });

  socket.on("send-message", ({ message, room, user }) => {
    io.to(room).emit("receive-message", { message, user, room });
  });

  socket.on("disconnect", () => {
    const remainingUsers = users.filter(
      (user) => user.socketId !== socket.handshake.auth._id
    );
    io.emit("user-disconnected", remainingUsers);
  });
});
