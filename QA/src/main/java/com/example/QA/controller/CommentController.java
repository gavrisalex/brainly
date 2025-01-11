package com.example.QA.controller;

import com.example.QA.controller.common.ApiResponse;
import com.example.QA.service.MyUserDetailsService;
import com.example.QA.service.comment.CommentService;
import com.example.QA.model.Comment;

import com.example.QA.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/comment")
@CrossOrigin
public class CommentController {
    @Autowired
    private CommentService commentService;

    @Autowired
    private MyUserDetailsService userDetailsService;

    @PostMapping("/add")
    public ApiResponse<?> addComment(
            @RequestHeader("Authorization") String token,
            @RequestBody Comment comment) {
        try {
            User user = userDetailsService.getUserFromToken(token);
            comment.setUser(user);

            Comment newComment = commentService.addComment(comment);
            return new ApiResponse<>(true, newComment, null);
        } catch (IllegalArgumentException e) {
            return new ApiResponse<>(false, null, e.getMessage());
        } catch (Exception e) {
            return new ApiResponse<>(false, null,
                    "An error occurred while adding the comment: " + e.getMessage());
        }
    }

    @GetMapping("/getAll")
    public ApiResponse<?> getAllComments(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            Page<Comment> comments = commentService.findAll(PageRequest.of(page, size));
            return new ApiResponse<>(true, comments, null);
        } catch (Exception e) {
            return new ApiResponse<>(false, null,
                    "An error occurred while fetching comments: " + e.getMessage());
        }
    }
}
