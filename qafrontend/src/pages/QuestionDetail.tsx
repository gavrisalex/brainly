import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Question } from "@/types/question";
import { Response, Comment } from "@/types/response";
import { VoteType, VoteRequest } from "../types/vote";

export function QuestionDetail() {
  const { id } = useParams();
  const [question, setQuestion] = useState<Question | null>(null);
  const [responses, setResponses] = useState<Response[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newResponse, setNewResponse] = useState("");
  const [newComments, setNewComments] = useState<{ [key: number]: string }>({});
  const [responseError, setResponseError] = useState<string | null>(null);
  const [commentError, setCommentError] = useState<string | null>(null);
  const [showResponseForm, setShowResponseForm] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const fetchCommentsForResponse = async (responseId: number) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:8080/comment/response/${responseId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      return response.data.success ? response.data.data : [];
    } catch (error) {
      console.error(
        `Error fetching comments for response ${responseId}:`,
        error
      );
      return [];
    }
  };

  const fetchResponses = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://localhost:8080/response/getAll",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      if (response.data.success) {
        const allResponses = response.data.data.content;
        return allResponses.filter(
          (response: Response) => response.question.question_id === Number(id)
        );
      }
      return [];
    } catch (error) {
      console.error("Error fetching responses:", error);
      return [];
    }
  };

  const sortResponses = (responses: Response[]) => {
    return [...responses].sort((a, b) => {
      if (a.solution === "YES") return -1;
      if (b.solution === "YES") return 1;

      return new Date(b.postedOn).getTime() - new Date(a.postedOn).getTime();
    });
  };

  const handleSolutionApproval = async (responseId: number) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found");
        return;
      }

      const response = await axios.put(
        `http://localhost:8080/response/${responseId}/solution`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      if (response.data.success) {
        const updatedResponses = await fetchResponses();
        setResponses(sortResponses(updatedResponses));
      } else {
        console.error("Failed to mark solution:", response.data.error);
      }
    } catch (error) {
      console.error("Error marking solution:", error);
    }
  };

  const handleVote = async (responseId: number, voteType: VoteType) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found");
        return;
      }

      const voteRequest: VoteRequest = {
        response: {
          response_id: responseId,
        },
        typeOfVote: voteType,
      };

      const response = await axios.post(
        "http://localhost:8080/vote/add",
        voteRequest,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      if (response.data.success) {
        // Refresh responses to update vote count
        const updatedResponses = await fetchResponses();
        setResponses(sortResponses(updatedResponses));
      }
    } catch (error) {
      console.error("Error voting:", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.log("No token found");
          return;
        }

        // First fetch the question details
        const questionResponse = await axios.get(
          `http://localhost:8080/question/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            withCredentials: true,
          }
        );

        if (questionResponse.data.success) {
          setQuestion(questionResponse.data.data);
        } else {
          setError("Question not found");
          return;
        }

        // Fetch current user
        const userResponse = await axios.get(
          "http://localhost:8080/user/current",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            withCredentials: true,
          }
        );

        if (userResponse.data.success) {
          setCurrentUserId(userResponse.data.data.id);
        }

        // Then fetch responses
        const responsesResponse = await axios.get(
          "http://localhost:8080/response/getAll",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            withCredentials: true,
          }
        );

        if (responsesResponse.data.success) {
          const allResponses = responsesResponse.data.data.content;
          const questionResponses = allResponses.filter(
            (response: Response) => response.question.question_id === Number(id)
          );
          setResponses(sortResponses(questionResponses));
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load question details");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleAddResponse = async (e: React.FormEvent) => {
    e.preventDefault();
    setResponseError(null);

    if (!newResponse.trim()) {
      setResponseError("Response cannot be empty");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:8080/response/add",
        {
          content: newResponse,
          question: {
            question_id: id,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      if (response.data.success) {
        // Fetch updated responses
        const updatedResponses = await fetchResponses();
        setResponses(updatedResponses);
        setNewResponse(""); // Clear the input
      } else {
        setResponseError(response.data.error || "Failed to add response");
      }
    } catch (error) {
      console.error("Error adding response:", error);
      if (axios.isAxiosError(error)) {
        setResponseError(
          error.response?.data?.error || "Failed to add response"
        );
      } else {
        setResponseError("Failed to add response");
      }
    }
  };

  const handleAddComment = async (responseId: number) => {
    setCommentError(null);
    const commentContent = newComments[responseId];

    if (!commentContent?.trim()) {
      setCommentError("Comment cannot be empty");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:8080/comment/add",
        {
          content: commentContent,
          response: {
            response_id: responseId,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      if (response.data.success) {
        // Refresh comments for this response
        const newComments = await fetchCommentsForResponse(responseId);
        setComments((prev) => [
          ...prev.filter((c) => c.response.response_id !== responseId),
          ...newComments,
        ]);
        // Clear the input
        setNewComments((prev) => ({ ...prev, [responseId]: "" }));
      } else {
        setCommentError(response.data.error || "Failed to add comment");
      }
    } catch (error) {
      console.error("Error adding comment:", error);
      setCommentError("Failed to add comment");
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      {loading ? (
        <div className="text-center">Loading...</div>
      ) : error ? (
        <div className="text-center text-red-500">{error}</div>
      ) : question ? (
        <>
          {/* Question section */}
          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <div className="flex justify-between items-start mb-4">
              <h1 className="text-2xl font-bold">{question.content}</h1>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                {question.topic.name}
              </span>
            </div>
            <div className="text-gray-600 text-sm">
              Posted by {question.user.name} on {formatDate(question.postedOn)}
            </div>
          </div>

          {/* Add Response section */}
          <div className="mb-6">
            <button
              onClick={() => setShowResponseForm(!showResponseForm)}
              className="text-blue-500 hover:text-blue-700 font-semibold flex items-center gap-2"
            >
              {showResponseForm ? (
                <>
                  <span>Cancel Response</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </>
              ) : (
                <>
                  <span>Add Response</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </>
              )}
            </button>

            {/* Response Form with animation */}
            <div
              className={`transition-all duration-300 ease-in-out overflow-hidden ${
                showResponseForm
                  ? "max-h-96 opacity-100 mt-4"
                  : "max-h-0 opacity-0"
              }`}
            >
              <form
                onSubmit={handleAddResponse}
                className="space-y-4 bg-gray-50 p-4 rounded-lg"
              >
                <textarea
                  value={newResponse}
                  onChange={(e) => setNewResponse(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  placeholder="Write your response here..."
                />
                {responseError && (
                  <div className="text-red-500 text-sm">{responseError}</div>
                )}
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Submit Response
                </button>
              </form>
            </div>
          </div>

          {/* Responses section */}
          <h2 className="text-xl font-bold mb-4">Responses</h2>
          {responses.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No responses yet. Be the first to respond!
            </div>
          ) : (
            <div className="space-y-6">
              {responses.map((response) => (
                <div
                  key={response.response_id}
                  className={`bg-white p-6 rounded-lg shadow-md ${
                    response.solution === "YES"
                      ? "border-2 border-green-500"
                      : ""
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-grow">
                      <div className="text-lg">{response.content}</div>
                      <div className="text-gray-600 text-sm mt-2 flex items-center gap-2">
                        Answered by {response.user.name}
                        <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs">
                          Credibility: {response.user.credibility}
                        </span>
                        <span className="text-gray-400">•</span>
                        {formatDate(response.postedOn)}
                      </div>
                    </div>

                    {/* Solution approval checkbox - only visible to question author */}
                    {currentUserId &&
                      question &&
                      currentUserId === question.user.id && (
                        <div className="flex items-center space-x-2 ml-4">
                          <input
                            type="checkbox"
                            checked={response.solution === "YES"}
                            onChange={() =>
                              handleSolutionApproval(response.response_id)
                            }
                            className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                            id={`solution-${response.response_id}`}
                          />
                          <label
                            htmlFor={`solution-${response.response_id}`}
                            className="text-sm text-gray-600"
                          >
                            Mark as Solution
                          </label>
                        </div>
                      )}
                  </div>

                  {response.solution === "YES" && (
                    <div className="mt-2 mb-4">
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">
                        Approved Solution ✓
                      </span>
                    </div>
                  )}

                  {/* Voting section */}
                  <div className="flex items-center space-x-2 mt-4">
                    <button
                      onClick={() => handleVote(response.response_id, "LIKE")}
                      className={`flex items-center space-x-1 transition-colors ${
                        response.userVote === "LIKE"
                          ? "text-green-600"
                          : "text-gray-400 hover:text-green-600"
                      }`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        opacity={response.userVote === "LIKE" ? "1" : "0.7"}
                      >
                        <path
                          fillRule="evenodd"
                          d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>

                    <span className="text-xs font-medium text-gray-500">
                      {response.nrOfVotes}
                    </span>

                    <button
                      onClick={() =>
                        handleVote(response.response_id, "DISLIKE")
                      }
                      className={`flex items-center space-x-1 transition-colors ${
                        response.userVote === "DISLIKE"
                          ? "text-red-600"
                          : "text-gray-400 hover:text-red-600"
                      }`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        opacity={response.userVote === "DISLIKE" ? "1" : "0.7"}
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>

                  {/* Comments for this response */}
                  <div className="mt-4 pl-6 border-l-2 border-gray-200">
                    <h3 className="text-sm font-bold mb-2">Comments</h3>
                    {comments
                      .filter(
                        (comment) =>
                          comment.response.response_id === response.response_id
                      )
                      .map((comment) => (
                        <div
                          key={comment.comment_id}
                          className="bg-gray-50 p-3 rounded mb-2"
                        >
                          <div className="text-sm">{comment.content}</div>
                          <div className="text-gray-500 text-xs mt-1">
                            {comment.user.name} • {formatDate(comment.postedOn)}
                          </div>
                        </div>
                      ))}

                    {/* Add Comment Form */}
                    <div className="mt-3">
                      <textarea
                        value={newComments[response.response_id] || ""}
                        onChange={(e) =>
                          setNewComments((prev) => ({
                            ...prev,
                            [response.response_id]: e.target.value,
                          }))
                        }
                        className="w-full p-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={2}
                        placeholder="Add a comment..."
                      />
                      {commentError && (
                        <div className="text-red-500 text-sm">
                          {commentError}
                        </div>
                      )}
                      <button
                        onClick={() => handleAddComment(response.response_id)}
                        className="mt-2 bg-gray-100 text-gray-700 px-3 py-1 rounded hover:bg-gray-200 transition-colors text-sm"
                      >
                        Add Comment
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="text-center text-red-500">Question not found</div>
      )}
    </div>
  );
}
