package com.example.QA.service.moderatorTopic;

import com.example.QA.model.ModeratorTopic;
import java.util.List;

public interface ModeratorTopicService {
    ModeratorTopic addModeratorTopic(ModeratorTopic moderatorTopic);

    List<ModeratorTopic> getAllModeratorTopics();
}
