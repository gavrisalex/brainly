import { useState, useEffect } from "react";
import { Navbar } from "../components/Navbar";
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
        setIsModalOpen(false); // Close modal if no valid selection
        return;
      }

      console.log(
        "Assigning topic:",
        selectedTopic,
        "to user:",
        selectedUser.id
      );

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

      // Close modal regardless of response
      setIsModalOpen(false);
      setSelectedUser(null);
      setSelectedTopic(0);
    } catch (error) {
      console.error("Error assigning topic:", error);
      // Close modal even if there's an error
      setIsModalOpen(false);
      setSelectedUser(null);
      setSelectedTopic(0);
    }
  };

  if (loading) return <div className="text-center mt-20">Loading...</div>;
  if (error)
    return <div className="text-center mt-20 text-red-500">{error}</div>;

  return (
    <>
      <Navbar />
      <div className="container mx-auto py-8 px-4 mt-16">
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
            <h2 className="text-xl font-bold mb-4">
              User Management ({users.length} users)
            </h2>
            <div className="space-y-4">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-gray-500">Email: {user.email}</p>
                    <p className="text-sm text-gray-500">Role: {user.role}</p>
                    <p className="text-sm text-gray-500">
                      Credibility: {user.credibility}
                    </p>
                  </div>
                  {user.role !== "ADMIN" && ( // Don't show button for admin users
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
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">My Questions</h2>
          {questions.length === 0 ? (
            <p className="text-gray-500">
              You haven't posted any questions yet.
            </p>
          ) : (
            <div className="space-y-4">
              {questions.map((question) => (
                <div
                  key={question.question_id}
                  className="p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex justify-between items-start">
                    <div
                      className="flex-grow cursor-pointer"
                      onClick={() =>
                        navigate(`/question/${question.question_id}`)
                      }
                    >
                      <h3 className="font-medium">{question.content}</h3>
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
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="text-lg font-bold mb-4">
              Assign Topic to Moderator {selectedUser?.name}
            </h3>
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
                onClick={() => {
                  setIsModalOpen(false);
                  setSelectedUser(null);
                  setSelectedTopic(0);
                }}
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
    </>
  );
}
