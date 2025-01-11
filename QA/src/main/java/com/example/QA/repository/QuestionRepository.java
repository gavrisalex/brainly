package com.example.QA.repository;

import com.example.QA.model.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface QuestionRepository extends JpaRepository<Question, Integer> {

    @Query("SELECT q FROM Question q " +
            "WHERE q.status = com.example.QA.model.Question.Status.ACCEPTED " +
            "AND q.visibility = com.example.QA.model.Question.Visibility.VISIBLE " +
            "AND q.topic.id_topic = :topicId " +
            "ORDER BY FUNCTION('SIMILARITY', q.content, :content) DESC " +
            "LIMIT 5")
    List<Question> findSimilarQuestions(@Param("content") String content, @Param("topicId") int topicId);
}
