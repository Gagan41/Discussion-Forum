import React from "react";
import Share from "../icons/Share";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { duration } from "moment";

const Askquestion = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const naviate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { title, description, tags } = e.target;
    const question = {
      question: title.value,
      description: description.value,
      tags: tags.value.split(","),
      userId: user._id,
    };

    const response = await callHuggingFaceModel();
    console.log("response", response);
   

    const res = await axios.post(
      `${process.env.REACT_APP_BACKEND_URL}/ask-question`,
      question
    );
    if (res.status === 201) {
      toast.success("Question added successfully", (duration = 2000));
      setTimeout(() => {
        naviate("/");
      }, 2000);
    }
  };

  async function callHuggingFaceModel() {
    const modelUrl = "https://api-inference.huggingface.co/models/shahrukhx01/bert-mini-finetune-question-detection";
    
    const fetchModelResponse = async () => {
      try {
        const response = await fetch(modelUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer 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`  // Replace with your actual Hugging Face API key
          },
          body: JSON.stringify({ inputs: "Sample input for the model" })
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
        throw error;  // Throw error to retry logic
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
          await new Promise(resolve => setTimeout(resolve, 5000)); // wait 5 seconds before retrying
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
      <div
        className="md:mx-12 flex flex-col items-center 
      gap-4 mb-12 border p-4 pb-6 rounded-md bg-purple-300 
      dark:bg-[#1E212A]  mt-12"
      >
        <h1
          className="text-2xl font-bold text-center
        text-purple-600 
        "
        >
          Ask a Question
        </h1>

        <form onSubmit={handleSubmit} className="form w-full ">
          <div className="title">
            <label className="text-gray-800 text-start dark:text-white">
              Question Title
            </label>
            <input
              name="title"
              className="mt-2 w-full h-10 px-3 rounded outline-none border-none
                shadow-sm"
              type="text"
            />
          </div>
          <div className="desc mt-3">
            <label className="text-gray-800 text-start dark:text-white">
              Question Description
            </label>
            <textarea
              name="description"
              className="mt-2 w-full h-24 px-3 py-2 rounded outline-none border-none  shadow-sm"
              type="text"
            />
          </div>
          <div className="tages mt-3">
            <label className="text-gray-800 text-start dark:text-white">
              Related Tags
            </label>
            <input
              name="tags"
              placeholder="Enter tags seperated by comma"
              className="mt-2 w-full h-10 px-3 rounded outline-none border-none  shadow-sm"
              type="text"
            />
          </div>
          <button
            type="submit"
            className="mt-8 w-[230px] mx-auto flex items-center gap-2 bg-purple-700 rounded-md shadow-sm px-8 py-2 cursor-pointer"
          >
            <Share />
            <span className="text-white">Ask on Community</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default Askquestion;
