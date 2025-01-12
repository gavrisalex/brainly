export interface Response {
  response_id: number;
  question: {
    question_id: number;
    user: {
      id: number;
      name: string;
    };
    topic: {
      name: string;
      topic_id: number;
    };
    content: string;
    postedOn: string;
    status: string;
    visibility: string;
    approvedSolution: number;
  };
  user: {
    id: number;
    name: string;
  };
  content: string;
  postedOn: string;
  nrOfVotes: number;
  solution: "YES" | "NO";
  userVote?: "LIKE" | "DISLIKE" | null;
}

export interface Comment {
  comment_id: number;
  response: {
    response_id: number;
  };
  user: {
    id: number;
    name: string;
  };
  content: string;
  postedOn: string;
} 