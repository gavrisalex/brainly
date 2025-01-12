package com.example.QA.controller;

import com.example.QA.controller.common.ApiResponse;
import com.example.QA.model.ModeratorTopic;
import com.example.QA.service.MyUserDetailsService;
import com.example.QA.service.moderatorTopic.ModeratorTopicService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/modTopics")
@CrossOrigin
public class ModeratorTopicController {

    @Autowired
    private ModeratorTopicService moderatorTopicService;

    @Autowired
    private MyUserDetailsService userDetailsService;

    // trimite in json topic_id nu id_topic
    @PostMapping("/add")
    public ApiResponse<?> addModeratorTopic(
            @RequestHeader("Authorization") String token,
            @RequestBody ModeratorTopic moderatorTopic) {

        if (!userDetailsService.isAdmin(token)) {
            return new ApiResponse<>(false, null,
                    "Only administrators can assign topics to moderators");
        }

        try {
            ModeratorTopic newModeratorTopic = moderatorTopicService.addModeratorTopic(moderatorTopic);
            return new ApiResponse<>(true, newModeratorTopic, null);
        } catch (IllegalArgumentException e) {
            return new ApiResponse<>(false, null, e.getMessage());
        } catch (Exception e) {
            return new ApiResponse<>(false, null,
                    "An error occurred while assigning the topic to the moderator: " + e.getMessage());
        }
    }

    @GetMapping("/getAll")
    public ApiResponse<?> getAllModeratorTopics(
            @RequestHeader("Authorization") String token) {

        if (!userDetailsService.isAdmin(token)) {
            return new ApiResponse<>(false, null,
                    "Only administrators can view all moderator topics");
        }

        try {
            List<ModeratorTopic> moderatorTopics = moderatorTopicService.getAllModeratorTopics();
            return new ApiResponse<>(true, moderatorTopics, null);
        } catch (Exception e) {
            return new ApiResponse<>(false, null, e.getMessage());
        }
    }
}
