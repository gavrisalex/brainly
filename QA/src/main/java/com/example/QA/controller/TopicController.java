package com.example.QA.controller;


import com.example.QA.controller.common.ApiResponse;
import com.example.QA.exceptions.user.EmailAlreadyExistsException;
import com.example.QA.exceptions.user.NameAlreadyExistsException;
import com.example.QA.model.Topic;
import com.example.QA.service.MyUserDetailsService;
import com.example.QA.service.topic.TopicService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/topic")
@CrossOrigin
public class TopicController {

    @Autowired
    TopicService topicService;

    @Autowired
    MyUserDetailsService userDetailsService;

    @PostMapping("/add")
    public ApiResponse<String> addTopic(
            @RequestHeader("Authorization") String token,
            @RequestBody Topic topic) {
        //System.out.println("Token received: " + token);
        boolean isAdmin = userDetailsService.isAdmin(token);
       // System.out.println("Is admin: " + isAdmin);

        if(isAdmin) {
            try {
                topicService.saveTopic(topic);
                return new ApiResponse<>(true, "New topic added", null);
            } catch (NameAlreadyExistsException e) {
                return new ApiResponse<>(false, null, e.getMessage());
            }
        }
        return new ApiResponse<>(false, null, "Only administrators can add topics!");
    }
    @GetMapping("/getAll")
    public List<Topic> getAllTopics(){return topicService.getAllTopics();}
}
