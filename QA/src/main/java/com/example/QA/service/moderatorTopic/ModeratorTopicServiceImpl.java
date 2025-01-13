package com.example.QA.service.moderatorTopic;

import com.example.QA.model.ModeratorTopic;
import com.example.QA.repository.ModeratorTopicRepository;
import com.example.QA.repository.UserRepository;
import com.example.QA.model.User;
import com.example.QA.repository.TopicRepository;
import com.example.QA.model.Topic;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ModeratorTopicServiceImpl implements ModeratorTopicService {

    @Autowired
    private ModeratorTopicRepository moderatorTopicRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TopicRepository topicRepository;

    @Override
    public ModeratorTopic addModeratorTopic(ModeratorTopic moderatorTopic) {
        if (moderatorTopic.getUser() == null) {
            throw new IllegalArgumentException("User information is required");
        }

        User user = userRepository.findById(moderatorTopic.getUser().getId())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (user.getRole() != User.Role.MOD) {
            throw new IllegalArgumentException("The user must be a moderator");
        }

        if (moderatorTopicRepository.existsByUser(user)) {
            throw new IllegalArgumentException("This moderator is already assigned to a topic");
        }

        Topic topic = topicRepository.findById(moderatorTopic.getTopic().getTopic_id())
                .orElseThrow(() -> new IllegalArgumentException("Topic not found"));

        List<ModeratorTopic> existingAssignments = moderatorTopicRepository.findByTopicId(topic.getTopic_id());
        if (!existingAssignments.isEmpty()) {
            throw new IllegalArgumentException("This topic is already assigned to another moderator");
        }

        moderatorTopic.setUser(user);
        moderatorTopic.setTopic(topic);

        return moderatorTopicRepository.save(moderatorTopic);
    }

    @Override
    public List<ModeratorTopic> getAllModeratorTopics() {
        return moderatorTopicRepository.findAll();
    }
}
