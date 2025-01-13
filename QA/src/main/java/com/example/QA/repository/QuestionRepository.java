package com.example.QA.repository;

import com.example.QA.model.Question;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuestionRepository extends JpaRepository<Question, Integer> {

    @Query("SELECT q FROM Question q " +
            "WHERE q.status = com.example.QA.model.Question.Status.ACCEPTED " +
            "AND q.visibility = com.example.QA.model.Question.Visibility.VISIBLE " +
            "AND q.topic.id_topic = :topicId " +
            "ORDER BY FUNCTION('SIMILARITY', q.content, :content) DESC " +
            "LIMIT 5")
    List<Question> findSimilarQuestions(@Param("content") String content, @Param("topicId") int topicId);

    @Query("SELECT q FROM Question q WHERE q.status = com.example.QA.model.Question.Status.ACCEPTED AND q.visibility = com.example.QA.model.Question.Visibility.VISIBLE ORDER BY q.postedOn DESC")
    List<Question> findAcceptedAndVisibleQuestions();

    @Query("SELECT q FROM Question q WHERE q.user.id = :userId")
    Page<Question> findByUserId(@Param("userId") int userId, Pageable pageable);

    @Query("SELECT q FROM Question q WHERE q.status = com.example.QA.model.Question.Status.PENDING AND q.topic.id_topic IN :topicIds")
    List<Question> findPendingQuestionsByTopics(@Param("topicIds") List<Integer> topicIds);

    @Query("SELECT q FROM Question q WHERE q.status = com.example.QA.model.Question.Status.PENDING")
    List<Question> findAllPendingQuestions();
}
