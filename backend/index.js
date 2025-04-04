import express from "express";
import connectDB from "./connect.js";
import User from "./model/user.js";
import Question from "./model/question.js";
import Reply from "./model/reply.js";
import cors from "cors";
import { Server } from "socket.io";
import bcrypt from 'bcryptjs';
import multer from "multer";
import Message from "./model/message.js";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:3000", "https://discuza.in"], // Use an array for multiple origins
    credentials: true,
  })
);

app.get("/", (req, res) => {
  res.send("Hello World");
});

// create a new user
app.post("/signup", async (req, res) => {
  const { name, password, email, profileImage } = req.body;
  try {
    const findUser = await User.findOne({ email });
    if (findUser) {
      return res.status(400).json({ message: "Username already exists with same Email" });
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

app.post("/send-reset-otp", (req, res) => {
  const { email } = req.body;

  // Generate a 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000);
  // Use a separate key for reset OTPs so they don't conflict with registration OTPs
  otpStore[`reset_${email}`] = otp;

  // Configure nodemailer transporter
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL, // Email from .env
      pass: process.env.EMAIL_PASSWORD, // App password from .env
    },
  });

  // Email content
  const mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: "Your OTP for Password Reset",
    text: `Your OTP for password reset is ${otp}. It is valid for 10 minutes.`,
  };

  // Send email
  transporter.sendMail(mailOptions, (error) => {
    if (error) {
      console.error("Error sending reset OTP email:", error);
      return res.status(500).send("Failed to send OTP");
    }
    console.log("Password reset OTP email sent to", email);
    res.status(200).send("OTP sent successfully");
  });
});

app.post("/verify-reset-otp", (req, res) => {
  const { email, otp } = req.body;
  // Check the OTP using the key for password reset
  if (otpStore[`reset_${email}`] && otpStore[`reset_${email}`] == otp) {
    delete otpStore[`reset_${email}`]; // OTP is valid, remove it from the store
    return res.status(200).send("OTP verified");
  }
  res.status(400).send("Invalid OTP");
});

app.post("/reset-password", async (req, res) => {
  const { email, newPassword } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    //console.log("New hashed password:", hashedPassword); // Debugging log
    user.password = hashedPassword;
    // Save the updated user document
    await user.save();

    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Multer setup for memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

app.use(express.json()); // Parse JSON bodies

// Route to ask a question
app.post("/ask-question", upload.single("image"), async (req, res) => {
  const { question, description, userId, tags } = req.body;

  try {
    // Prepare the question object
    const newQuestion = new Question({
      question,
      description,
      userId,
      tags: tags ? JSON.parse(tags) : [],
    });

    // If an image is uploaded, save its data
    if (req.file) {
      newQuestion.image = {
        data: req.file.buffer, // Store binary image data
        contentType: req.file.mimetype, // MIME type
      };
    }

    // Save the question in the database
    const savedQuestion = await newQuestion.save();
    return res.status(201).json(savedQuestion);
  } catch (error) {
    console.error("Error saving question:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
});

// Route to serve images
app.get("/questions/:id/image", async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question || !question.image) {
      return res.status(404).send("Image not found");
    }

    res.contentType(question.image.contentType);
    res.send(question.image.data);
  } catch (error) {
    console.error("Error retrieving image:", error.message);
    res.status(500).send("Server Error");
  }
});


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

let otpStore = {};

// Send OTP
app.post("/send-otp", async (req, res) => {
  const { email } = req.body;
  
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ message: "User already exists with same Email" });
  }
  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000);
  otpStore[email] = otp;

  // Configure nodemailer transporter
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL, // Email address from .env
      pass: process.env.EMAIL_PASSWORD, // App password from .env
    },
  });

  // Email content
  const mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: "Your OTP for Registration",
    text: `Your OTP is ${otp}. It is valid for 10 minutes.`,
  };

  // Send email
  transporter.sendMail(mailOptions, (error) => {
    if (error) {
      console.error("Error sending email:", error);
      return res.status(500).send("Failed to send OTP");
    }
    console.log("OTP email sent to", email);
    res.status(200).send("OTP sent successfully");
  });
});

// Verify OTP
app.post("/verify-otp", (req, res) => {
  const { email, otp } = req.body;

  // Check if OTP matches
  if (otpStore[email] && otpStore[email] == otp) {
    delete otpStore[email]; // OTP is valid, remove from store
    return res.status(200).send("OTP verified");
  }

  res.status(400).send("Invalid OTP");
});

// Start the server
app.listen(5000, () => {
  console.log("Server running on port 5000");
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

app.delete('/questions/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await Question.findByIdAndDelete(id);
    if (!result) {
      return res.status(404).send({ error: 'Question not found' });
    }
    res.status(200).send({ message: 'Question deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: 'Server error' });
  }
});

app.delete("/replies/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Find and delete the reply
    const reply = await Reply.findByIdAndDelete(id);
    if (!reply) {
      return res.status(404).json({ message: "Reply not found" });
    }

    // Remove reply reference from the question it belongs to
    await Question.updateOne(
      { replies: id },
      { $pull: { replies: id } }
    );

    res.status(200).json({ message: "Reply deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete reply" });
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
    origin: "https://discuza.in",
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