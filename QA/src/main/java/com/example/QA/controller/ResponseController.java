package com.example.QA.controller;

import com.example.QA.controller.common.ApiResponse;
import com.example.QA.model.Response;
import com.example.QA.model.User;
import com.example.QA.model.Vote;
import com.example.QA.service.MyUserDetailsService;
import com.example.QA.service.response.ResponseService;
import com.example.QA.service.vote.VoteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PathVariable;
import java.util.Optional;

@RestController
@RequestMapping("/response")
@CrossOrigin
public class ResponseController {

    @Autowired
    private ResponseService responseService;

    @Autowired
    private MyUserDetailsService userDetailsService;

    @Autowired
    private VoteService voteService;

    @PostMapping("/add")
    public ApiResponse<?> addResponse(
            @RequestHeader("Authorization") String token,
            @RequestBody Response response) {
        try {
            User user = userDetailsService.getUserFromToken(token);
            response.setUser(user);

            Response newResponse = responseService.addResponse(response);
            return new ApiResponse<>(true, newResponse, null);
        } catch (IllegalArgumentException e) {
            return new ApiResponse<>(false, null, e.getMessage());
        } catch (Exception e) {
            return new ApiResponse<>(false, null,
                    "An error occurred while adding the response: " + e.getMessage());
        }
    }

    @GetMapping("/getAll")
    public ApiResponse<Page<Response>> getAllResponses(
            @RequestHeader("Authorization") String token,
            Pageable pageable) {
        try {
            User currentUser = userDetailsService.getUserFromToken(token);
            Page<Response> responses = responseService.findAll(pageable);

            // Add user vote information to each response
            responses.getContent().forEach(response -> {
                Optional<Vote> userVote = voteService.getUserVoteForResponse(
                        response.getResponse_id(),
                        currentUser.getId());
                userVote.ifPresent(vote -> {
                    response.setUserVote(vote.getTypeOfVote());
                });
            });

            return new ApiResponse<>(true, responses, null);
        } catch (Exception e) {
            return new ApiResponse<>(false, null, "Failed to fetch responses: " + e.getMessage());
        }
    }

    @PutMapping("/{id}/solution")
    public ApiResponse<?> markResponseAsSolution(
            @RequestHeader("Authorization") String token,
            @PathVariable int id) {
        try {
            User user = userDetailsService.getUserFromToken(token);
            Response updatedResponse = responseService.markAsSolution(id, user);
            return new ApiResponse<>(true, updatedResponse, null);
        } catch (IllegalArgumentException e) {
            return new ApiResponse<>(false, null, e.getMessage());
        } catch (Exception e) {
            return new ApiResponse<>(false, null,
                    "An error occurred while marking response as solution: " + e.getMessage());
        }
    }
}
