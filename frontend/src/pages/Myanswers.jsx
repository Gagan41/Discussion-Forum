import React from "react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import newRequests from "../utils/newRequest";
import Arrowup from "../icons/Arrowup";
import Arrowdown from "../icons/Arrowdown";
import UserInfo from "../components/UserInfo";
import SyncLoader from "react-spinners/SyncLoader";
import NothingHere from "../components/NothingHere";

const Myanswers = () => {
  const [openId, setOpenId] = React.useState([]);
  const user = JSON.parse(localStorage.getItem("user"));
  const id = user?._id;
  const queryClient = useQueryClient();

  // Fetch questions
  const { isLoading, data, error } = useQuery("getMyQuestions", () =>
    newRequests
      .get(`${process.env.REACT_APP_BACKEND_URL}/my-questions/${id}`)
      .then((res) => res.data)
  );

  // Delete question mutation
  const deleteMutation = useMutation(
    (questionId) =>
      newRequests.delete(
        `${process.env.REACT_APP_BACKEND_URL}/questions/${questionId}`
      ),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("getMyQuestions"); // Refetch data after deletion
      },
    }
  );

  // Handle reply deletion
  const handleDeleteReply = async (questionId, replyId) => {
    try {
      await newRequests.delete(
        `${process.env.REACT_APP_BACKEND_URL}/replies/${replyId}`
      );
      // Invalidate the query to refetch data after deletion
      queryClient.invalidateQueries("getMyQuestions");
    } catch (error) {
      console.error("Failed to delete reply:", error);
    }
  };

  // Handle loading state
  if (isLoading)
    return (
      <div className="h-screen mt-[10%] w-[100%] text-center">
        <SyncLoader size={10} color="#7E22CE" />
      </div>
    );

  // Handle error state
  if (error) {
    console.error("Error fetching questions:", error.message);
    return (
      <div className="h-screen mt-[10%] w-[100%] text-center text-red-500">
        <p>Error loading your questions. Please try again later.</p>
      </div>
    );
  }

  // Safeguard for undefined data
  const questions = Array.isArray(data) ? data : [];

  // Delete question handler
  const handleDelete = (questionId) => {
    if (window.confirm("Are you sure you want to delete this question?")) {
      deleteMutation.mutate(questionId);
    }
  };

  return (
    <div className="h-full w-full md:w-[60%] flex flex-col items-center">
      {questions.length > 0 &&
        questions.map((question, index) => (
          <div
            key={index}
            className="w-full my-8 md:w-[80%] md:mx-12 flex flex-col items-end border 
              p-2 md:p-4 rounded-md bg-purple-100"
          >
            <div className="w-full bg-white p-4 md:p-5 rounded-lg shadow-md flex items-start gap-5">
              <div className="left-section space-y-1 text-center">
                <Arrowup id={question._id} />
                <h3 className="text-sm md:text-base">
                  {question?.upvote?.length || 0}
                </h3>
                <Arrowdown id={question._id} />
              </div>
              <div className="right-section w-full">
                <h1 className="text-base md:text-lg">{question?.question}</h1>
                <p className="text-sm md:text-base">{question?.description}</p>

                {/* Image Display Section */}
                {question.image ? (
                  <div className="mt-4">
                    <img
                      src={`${process.env.REACT_APP_BACKEND_URL}/questions/${question._id}/image`}
                      alt="Question Attachment"
                      className="w-full max-h-60 object-cover rounded-md"
                    />
                  </div>
                ) : null}

                <hr />
                <UserInfo
                  openId={openId}
                  index={index + 1}
                  setOpenId={setOpenId}
                  question={question}
                />

                {/* Delete Button */}
                <button
                  onClick={() => handleDelete(question._id)}
                  className="flex mt-4 bg-purple-500 text-white px-4 py-2 rounded-md hover:bg-purple-600"
                >
                  Delete Question
                </button>
              </div>
            </div>

            {/* Nested Comment Section */}
            {openId.find((ele) => ele === index + 1) && (
              <>
                {question?.replies?.map((answer, replyIndex) => (
                  <div key={answer._id} className="flex items-center gap-4">
                    <img
                      className="h-4 md:h-6 w-4 md:w-6"
                      src="https://cdn.icon-icons.com/icons2/2596/PNG/512/nested_arrows_icon_155086.png"
                      alt="Nested Arrow"
                    />
                    <div className="bg-white max-w-xl p-5 rounded-lg shadow-md flex flex-col items-start gap-5 mt-2">
                      <p>{answer?.reply}</p>
                      <UserInfo answer={answer} />
                      {/* Delete Reply Button */}
                      <button
                        onClick={() =>
                          handleDeleteReply(question._id, answer._id)
                        }
                        className="text-sm flex bg-purple-500 text-white px-4 py-2 rounded-md hover:bg-purple-600"
                      >
                        Delete Reply
                      </button>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        ))}
      {questions.length === 0 && <NothingHere />}
    </div>
  );
};

export default Myanswers;
