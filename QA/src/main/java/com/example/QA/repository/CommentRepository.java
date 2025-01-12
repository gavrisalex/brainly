package com.example.QA.repository;

import com.example.QA.model.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Integer> {
    @Query("SELECT c FROM Comment c WHERE c.response.response_id = :responseId")
    List<Comment> findByResponseResponseId(@Param("responseId") int responseId);
}
