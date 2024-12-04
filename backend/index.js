import express from "express";
import connectDB from "./connect.js";
import User from "./model/user.js";
import Question from "./model/question.js";
import Reply from "./model/reply.js";
import cors from "cors";
import { Server } from "socket.io";
import bcrypt from 'bcryptjs';
import multer from "multer";
import fs from "fs";
import Message from "./model/message.js";

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.get("/", (req, res) => {
  res.send("Hello World");
});

// create a new user
app.post("/signup", async (req, res) => {
  const { name, password, email, profileImage } = req.body;
  console.log("req.body", req.body);
  try {
    const findUser = await User.findOne({ name });
    if (findUser) {
      return res.status(400).json({ message: "Username already exists" });
    }
    const newUser = await User.create({ name, password, email, profileImage });
    return res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    // Check if the user exists
    const findUser = await User.findOne({ email });
    if (!findUser) {
      return res.status(400).json({ message: "User does not exist" });
    }

    // Compare entered password with the stored hashed password
    const isMatch = await bcrypt.compare(password, findUser.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect password" });
    }

    // Return user data on successful login
    res.status(200).json({
      _id: findUser._id,
      name: findUser.name,
      email: findUser.email,
      profileImage: findUser.profileImage,
    });
  } catch (error) {
    // Handle errors during login
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

const uploadsDir = "uploads";
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Directory to save images
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`); // Unique file name
  },
});

const upload = multer({ storage });

app.use(express.json()); // Parse JSON bodies

app.post("/ask-question", upload.single("image"), async (req, res) => {
  const { question, description, userId, tags } = req.body;
  const image = req.file ? req.file.path : null;

  try {
    const newQuestion = await Question.create({
      question,
      description,
      userId,
      tags: tags ? tags.split(",") : [],
      image,
    });
    return res.status(201).json(newQuestion);
  } catch (error) {
    console.error("Error saving question:", error.message, error.stack);
    res.status(500).json({ message: "Server Error" });
  }
});

app.use("/uploads", express.static("uploads"));

app.post("/answer/:id", async (req, res) => {
  const { answer, userId } = req.body;

  const { id: questionId } = req.params;
  try {
    const reply = await Reply.create({ reply: answer, author: userId });
    const findQuestion = await Question.findById(questionId);
    console.log("find", findQuestion);
    const addReply = await findQuestion.updateOne({
      $push: { replies: reply._id },
    });
    return res.status(201).json(reply);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

// general routes
app.get("/questions", async (req, res) => {
  try {
    const questions = await Question.find({})
      .populate("replies")
      .populate({
        path: "replies",
        populate: {
          path: "author",
          model: "DiscussionUser",
        },
      })
      .populate("userId")
      .sort({ createdAt: -1 });
    return res.status(200).json(questions);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

app.post("/upvote/:id", async (req, res) => {
  const { id: questionId } = req.params;
  const { userId } = req.body;
  try {
    const findQuestion = await Question.findById(questionId);
    if (findQuestion.upvote.includes(userId)) {
      return res.status(400).json({ message: "You have already upvoted" });
    }

    if (findQuestion.downvote.includes(userId)) {
      const downvote = await findQuestion.updateOne({
        $pull: { downvote: userId },
      });
      return res.status(200).json({ message: "Response updated successfully" });
    }

    const upvote = await findQuestion.updateOne({
      $push: { upvote: userId },
    });
    return res.status(200).json(upvote);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

app.post("/downvote/:id", async (req, res) => {
  const { id: questionId } = req.params;
  const { userId } = req.body;
  try {
    const findQuestion = await Question.findById(questionId);
    if (findQuestion.downvote.includes(userId)) {
      return res.status(400).json({ message: "You have already downvoted" });
    }

    if (findQuestion.upvote.includes(userId)) {
      const upvote = await findQuestion.updateOne({
        $pull: { upvote: userId },
      });
      return res.status(200).json({ message: "Response updated successfully" });
    }

    const downvote = await findQuestion.updateOne({
      $push: { downvote: userId },
    });
    return res.status(200).json(downvote);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

app.get("/allusers", async (req, res) => {
  try {
    const users = await User.find({});
    return res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

app.get("/my-questions/:id", async (req, res) => {
  const { id: userId } = req.params;
  try {
    const replies = await Question.find({ userId })
      .populate("replies")
      .populate({
        path: "replies",
        populate: {
          path: "author",
          model: "DiscussionUser",
        },
      })
      .populate("userId")
      .sort({
        createdAt: -1,
      });
    return res.status(200).json(replies);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

app.get("/find/:topic", async (req, res) => {
  const { topic } = req.params;
  try {
    const questions = await Question.find({
      tags: {
        $in: [new RegExp(topic, "i")], // Case-insensitive matching
      },
    })
      .populate("replies")
      .populate({
        path: "replies",
        populate: {
          path: "author",
          model: "DiscussionUser",
        },
      })
      .populate("userId")
      .sort({ createdAt: -1 });

    return res.status(200).json(questions);
  } catch (error) {
    console.error("Error finding questions:", error);
    res.status(500).json({ message: "Server Error" });
  }
});


const server = app.listen(PORT, () => {
  connectDB();
  console.log(`Server running on port ${PORT}`);
});

const io = new Server(server, {
  secure: true,
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

let connectedUsers = new Map();
let disconnectTimeouts = new Map();

// Fetch messages for a specific room
app.get("/messages/:room", async (req, res) => {
  const { room } = req.params;
  try {
    const messages = await Message.find({ room }).sort({ createdAt: 1 });
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

// Periodic deletion of old messages (older than 30 minutes)
setInterval(async () => {
  const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000); // 30 minutes ago
  try {
    await Message.deleteMany({ createdAt: { $lt: thirtyMinutesAgo } });
    console.log("Deleted messages older than 30 minutes");
  } catch (error) {
    console.error("Error deleting old messages:", error);
  }
}, 30 * 60 * 1000); // Run every 30 minutes


io.on("connection", (socket) => {
  console.log("socket connected", socket.id);

  const userId = socket.handshake.auth._id;
  if (userId) {
    // Clear any pending disconnection timeout for the user
    if (disconnectTimeouts.has(userId)) {
      clearTimeout(disconnectTimeouts.get(userId));
      disconnectTimeouts.delete(userId);
    }

    // Add or update user in connected users
    connectedUsers.set(userId, {
      ...socket.handshake.auth,
      socketId: socket.id,
    });

    // Notify all clients of the updated user list
    io.emit("user-connected", Array.from(connectedUsers.values()));
  }

  // Handle joining rooms
  socket.on("join-room", ({ room, user }) => {
    socket.join(room);
    io.to(room).emit("user-connected", Array.from(connectedUsers.values()));
  });

  // Send message in room with MongoDB persistence
  socket.on("send-message", async ({ message, room, user }) => {
    try {
      const newMessage = await Message.create({ room, message, user });
      io.to(room).emit("receive-message", newMessage);
    } catch (error) {
      console.error("Error saving message:", error);
    }
  });

  // Handle user logout explicitly
  socket.on("logout", () => {
    if (userId) {
      connectedUsers.delete(userId);
      io.emit("user-disconnected", Array.from(connectedUsers.values()));
    }
    socket.disconnect();
  });

  // Handle disconnection with a timeout to allow reconnection
  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);

    if (userId) {
      // Set a timeout before fully removing the user, allowing a brief reconnection window
      disconnectTimeouts.set(
        userId,
        setTimeout(() => {
          connectedUsers.delete(userId);
          disconnectTimeouts.delete(userId);
          io.emit("user-disconnected", Array.from(connectedUsers.values()));
        }, 3000) // 3-second delay to allow reconnection
      );
    }
  });

  // Handle reconnection
  socket.on("reconnect", () => {
    console.log("Socket reconnected:", socket.id);
    if (userId && connectedUsers.has(userId)) {
      // Re-add the user to rooms if they had been removed
      const userRooms = Array.from(socket.rooms).filter((room) => room !== socket.id);
      userRooms.forEach((room) => socket.join(room));

      io.emit("user-connected", Array.from(connectedUsers.values()));
    }
  });
});


export default app;