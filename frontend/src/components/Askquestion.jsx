import React, { useState } from "react";
import { BsCamera } from "react-icons/bs";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";

const AskQuestion = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  // Get user from localStorage
  const navigate = useNavigate();
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { title, description, tags } = e.target;

    // Prepare the question data
    const question = {
      question: title.value,
      description: description.value,
      tags: tags.value
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag !== ""),
      userId: user?._id,
      userName: user?.name, // Include the user's name
    };

    // Show "Please wait" toast
    const uploadToastId = toast.loading(
      "Please wait, the Question is uploading..."
    );
    // Call Hugging Face API for spam detection
    try {
      const spamDetectionResponse = await callHuggingFaceModel(
        question.question
      );
      if (spamDetectionResponse?.[0]?.label === "LABEL_1") {
        toast.dismiss(uploadToastId);
        toast.error(
          "Your question is flagged as spam. Please modify and try again."
        );
        return;
      }
    } catch (error) {
      toast.dismiss(uploadToastId);
      console.error("Error calling Hugging Face API:", error);
      toast.error("Failed to verify question. Please try again.");
      return;
    }

    // Prepare form data for the request
    const formData = new FormData();
    formData.append("question", question.question);
    formData.append("description", question.description);
    formData.append("tags", JSON.stringify(question.tags));
    formData.append("userId", question.userId);
    formData.append("userName", question.userName);
    if (image) formData.append("image", image);

    // Send the request
    try {
      const res = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/ask-question`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      toast.dismiss(uploadToastId);

      if (res.status === 201) {
        toast.success("Question added successfully", { duration: 2000 });
        setImage(null);
        setPreview(null);
        setTimeout(() => {
          navigate("/");
        }, 2000);
      }
    } catch (error) {
      toast.dismiss(uploadToastId);
      console.error("Error submitting question:", error.response || error);
      toast.error(
        error.response?.data?.error ||
          "Failed to add question. Please try again."
      );
    }
  };

  // Hugging Face API integration
  async function callHuggingFaceModel(inputText) {
    const modelUrl =
      "https://api-inference.huggingface.co/models/shahrukhx01/bert-mini-finetune-question-detection";

    const fetchModelResponse = async () => {
      try {
        const response = await fetch(modelUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: ``, // Replace with your actual Hugging Face API key
          },
          body: JSON.stringify({ inputs: inputText }),
        });

        if (!response.ok) {
          if (response.status === 503) {
            throw new Error("Model is loading, retrying...");
          } else {
            throw new Error("Failed to call the model.");
          }
        }

        return await response.json();
      } catch (error) {
        console.error("Error calling Hugging Face model:", error);
        throw error; // Throw error to trigger retry logic
      }
    };

    let attempts = 0;
    const maxRetries = 5;
    let success = false;
    let result;

    while (attempts < maxRetries && !success) {
      try {
        result = await fetchModelResponse();
        success = true; // If no error is thrown, the call was successful
      } catch (error) {
        attempts++;
        if (attempts < maxRetries) {
          console.log(`Retrying... (${attempts}/${maxRetries})`);
          await new Promise((resolve) => setTimeout(resolve, 5000)); // wait 5 seconds before retrying
        } else {
          console.log("Failed after multiple retries");
        }
      }
    }

    return result;
  }

  return (
    <div className="h-full md:w-[50%]">
      <Toaster />
      <div className="flex flex-col items-center gap-4 border p-4 pb-6 rounded-md bg-purple-300 dark:bg-[#1E212A] mt-12">
        <h1 className="text-2xl font-bold text-center text-purple-600">
          Ask a Question
        </h1>

        <form
          onSubmit={handleSubmit}
          className="form w-full"
          encType="multipart/form-data"
        >
          <div className="title">
            <label htmlFor="title" className="text-gray-800 dark:text-white">
              Question Title
            </label>
            <input
              id="title"
              name="title"
              className="mt-2 w-full h-10 px-3 rounded outline-none shadow-sm"
              type="text"
              required
            />
          </div>

          <div className="desc mt-3">
            <label
              htmlFor="description"
              className="text-gray-800 dark:text-white"
            >
              Question Description
            </label>
            <textarea
              id="description"
              name="description"
              className="mt-2 w-full h-24 px-3 py-2 rounded outline-none shadow-sm"
              required
            />
          </div>

          <div className="tags mt-3">
            <label htmlFor="tags" className="text-gray-800 dark:text-white">
              Related Tags
            </label>
            <input
              id="tags"
              name="tags"
              placeholder="Enter tags separated by commas"
              className="mt-2 w-full h-10 px-3 rounded outline-none shadow-sm"
              type="text"
              required
            />
          </div>

          <div className="image-upload mt-3">
            <label
              htmlFor="photo-input"
              className="text-gray-800 dark:text-white"
            >
              Upload a Photo (Optional)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="file"
                id="photo-input"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <label
                htmlFor="photo-input"
                className="cursor-pointer text-2xl text-purple-700"
              >
                <BsCamera />
              </label>
              {image && (
                <span className="text-gray-700 dark:text-white">
                  {image.name}
                </span>
              )}
            </div>
            {preview && (
              <div className="mt-4">
                <img
                  src={preview}
                  alt="Uploaded Preview"
                  className="w-40 h-40 object-cover rounded border"
                />
              </div>
            )}
          </div>

          <button
            type="submit"
            className="mt-8 bg-purple-700 text-white px-8 py-2 rounded-md shadow-sm"
          >
            Ask on Community
          </button>
        </form>
      </div>
    </div>
  );
};

export default AskQuestion;
