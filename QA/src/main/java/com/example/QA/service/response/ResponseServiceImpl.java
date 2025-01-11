package com.example.QA.service.response;

import com.example.QA.model.Question;
import com.example.QA.model.Response;
import com.example.QA.model.User;
import com.example.QA.repository.ResponseRepository;
import com.example.QA.service.question.QuestionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.Date;

@Service
public class ResponseServiceImpl implements ResponseService {

    @Autowired
    private ResponseRepository responseRepository;

    @Autowired
    private QuestionService questionService;

    @Override
    public Response addResponse(Response response) {
        if (response.getContent() == null || response.getContent().trim().isEmpty()) {
            throw new IllegalArgumentException("Response content cannot be empty");
        }
        if (response.getUser() == null) {
            throw new IllegalArgumentException("Response must have a user");
        }
        if (response.getQuestion() == null) {
            throw new IllegalArgumentException("Response must have a question");
        }

        Question question = questionService.findById(response.getQuestion().getQuestion_id());

        if (question.getStatus() == Question.Status.PENDING) {
            throw new IllegalArgumentException("Cannot add response to a pending question");
        }
        if (question.getStatus() == Question.Status.DENIED) {
            throw new IllegalArgumentException("Cannot add response to a denied question");
        }

        response.setPostedOn(new Date());
        response.setNrOfVotes(0);
        response.setSolution(Response.Solution.NO);
        response.setQuestion(question);

        return responseRepository.save(response);
    }

    @Override
    public Page<Response> findAll(Pageable pageable) {
        return responseRepository.findAll(pageable);
    }

    @Override
    public Response markAsSolution(int responseId, User user) {
        Response response = responseRepository.findById(responseId)
                .orElseThrow(() -> new IllegalArgumentException("Response not found"));

        if (response.getQuestion().getUser().getId() != user.getId()) {
            throw new IllegalArgumentException("Only the question owner can mark a response as solution");
        }

        Question question = response.getQuestion();

        if (question.getApprovedSolution() != 0) {
            Response previousSolution = responseRepository.findById(question.getApprovedSolution())
                    .orElse(null);
            if (previousSolution != null) {
                previousSolution.setSolution(Response.Solution.NO);
                responseRepository.save(previousSolution);
            }
        }

        response.setSolution(Response.Solution.YES);
        question.setApprovedSolution(responseId);

        return responseRepository.save(response);
    }

    @Override
    public Response findById(int id) {
        return responseRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Response not found with id: " + id));
    }
}
