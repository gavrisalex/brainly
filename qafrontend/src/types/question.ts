export interface Question {
  question_id: number;
  user: {
    id: number;
    name: string;
    role: string;
  };
  topic: {
    name: string;
    topic_id: number;
  };
  content: string;
  postedOn: string;
  status: 'ACCEPTED' | 'PENDING';
  visibility: 'VISIBLE' | 'HIDDEN';
  approvedSolution: number;
} 