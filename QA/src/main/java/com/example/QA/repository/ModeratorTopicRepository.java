package com.example.QA.repository;

import com.example.QA.model.ModeratorTopic;
import com.example.QA.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ModeratorTopicRepository extends JpaRepository<ModeratorTopic, Integer> {
    boolean existsByUser(User user);

    @Query("SELECT mt FROM ModeratorTopic mt WHERE mt.topic.id_topic = :topicId")
    List<ModeratorTopic> findByTopicId(@Param("topicId") int topicId);

    @Query("SELECT mt FROM ModeratorTopic mt WHERE mt.user.id = :userId")
    List<ModeratorTopic> findByUserId(@Param("userId") int userId);

    @Modifying
    @Query("DELETE FROM ModeratorTopic mt WHERE mt.user.id = :userId")
    void deleteByUserId(int userId);
}
