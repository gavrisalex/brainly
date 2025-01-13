import { useEffect, useState } from "react";
import axios from "axios";
import { Question } from "@/types/question";
import { Link, useNavigate } from "react-router-dom";

export function Dashboard() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Helper function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const token = localStorage.getItem("token");
        console.log("Token:", token);

        if (!token) {
          console.error("No token found");
          return;
        }

        const response = await axios.get(
          "http://localhost:8080/question/accepted-visible",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            withCredentials: true,
          }
        );

        console.log("Raw API Response:", response.data);

        if (response.data.success) {
          console.log("Questions data:", response.data.data);
          setQuestions(response.data.data);
        } else {
          console.error("API request not successful:", response.data.error);
        }
      } catch (error) {
        console.error("Error fetching questions:", error);
        if (axios.isAxiosError(error)) {
          console.error("Response data:", error.response?.data);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  console.log("Current questions state:", questions);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading questions...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Questions</h1>
        <Link
          to="/ask"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Ask a Question
        </Link>
      </div>
      <div className="grid gap-6">
        {questions && questions.length > 0 ? (
          questions.map((question) => (
            <div
              key={question.question_id}
              className="bg-white p-6 rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => navigate(`/question/${question.question_id}`)}
            >
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-semibold">{question.content}</h2>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  {question.topic.name}
                </span>
              </div>
              <div className="flex justify-between items-center text-gray-600 text-sm">
                <div className="flex items-center gap-2">
                  <span>Posted by: {question.user.name}</span>
                </div>
                <div>Posted on: {formatDate(question.postedOn)}</div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-500">No questions found</div>
        )}
      </div>
    </div>
  );
}
