package com.example.QA.service.vote;

import com.example.QA.model.Vote;
import java.util.Optional;

public interface VoteService {
    Vote addVote(Vote vote);

    double calculateUserCredibility(int userId);

    Optional<Vote> getUserVoteForResponse(int responseId, int userId);
}
