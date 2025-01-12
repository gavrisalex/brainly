package com.example.QA.controller;

import com.example.QA.controller.common.ApiResponse;
import com.example.QA.service.MyUserDetailsService;
import com.example.QA.service.vote.VoteService;
import com.example.QA.model.Vote;
import com.example.QA.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/vote")
@CrossOrigin
public class VoteController {

    @Autowired
    private VoteService voteService;

    @Autowired
    private MyUserDetailsService userDetailsService;

    @PostMapping("/add")
    public ApiResponse<?> addVote(
            @RequestHeader("Authorization") String token,
            @RequestBody Vote vote) {
        try {
            User user = userDetailsService.getUserFromToken(token);
            vote.setUser(user);

            Vote newVote = voteService.addVote(vote);
            return new ApiResponse<>(true, newVote, null);
        } catch (IllegalArgumentException e) {
            return new ApiResponse<>(false, null, e.getMessage());
        } catch (Exception e) {
            return new ApiResponse<>(false, null,
                    "An error occurred while adding the vote: " + e.getMessage());
        }
    }

    @GetMapping("/credibility/{userId}")
    public ApiResponse<?> getUserCredibility(@PathVariable int userId) {
        try {
            double credibility = voteService.calculateUserCredibility(userId);
            return new ApiResponse<>(true, credibility, null);
        } catch (Exception e) {
            return new ApiResponse<>(false, null,
                    "An error occurred while calculating credibility: " + e.getMessage());
        }
    }
}
