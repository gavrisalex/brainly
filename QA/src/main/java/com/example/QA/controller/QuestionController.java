package com.example.QA.controller;

import com.example.QA.controller.common.ApiResponse;
import com.example.QA.mail.JavaSmtpGmailSenderApplication;
import com.example.QA.model.Question;
import com.example.QA.repository.ModeratorTopicRepository;
import com.example.QA.service.MyUserDetailsService;
import com.example.QA.service.question.QuestionService;
import com.example.QA.model.User;
import com.example.QA.model.Topic;
import com.example.QA.repository.TopicRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PutMapping;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/question")
@CrossOrigin
public class QuestionController {

    @Autowired
    private QuestionService questionService;

    @Autowired
    private MyUserDetailsService userDetailsService;

    @Autowired
    private TopicRepository topicRepository;

    @Autowired
    private ModeratorTopicRepository moderatorTopicRepository;

    @Autowired
    private JavaSmtpGmailSenderApplication javaSmtpGmailSenderApplication;

    @PostMapping("/add")
    public ApiResponse<?> addQuestion(
            @RequestHeader("Authorization") String token,
            @RequestBody Question question) {
        try {
            User user = userDetailsService.getUserFromToken(token);
            question.setUser(user);

            if (question.getTopic() == null || question.getTopic().getTopic_id() == 0) {
                throw new IllegalArgumentException("Topic ID is required");
            }

            Topic topic = topicRepository.findById(question.getTopic().getTopic_id())
                    .orElseThrow(() -> new IllegalArgumentException("Topic not found"));
            question.setTopic(topic);

            Question newQuestion = questionService.addQuestion(question);

            List<String> moderatorEmails = moderatorTopicRepository.findByTopicId(topic.getTopic_id())
                    .stream()
                    .map(modTopic -> modTopic.getUser().getEmail())
                    .collect(Collectors.toList());

            for (String email : moderatorEmails) {
                javaSmtpGmailSenderApplication.sendMail(
                        email,
                        "New Question Pending Review",
                        "A new question has been submitted in your topic area:\n\n" +
                                "Content: " + question.getContent() + "\n" +
                                "Topic: " + topic.getName() + "\n" +
                                "Posted by: " + user.getName());
            }

            return new ApiResponse<>(true, newQuestion, null);
        } catch (IllegalArgumentException e) {
            return new ApiResponse<>(false, null, e.getMessage());
        } catch (Exception e) {
            return new ApiResponse<>(false, null,
                    "An error occurred while adding the question: " + e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ApiResponse<Question> getQuestionById(@PathVariable int id) {
        try {
            Question question = questionService.findById(id);
            return new ApiResponse<>(true, question, null);
        } catch (Exception e) {
            return new ApiResponse<>(false, null, "Question not found: " + e.getMessage());
        }
    }

    @PutMapping("/{id}/status")
    public ApiResponse<?> updateQuestionStatus(
            @RequestHeader("Authorization") String token,
            @PathVariable int id,
            @RequestParam Question.Status status) {
        try {
            User user = userDetailsService.getUserFromToken(token);
            if (user.getRole() != User.Role.MOD && user.getRole() != User.Role.ADMIN) {
                throw new IllegalArgumentException("Only moderators can update question status");
            }

            Question updatedQuestion = questionService.updateQuestionStatus(id, status);
            return new ApiResponse<>(true, updatedQuestion, null);
        } catch (IllegalArgumentException e) {
            return new ApiResponse<>(false, null, e.getMessage());
        } catch (Exception e) {
            return new ApiResponse<>(false, null,
                    "An error occurred while updating the question status: " + e.getMessage());
        }
    }

    @GetMapping("/getAll")
    public ApiResponse<?> getAllQuestions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            Page<Question> questions = questionService.findAll(PageRequest.of(page, size));
            return new ApiResponse<>(true, questions, null);
        } catch (Exception e) {
            return new ApiResponse<>(false, null,
                    "An error occurred while fetching questions: " + e.getMessage());
        }
    }

    @GetMapping("/similar")
    public ApiResponse<?> findSimilarQuestions(
            @RequestParam String content,
            @RequestParam int topicId) {
        try {
            List<Question> similarQuestions = questionService.findSimilarQuestions(content, topicId);
            return new ApiResponse<>(true, similarQuestions, null);
        } catch (Exception e) {
            return new ApiResponse<>(false, null,
                    "An error occurred while finding similar questions: " + e.getMessage());
        }
    }

    @PutMapping("/{id}/visibility")
    public ApiResponse<?> updateQuestionVisibility(
            @RequestHeader("Authorization") String token,
            @PathVariable int id) {
        try {
            User user = userDetailsService.getUserFromToken(token);
            Question updatedQuestion = questionService.updateQuestionVisibility(id, user);
            return new ApiResponse<>(true, updatedQuestion, null);
        } catch (IllegalArgumentException e) {
            return new ApiResponse<>(false, null, e.getMessage());
        } catch (Exception e) {
            return new ApiResponse<>(false, null,
                    "An error occurred while updating question visibility: " + e.getMessage());
        }
    }

    @GetMapping("/accepted-visible")
    public ApiResponse<?> getAcceptedAndVisibleQuestions() {
        try {
            List<Question> questions = questionService.findAcceptedAndVisibleQuestions();
            return new ApiResponse<>(true, questions, null);
        } catch (Exception e) {
            return new ApiResponse<>(false, null, "An error occurred while fetching questions: " + e.getMessage());
        }
    }

    @GetMapping("/user")
    public ApiResponse<Page<Question>> getUserQuestions(
            @RequestHeader("Authorization") String token,
            Pageable pageable) {
        try {
            User currentUser = userDetailsService.getUserFromToken(token);
            Page<Question> questions = questionService.findByUserId(currentUser.getId(), pageable);
            return new ApiResponse<>(true, questions, null);
        } catch (Exception e) {
            return new ApiResponse<>(false, null, "Failed to fetch user questions: " + e.getMessage());
        }
    }

    @GetMapping("/pending")
    public ApiResponse<?> getPendingQuestions(@RequestHeader("Authorization") String token) {
        try {
            User user = userDetailsService.getUserFromToken(token);
            if (user.getRole() != User.Role.MOD && user.getRole() != User.Role.ADMIN) {
                throw new IllegalArgumentException("Only moderators can view pending questions");
            }

            List<Question> pendingQuestions;
            if (user.getRole() == User.Role.ADMIN) {
                pendingQuestions = questionService.findAllPendingQuestions();
            } else {
                pendingQuestions = questionService.findPendingQuestionsByModerator(user);
            }

            return new ApiResponse<>(true, pendingQuestions, null);
        } catch (Exception e) {
            return new ApiResponse<>(false, null, "Failed to fetch pending questions: " + e.getMessage());
        }
    }
}
