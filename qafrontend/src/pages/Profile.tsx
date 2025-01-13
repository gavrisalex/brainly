import { useState, useEffect } from "react";
import axios from "axios";
import { Question } from "@/types/question";
import { useNavigate } from "react-router-dom";

interface UserProfile {
  id: number;
  name: string;
  email: string;
  credibility: number;
  role: string;
}

interface ProfileQuestion extends Question {
  visibility: "VISIBLE" | "HIDDEN";
  responses?: Array<{
    solution: "YES" | "NO";
  }>;
}

interface User {
  id: number;
  name: string;
  role: string;
  credibility: number;
}

interface Topic {
  topic_id: number;
  name: string;
}

export function Profile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [questions, setQuestions] = useState<ProfileQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<number>(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);
  const [isUserManagementOpen, setIsUserManagementOpen] = useState(true);
  const [isQuestionsOpen, setIsQuestionsOpen] = useState(true);
  const [pendingQuestions, setPendingQuestions] = useState<ProfileQuestion[]>(
    []
  );
  const [isPendingQuestionsOpen, setIsPendingQuestionsOpen] = useState(true);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        // Fetch user profile
        const profileResponse = await axios.get(
          "http://localhost:8080/user/current",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            withCredentials: true,
          }
        );

        if (profileResponse.data.success) {
          setProfile(profileResponse.data.data);
        }

        // Fetch user's questions
        const questionsResponse = await axios.get(
          "http://localhost:8080/question/user",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            withCredentials: true,
          }
        );

        if (questionsResponse.data.success) {
          const typedQuestions: ProfileQuestion[] =
            questionsResponse.data.data.content.map((q: any) => ({
              question_id: q.question_id,
              user: q.user,
              topic: q.topic,
              content: q.content,
              postedOn: q.postedOn,
              status: q.status,
              approvedSolution: q.approvedSolution,
              responses: q.responses,
              visibility: q.visibility as "VISIBLE" | "HIDDEN",
            }));
          setQuestions(typedQuestions);
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
        setError("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [navigate]);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token || profile?.role !== "ADMIN") return;

        // Fetch all users
        const usersResponse = await axios.get(
          "http://localhost:8080/user/getAll",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            withCredentials: true,
          }
        );

        // The response is directly an array of users
        if (Array.isArray(usersResponse.data)) {
          setUsers(usersResponse.data);
        }

        // Fetch topics
        const topicsResponse = await axios.get(
          "http://localhost:8080/topic/getAll",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            withCredentials: true,
          }
        );

        // The response is directly an array of topics
        if (Array.isArray(topicsResponse.data)) {
          setTopics(topicsResponse.data);
        }
      } catch (error) {
        console.error("Error fetching admin data:", error);
      }
    };

    fetchAdminData();
  }, [profile?.role]);

  useEffect(() => {
    const fetchPendingQuestions = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token || profile?.role !== "MOD") return;

        const response = await axios.get(
          "http://localhost:8080/question/pending",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            withCredentials: true,
          }
        );

        if (response.data.success) {
          setPendingQuestions(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching pending questions:", error);
      }
    };

    fetchPendingQuestions();
  }, [profile?.role]);

  const handleVisibilityToggle = async (questionId: number) => {
    try {
      const token = localStorage.getItem("token");

      // Toggle visibility
      const toggleResponse = await axios.put(
        `http://localhost:8080/question/${questionId}/visibility`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      if (toggleResponse.data.success) {
        // Fetch updated question data
        const questionsResponse = await axios.get(
          "http://localhost:8080/question/user",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            withCredentials: true,
          }
        );

        if (questionsResponse.data.success) {
          const typedQuestions: ProfileQuestion[] =
            questionsResponse.data.data.content.map((q: any) => ({
              question_id: q.question_id,
              user: q.user,
              topic: q.topic,
              content: q.content,
              postedOn: q.postedOn,
              status: q.status,
              approvedSolution: q.approvedSolution,
              responses: q.responses,
              visibility: q.visibility as "VISIBLE" | "HIDDEN",
            }));
          setQuestions(typedQuestions);
        }
      }
    } catch (error) {
      console.error("Error updating question visibility:", error);
    }
  };

  const getQuestionStatus = (question: ProfileQuestion) => {
    if (
      question.responses &&
      question.responses.some((r) => r.solution === "YES")
    ) {
      return "Solved";
    }
    if (question.responses && question.responses.length > 0) {
      return "Answered";
    }
    return "Pending";
  };

  const handleRoleChange = async (userId: number, currentRole: string) => {
    try {
      const token = localStorage.getItem("token");
      const newRole = currentRole === "MOD" ? "USER" : "MOD";

      const response = await axios.post(
        `http://localhost:8080/user/assignRole?userId=${userId}&role=${newRole}`,
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
        // Update users list
        setUsers(
          users.map((user) =>
            user.id === userId ? { ...user, role: newRole } : user
          )
        );

        // If changing to MOD, fetch topics and open modal
        if (newRole === "MOD") {
          try {
            console.log("Fetching topics...");
            const topicsResponse = await axios.get(
              "http://localhost:8080/topic/getAll",
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
                withCredentials: true,
              }
            );

            // Check for success and access the data property
            if (topicsResponse.data.success) {
              setTopics(topicsResponse.data.data);
            }

            setSelectedUser(users.find((u) => u.id === userId) || null);
            setSelectedTopic(0);
            setIsModalOpen(true);
          } catch (error) {
            console.error("Error fetching topics:", error);
          }
        }
      }
    } catch (error) {
      console.error("Error changing user role:", error);
    }
  };

  const handleTopicAssignment = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!selectedUser || !selectedTopic) {
        setIsModalOpen(false);
        return;
      }

      const response = await axios.post(
        "http://localhost:8080/modTopics/add",
        {
          user: { id: selectedUser.id },
          topic: { topic_id: selectedTopic },
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
        setIsModalOpen(false);
        setSelectedUser(null);
        setSelectedTopic(0);
        setModalError(null);
      } else {
        // Extract the actual error message from the response
        const errorMessage =
          response.data.message ||
          response.data.error ||
          "An unknown error occurred";
        setModalError(errorMessage);
      }
    } catch (error: any) {
      // Show the detailed error message from the response if available
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to assign topic. Please try again.";
      setModalError(errorMessage);
    }
  };

  const handleModalClose = async () => {
    // If there's a selected user, revert their role back to USER
    if (selectedUser) {
      try {
        const token = localStorage.getItem("token");
        await axios.post(
          `http://localhost:8080/user/assignRole?userId=${selectedUser.id}&role=USER`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            withCredentials: true,
          }
        );

        // Update users list to reflect the role change
        setUsers(
          users.map((user) =>
            user.id === selectedUser.id ? { ...user, role: "USER" } : user
          )
        );
      } catch (error) {
        console.error("Error reverting user role:", error);
      }
    }

    // Clear modal state
    setIsModalOpen(false);
    setSelectedUser(null);
    setSelectedTopic(0);
    setModalError(null);
  };

  const handleQuestionStatus = async (
    questionId: number,
    status: "ACCEPTED" | "DENIED"
  ) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `http://localhost:8080/question/${questionId}/status?status=${status}`,
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
        // Remove the question from the pending list
        setPendingQuestions(
          pendingQuestions.filter((q) => q.question_id !== questionId)
        );
      }
    } catch (error) {
      console.error("Error updating question status:", error);
    }
  };

  if (loading) return <div className="text-center mt-20">Loading...</div>;
  if (error)
    return <div className="text-center mt-20 text-red-500">{error}</div>;

  return (
    <div className="container mx-auto py-8 px-4">
      {profile && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-2xl font-bold mb-4">Profile</h1>
          <div className="space-y-3">
            <p>
              <span className="font-semibold">Name:</span> {profile.name}
            </p>
            <p>
              <span className="font-semibold">Email:</span> {profile.email}
            </p>
            <p>
              <span className="font-semibold">Role:</span> {profile.role}
            </p>
            <p>
              <span className="font-semibold">Credibility:</span>{" "}
              {profile.credibility}
            </p>
          </div>
        </div>
      )}

      {profile?.role === "ADMIN" && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <button
            onClick={() => setIsUserManagementOpen(!isUserManagementOpen)}
            className="w-full flex justify-between items-center text-xl font-bold mb-4 text-black bg-white p-2 rounded-lg"
          >
            <span>User Management ({users.length} users)</span>
            <svg
              className={`w-6 h-6 transform transition-transform ${
                isUserManagementOpen ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="white"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {isUserManagementOpen && (
            <div className="space-y-4">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 border rounded-lg bg-white hover:bg-gray-50"
                >
                  <div>
                    <p className="font-medium text-gray-900">{user.name}</p>
                    <p className="text-sm text-gray-500">Email: {user.email}</p>
                    <p className="text-sm text-gray-500">Role: {user.role}</p>
                    <p className="text-sm text-gray-500">
                      Credibility: {user.credibility}
                    </p>
                  </div>
                  {user.role !== "ADMIN" && (
                    <button
                      onClick={() => handleRoleChange(user.id, user.role)}
                      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      {user.role === "MOD" ? "Make User" : "Make Moderator"}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {profile?.role === "MOD" && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <button
            onClick={() => setIsPendingQuestionsOpen(!isPendingQuestionsOpen)}
            className="w-full flex justify-between items-center text-xl font-bold mb-4 text-black bg-white p-2 rounded-lg"
          >
            <span>Pending Questions ({pendingQuestions.length})</span>
            <svg
              className={`w-6 h-6 transform transition-transform ${
                isPendingQuestionsOpen ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {isPendingQuestionsOpen && (
            <div className="space-y-4">
              {pendingQuestions.length === 0 ? (
                <p className="text-gray-500">No pending questions.</p>
              ) : (
                pendingQuestions.map((question) => (
                  <div
                    key={question.question_id}
                    className="p-4 border rounded-lg bg-white hover:bg-gray-50"
                  >
                    <div className="mb-2">
                      <h3 className="font-medium">{question.content}</h3>
                      <p className="text-sm text-gray-500">
                        Posted by: {question.user.name} on{" "}
                        {new Date(question.postedOn).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-500">
                        Topic: {question.topic.name}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          handleQuestionStatus(question.question_id, "ACCEPTED")
                        }
                        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() =>
                          handleQuestionStatus(question.question_id, "DENIED")
                        }
                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        Deny
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6">
        <button
          onClick={() => setIsQuestionsOpen(!isQuestionsOpen)}
          className="w-full flex justify-between items-center text-xl font-bold mb-4 text-black bg-white p-2 rounded-lg"
        >
          <span>My Questions</span>
          <svg
            className={`w-6 h-6 transform transition-transform ${
              isQuestionsOpen ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="white"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {isQuestionsOpen && (
          <>
            {questions.length === 0 ? (
              <p className="text-gray-500">
                You haven't posted any questions yet.
              </p>
            ) : (
              <div className="space-y-4">
                {questions.map((question) => (
                  <div
                    key={question.question_id}
                    className="p-4 border rounded-lg bg-white hover:bg-gray-50"
                  >
                    <div className="flex justify-between items-start">
                      <div
                        className="flex-grow cursor-pointer text-gray-900"
                        onClick={() =>
                          navigate(`/question/${question.question_id}`)
                        }
                      >
                        <h3 className="font-medium text-gray-900">
                          {question.content}
                        </h3>
                        <p className="text-sm text-gray-500 mt-2">
                          Posted on{" "}
                          {new Date(question.postedOn).toLocaleDateString()}
                        </p>
                        <div className="flex gap-2 mt-2">
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              getQuestionStatus(question) === "Solved"
                                ? "bg-green-100 text-green-800"
                                : getQuestionStatus(question) === "Answered"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {question.status}
                          </span>
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              question.visibility === "VISIBLE"
                                ? "bg-gray-100 text-gray-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {question.visibility}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center ml-4">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={question.visibility === "VISIBLE"}
                            onChange={() =>
                              handleVisibilityToggle(question.question_id)
                            }
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="text-lg font-bold mb-4">
              Assign Topic to Moderator {selectedUser?.name}
            </h3>
            {modalError && (
              <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
                {modalError}
              </div>
            )}
            <select
              className="w-full p-2 border rounded mb-4"
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(Number(e.target.value))}
            >
              <option value={0}>Select a topic</option>
              {topics.map((topic) => (
                <option key={topic.topic_id} value={topic.topic_id}>
                  {topic.name}
                </option>
              ))}
            </select>
            <div className="flex justify-end gap-2">
              <button
                onClick={handleModalClose}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleTopicAssignment}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                disabled={!selectedTopic}
              >
                Assign Topic
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
