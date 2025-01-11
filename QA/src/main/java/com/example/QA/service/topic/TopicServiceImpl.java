package com.example.QA.service.topic;

import com.example.QA.exceptions.user.NameAlreadyExistsException;
import com.example.QA.model.Topic;
import com.example.QA.repository.TopicRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TopicServiceImpl implements TopicService{

    @Autowired
    TopicRepository topicRepository;

    @Override
    public Topic saveTopic(Topic topic) {

        if(topicRepository.existsByName(topic.getName()))
           throw new NameAlreadyExistsException("This topic already exists!");

        return topicRepository.save(topic);

    }

    @Override
    public List<Topic> getAllTopics() {
        return topicRepository.findAll();
    }

}
