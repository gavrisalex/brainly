package com.example.QA.service.question;

import com.example.QA.model.Question;
import com.example.QA.model.User;
import com.example.QA.repository.QuestionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;
import java.util.Set;
import java.util.Arrays;
import java.util.HashSet;
import java.util.stream.Collectors;

@Service
public class QuestionServiceImpl implements QuestionService {

    @Autowired
    private QuestionRepository questionRepository;

    @Override
    public Question addQuestion(Question question) {
        question.setPostedOn(new Date());
        question.setStatus(Question.Status.PENDING);
        question.setVisibility(Question.Visibility.HIDDEN);
        question.setApprovedSolution(0);

        if (question.getContent() == null || question.getContent().trim().isEmpty()) {
            throw new IllegalArgumentException("Question content cannot be empty");
        }
        if (question.getUser() == null) {
            throw new IllegalArgumentException("Question must have a user");
        }
        if (question.getTopic() == null) {
            throw new IllegalArgumentException("Question must have a topic");
        }

        return questionRepository.save(question);
    }

    @Override
    public Question findById(int id) {
        return questionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Question not found with id: " + id));
    }

    @Override
    public Question updateQuestionStatus(int id, Question.Status status) {
        Question question = findById(id);
        question.setStatus(status);

        if (status == Question.Status.ACCEPTED) {
            question.setVisibility(Question.Visibility.VISIBLE);
        } else if (status == Question.Status.DENIED) {
            question.setVisibility(Question.Visibility.HIDDEN);
        }

        return questionRepository.save(question);
    }

    @Override
    public Page<Question> findAll(Pageable pageable) {
        return questionRepository.findAll(pageable);
    }

    @Override
    public List<Question> findSimilarQuestions(String content, int topicId) {
        // Simple word matching algorithm if database doesn't support SIMILARITY
        // function
        List<Question> allQuestions = questionRepository.findAll();

        return allQuestions.stream()
                .filter(q -> q.getStatus() == Question.Status.ACCEPTED
                        && q.getVisibility() == Question.Visibility.VISIBLE
                        && q.getTopic().getTopic_id() == topicId)
                .map(q -> {
                    // Calculate similarity score
                    Set<String> words1 = new HashSet<>(Arrays.asList(content.toLowerCase().split("\\W+")));
                    Set<String> words2 = new HashSet<>(Arrays.asList(q.getContent().toLowerCase().split("\\W+")));

                    Set<String> intersection = new HashSet<>(words1);
                    intersection.retainAll(words2);

                    Set<String> union = new HashSet<>(words1);
                    union.addAll(words2);

                    double similarity = (double) intersection.size() / union.size();

                    // Store similarity score temporarily
                    q.setApprovedSolution((int) (similarity * 100));
                    return q;
                })
                .filter(q -> q.getApprovedSolution() > 30) // More than 30% similar
                .sorted((q1, q2) -> Integer.compare(q2.getApprovedSolution(), q1.getApprovedSolution()))
                .limit(5)
                .collect(Collectors.toList());
    }

    @Override
    public Question updateQuestionVisibility(int id, User user) {
        Question question = findById(id);

        boolean isOwner = question.getUser().getId() == user.getId();
        boolean isAdmin = user.getRole() == User.Role.ADMIN;
        boolean isDenied= question.getStatus() == Question.Status.DENIED;
        boolean isPending=question.getStatus() == Question.Status.PENDING;

        if (!isOwner && !isAdmin) {
            throw new IllegalArgumentException("Only the question owner or an admin can modify question visibility");
        }

        if(isDenied || isPending)
            throw new IllegalArgumentException("The question is not approved so therefore can't be made visible");

        if (question.getVisibility() == Question.Visibility.VISIBLE) {
            question.setVisibility(Question.Visibility.HIDDEN);
        } else {
            question.setVisibility(Question.Visibility.VISIBLE);
        }

        return questionRepository.save(question);
    }
}
