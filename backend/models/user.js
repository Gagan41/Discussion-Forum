import mongoose from "mongoose";
import bcrypt from "bcryptjs"; 

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    profileImage: {
      type: String,
      default:
        "https://img.freepik.com/premium-vector/business-global-economy_24877-41082.jpg",
    },
    email: {
      type: String,
      required: true,
      unique: true,
      match: [/.+@.+\..+/, "Please enter a valid email address"], 
    },
    password: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  // Check if the password field has been modified
  if (!this.isModified("password")) {
    return next();
  }

  try {
    // Generate salt and hash the password
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    console.log("Password successfully hashed");
    next();
  } catch (error) {
    console.error("Error hashing password:", error);
    next(error); // Pass the error to the next middleware
  }
});

// Method to compare entered password with the hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  try {
    const isMatch = await bcrypt.compare(enteredPassword, this.password);
    console.log(`Password match: ${isMatch}`);
    return isMatch;
  } catch (error) {
    console.error("Error comparing passwords:", error);
    throw new Error("Password comparison failed");
  }
};

const User = mongoose.model("DiscussionUser", userSchema);
export default User;
