package com.example.QA.service.vote;

import com.example.QA.model.Vote;
import org.springframework.stereotype.Service;


public interface VoteService {
    Vote addVote(Vote vote);

    double calculateUserCredibility(int userId);
}
