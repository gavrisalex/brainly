package com.example.QA.model;

import jakarta.persistence.*;

@Entity
public class ModeratorTopic {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int moderatorTopic_id;

    @OneToOne
    @JoinColumn(name = "id", nullable = false)
    private User user;

    @OneToOne
    @JoinColumn(name = "id_topic", nullable = false)
    private Topic topic;

    public int getModeratorTopic_id() {
        return moderatorTopic_id;
    }

    public void setModeratorTopic_id(int moderatorTopic_id) {
        this.moderatorTopic_id = moderatorTopic_id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Topic getTopic() {
        return topic;
    }

    public void setTopic(Topic topic) {
        this.topic = topic;
    }
}
