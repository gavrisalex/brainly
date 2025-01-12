package com.example.QA.service.question;

import com.example.QA.model.Question;
import com.example.QA.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface QuestionService {
    Question addQuestion(Question question);

    Question findById(int id);

    Question updateQuestionStatus(int id, Question.Status status);

    Page<Question> findAll(Pageable pageable);

    List<Question> findSimilarQuestions(String content, int topicId);

    Question updateQuestionVisibility(int id, User user);

    List<Question> findAcceptedAndVisibleQuestions();

    Page<Question> findByUserId(int userId, Pageable pageable);
}
