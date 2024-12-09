import React from "react";
import Comment from "../icons/Comment";
import moment from "moment";

const UserInfo = ({ openId, index, setOpenId, question, answer }) => {
  const currentUser = JSON.parse(localStorage.getItem("user"));

  return (
    <div className="w-full flex items-center justify-between">
      <div className="w-[48%] md:max-w-screen-md posted-by flex items-center gap-2 md:gap-3">
        <img
          src={
            question?.userId?.profileImage ||
            answer?.author?.profileImage || // For replies, adjust as needed
            "https://avatars.githubusercontent.com/u/56132780?v=4"
          }
          alt="profile"
          className="h-5 md:w-6 w-5 md:h-6 rounded-full"
        />
        <h2 className="text-black dark:text-white text-xs">
          {answer ? "answered by\n" : "posted by "}{" "}
          <span className="text-purple-800 font-bold md:text-sm">
            {question
              ? question?.userId?.name === currentUser?.name
                ? question?.userId?.name + " (You)"
                : question?.userId?.name
              : answer
              ? answer?.author?.name === currentUser?.name
                ? answer?.author?.name + " (You)"
                : answer?.author?.name
              : ""}
          </span>
        </h2>
      </div>
      <div className="posted-on mx-auto">
        <h2 className="text-black dark:text-white text-xs">
          {question
            ? moment(question?.createdAt).fromNow()
            : moment(answer?.createdAt).fromNow()}
        </h2>
      </div>
      {openId && (
        <div
          className="comment flex gap-2 ml-auto cursor-pointer"
          onClick={() => {
            if (!openId.find((ele) => ele === index)) {
              console.log("Opening comment section");
              setOpenId([...openId, index]);
            } else {
              console.log("Closing comment section");
              setOpenId(openId.filter((ele) => ele !== index));
            }
          }}
        >
          <Comment />
          <span className="text-black dark:text-white text-xs">
            {question?.replies?.length || "No replies"}
          </span>
        </div>
      )}
    </div>
  );
};

export default UserInfo;
