import mongoose from "mongoose";

const replySchema = mongoose.Schema(
  {
    reply: {
      type: String,
      required: true,
      trim: true,
      minlength: 1, // Ensure the reply is at least 1 character long
      maxlength: 1000, // Optionally limit the length of a reply
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "DiscussionUser", // Reference to the User model
    },
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt
  }
);

const Reply = mongoose.model("Reply", replySchema);
export default Reply;
