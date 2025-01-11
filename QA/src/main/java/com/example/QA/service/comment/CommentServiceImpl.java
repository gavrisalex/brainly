package com.example.QA.service.comment;

import com.example.QA.model.Comment;
import com.example.QA.model.Response;
import com.example.QA.repository.CommentRepository;
import com.example.QA.service.response.ResponseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.Date;

@Service
public class CommentServiceImpl implements CommentService {

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private ResponseService responseService;

    @Override
    public Comment addComment(Comment comment) {
        if (comment.getContent() == null || comment.getContent().trim().isEmpty()) {
            throw new IllegalArgumentException("Comment content cannot be empty");
        }
        if (comment.getUser() == null) {
            throw new IllegalArgumentException("Comment must have a user");
        }
        if (comment.getResponse() == null) {
            throw new IllegalArgumentException("Comment must have a response");
        }

        Response response = responseService.findById(comment.getResponse().getResponse_id());
        comment.setResponse(response);

        comment.setPostedOn(new Date());

        return commentRepository.save(comment);
    }

    @Override
    public Page<Comment> findAll(Pageable pageable) {
        return commentRepository.findAll(pageable);
    }
}
