import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

interface Topic {
  topic_id: number;
  name: string;
}

interface SimilarQuestion {
  question_id: number;
  user: {
    id: number;
    name: string;
  };
  topic: Topic;
  content: string;
  postedOn: string;
  status: string;
  visibility: string;
  approvedSolution: number;
}

export function AddQuestion() {
  const [content, setContent] = useState("");
  const [selectedTopic, setSelectedTopic] = useState<number>(0);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [similarQuestions, setSimilarQuestions] = useState<SimilarQuestion[]>(
    []
  );
  const [showAskForm, setShowAskForm] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:8080/topic/getAll", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        });

        if (response.data.success) {
          setTopics(response.data.data);
        } else {
          console.error("Failed to fetch topics:", response.data.error);
        }
      } catch (error) {
        console.error("Error fetching topics:", error);
        setError("Failed to load topics");
      }
    };

    fetchTopics();
  }, []);

  const checkSimilarQuestions = async (): Promise<boolean> => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:8080/question/similar?content=${encodeURIComponent(
          content
        )}&topicId=${selectedTopic}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      if (response.data.success) {
        const foundQuestions = response.data.data;
        setSimilarQuestions(foundQuestions);
        return foundQuestions.length > 0;
      }
      return false;
    } catch (error) {
      console.error("Error searching questions:", error);
      return false;
    }
  };

  const submitQuestion = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:8080/question/add",
        {
          content: content,
          topic: {
            topic_id: selectedTopic,
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
        navigate("/dashboard");
      } else {
        setError(response.data.error || "Failed to add question");
      }
    } catch (error) {
      console.error("Error adding question:", error);
      setError("Failed to add question");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!content.trim()) {
      setError("Question content cannot be empty");
      return;
    }

    if (!selectedTopic) {
      setError("Please select a topic");
      return;
    }

    // First check for similar questions
    const hasSimilarQuestions = await checkSimilarQuestions();

    if (!hasSimilarQuestions) {
      // If no similar questions found, proceed with submission
      await submitQuestion();
    }
    // If similar questions found, they will be displayed and user can choose to "Ask Anyway"
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Ask a Question</h1>

      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <label
            htmlFor="topic"
            className="block text-gray-700 text-sm font-bold mb-2"
          >
            Topic
          </label>
          <select
            id="topic"
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(Number(e.target.value))}
            className="shadow border rounded w-full py-2 px-3 text-gray-700 focus:outline-none focus:shadow-outline"
            required
          >
            <option value={0}>Select a topic</option>
            {topics.map((topic) => (
              <option key={topic.topic_id} value={topic.topic_id}>
                {topic.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-6">
          <label
            htmlFor="content"
            className="block text-gray-700 text-sm font-bold mb-2"
          >
            Question
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="shadow border rounded w-full py-2 px-3 text-gray-700 focus:outline-none focus:shadow-outline"
            rows={6}
            required
            placeholder="Type your question here..."
          />
        </div>

        {error && <div className="text-red-500 mb-4">{error}</div>}

        {similarQuestions.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-bold mb-4">Similar Questions Found</h2>
            <p className="text-gray-600 mb-4">
              We found some similar questions. Please check if any of these
              answer your question:
            </p>
            <div className="space-y-4">
              {similarQuestions.map((question) => (
                <Link
                  key={question.question_id}
                  to={`/question/${question.question_id}`}
                  className="block p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <h3 className="font-medium">{question.content}</h3>
                  <div className="text-sm text-gray-500 mt-2">
                    <span>Posted by: {question.user.name}</span>
                    <span className="mx-2">•</span>
                    <span>Topic: {question.topic.name}</span>
                    <span className="mx-2">•</span>
                    <span>
                      Posted on:{" "}
                      {new Date(question.postedOn).toLocaleDateString()}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-4 justify-end">
          {similarQuestions.length > 0 ? (
            <>
              <button
                type="button"
                onClick={submitQuestion}
                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Ask Anyway
              </button>
            </>
          ) : (
            <button
              type="submit"
              onClick={handleSubmit}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Submit Question
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
