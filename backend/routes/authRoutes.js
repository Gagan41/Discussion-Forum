import express from 'express';
import User from '../models/user.js'; 
import bcrypt from 'bcryptjs';

const router = express.Router();

// User signup route
router.post('/signup', async (req, res) => {
  const { name, password, email, profileImage } = req.body;
  try {
    // Check if user already exists
    const findUser = await User.findOne({ email });
    if (findUser) {
      return res.status(400).json({ message: "Email already in use" });
    }
    
    // Create new user (password is hashed automatically in the User model)
    const newUser = await User.create({ name, password, email, profileImage });
    return res.status(201).json({ message: "User created successfully", user: newUser });
  } catch (error) {
    // Handle errors, such as validation or database errors
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// User login route
router.post('/login', async (req, res) => {
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

export default router;
