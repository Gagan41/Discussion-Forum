import mongoose from "mongoose";

const questionSchema = mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
      trim: true,
      minlength: 10, // Optional: Minimum length for a question
      maxlength: 500, // Optional: Maximum length for a question
    },
    description: {
      type: String,
      trim: true,
      maxlength: 2000, // Optional: Maximum length for a description
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "DiscussionUser", // Reference to the user who asked the question
    },
    replies: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Reply", // Reference to the replies related to this question
      default: [],
    },
    tags: {
      type: [String],
      default: [],
      validate: {
        validator: function (tags) {
          return tags.length <= 10; // Optional: Limit to 10 tags
        },
        message: "A question can have a maximum of 10 tags",
      },
    },
    upvote: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "DiscussionUser", // Reference to users who upvoted
      default: [],
    },
    downvote: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "DiscussionUser", // Reference to users who downvoted
      default: [],
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// Optionally, you can add an index to improve performance on tags search
questionSchema.index({ tags: 1 });

const Question = mongoose.model("Question", questionSchema);
export default Question;
