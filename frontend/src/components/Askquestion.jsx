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
  
    const formData = new FormData();
    formData.append("question", title.value);
    formData.append("description", description.value);
    formData.append(
      "tags",
      JSON.stringify(
        tags.value
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag !== "")
      )
    );
    formData.append("userId", user?._id);
    if (image) formData.append("image", image);
  
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
  
      if (res.status === 201) {
        toast.success("Question added successfully", { duration: 2000 });
        setImage(null);
        setPreview(null);
        setTimeout(() => {
          navigate("/");
        }, 2000);
      }
    } catch (error) {
      console.error("Error submitting question:", error.response || error);
      toast.error(
        error.response?.data?.error || "Failed to add question. Please try again."
      );
    }
  };

  return (
    <div className="h-full md:w-[50%]">
      <Toaster />
      <div className="flex flex-col items-center gap-4 border p-4 pb-6 rounded-md bg-purple-300 dark:bg-[#1E212A] mt-12">
        <h1 className="text-2xl font-bold text-center text-purple-600">
          Ask a Question
        </h1>

        <form onSubmit={handleSubmit} className="form w-full" encType="multipart/form-data">
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
            <label htmlFor="description" className="text-gray-800 dark:text-white">
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
            <label htmlFor="photo-input" className="text-gray-800 dark:text-white">
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
              <label htmlFor="photo-input" className="cursor-pointer text-2xl text-purple-700">
                <BsCamera />
              </label>
              {image && <span className="text-gray-700 dark:text-white">{image.name}</span>}
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