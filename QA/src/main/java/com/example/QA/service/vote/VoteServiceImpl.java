package com.example.QA.service.vote;

import com.example.QA.model.Response;
import com.example.QA.model.Vote;
import com.example.QA.repository.VoteRepository;
import com.example.QA.service.response.ResponseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class VoteServiceImpl implements VoteService {

    @Autowired
    private VoteRepository voteRepository;

    @Autowired
    private ResponseService responseService;

    @Override
    public Vote addVote(Vote vote) {
        if (vote.getUser() == null) {
            throw new IllegalArgumentException("Vote must have a user");
        }
        if (vote.getResponse() == null) {
            throw new IllegalArgumentException("Vote must have a response");
        }
        if (vote.getTypeOfVote() == null) {
            throw new IllegalArgumentException("Vote type must be specified");
        }

        Response response = responseService.findById(vote.getResponse().getResponse_id());
        vote.setResponse(response);

        Optional<Vote> existingVote = voteRepository.findByResponseIdAndUserId(
                response.getResponse_id(),
                vote.getUser().getId());

        if (existingVote.isPresent()) {
            Vote currentVote = existingVote.get();
            if (currentVote.getTypeOfVote() == vote.getTypeOfVote()) {
                return currentVote;
            }
            currentVote.setTypeOfVote(vote.getTypeOfVote());
            return voteRepository.save(currentVote);
        }

        response.setNrOfVotes(response.getNrOfVotes() + 1);
        return voteRepository.save(vote);
    }

    public double calculateUserCredibility(int userId) {
        List<Response> userResponses = responseService.findByUserId(userId);

        int totalVotes = 0;
        int positiveVotes = 0;

        for (Response response : userResponses) {
            List<Vote> votes = voteRepository.findAllByResponseResponse_id(response.getResponse_id());

            for (Vote vote : votes) {
                totalVotes++;
                if (vote.getTypeOfVote() == Vote.TypeOfVote.LIKE) {
                    positiveVotes++;
                }
            }
        }

        return totalVotes > 0 ? ((double) positiveVotes / totalVotes) * 100 : 0;
    }
}
