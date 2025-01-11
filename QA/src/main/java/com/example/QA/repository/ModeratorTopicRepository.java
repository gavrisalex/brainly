package com.example.QA.repository;

import com.example.QA.model.ModeratorTopic;
import com.example.QA.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ModeratorTopicRepository extends JpaRepository<ModeratorTopic, Integer> {
    boolean existsByUser(User user);
}
