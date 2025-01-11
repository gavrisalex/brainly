package com.example.QA.service.topic;

import com.example.QA.model.Topic;

import java.util.List;

public interface TopicService {
    public Topic saveTopic(Topic topic);

    List<Topic> getAllTopics();

}
