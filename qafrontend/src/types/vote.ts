export type VoteType = 'LIKE' | 'DISLIKE';

export interface VoteRequest {
  response: {
    response_id: number;
  };
  typeOfVote: VoteType;
} 