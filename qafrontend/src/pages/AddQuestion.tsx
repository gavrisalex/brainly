import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

interface Topic {
  topic_id: number;
  name: string;
}

export function AddQuestion() {
  const [content, setContent] = useState("");
  const [selectedTopic, setSelectedTopic] = useState<number>(0);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const token = localStorage.getItem("token");
        console.log("Fetching topics with token:", token);

        const response = await axios.get("http://localhost:8080/topic/getAll", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        });

        console.log("Raw topics response:", response.data);

        if (response.data.success) {
          console.log("Topics data:", response.data.data);
          setTopics(response.data.data);
        } else {
          console.error("Failed to fetch topics:", response.data.error);
        }
      } catch (error) {
        console.error("Error fetching topics:", error);
        if (axios.isAxiosError(error)) {
          console.error("Response data:", error.response?.data);
        }
        setError("Failed to load topics");
      }
    };

    fetchTopics();
  }, []);

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

    try {
      const token = localStorage.getItem("token");
      console.log("Token before submission:", token);

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

      console.log("Question submission response:", response.data);

      if (response.data.success) {
        console.log("Question added successfully, redirecting...");
        navigate("/dashboard");
      } else {
        setError(response.data.error || "Failed to add question");
      }
    } catch (error) {
      console.error("Error adding question:", error);
      setError("Failed to add question");
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Ask a Question</h1>
      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
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

        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Submit Question
        </button>
      </form>
    </div>
  );
}
