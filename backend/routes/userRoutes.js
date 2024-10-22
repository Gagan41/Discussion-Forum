import express from "express";
import User from "../models/user.js"; // Assuming the User model is in the models folder
const router = express.Router();

// Route to get all users
router.get("/allusers", async (req, res) => {
  try {
    const users = await User.find({}, "name profileImage"); // Fetch name and profileImage fields only
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error, could not retrieve users." });
  }
});

export default router;
