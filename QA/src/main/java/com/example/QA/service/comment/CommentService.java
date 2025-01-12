package com.example.QA.service.comment;

import com.example.QA.model.Comment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public interface CommentService {
    Comment addComment(Comment comment);

    Page<Comment> findAll(Pageable pageable);

    List<Comment> findByResponseId(int responseId);
}
