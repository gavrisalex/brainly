package com.example.QA.model;

import jakarta.persistence.*;

@Entity
public class Topic {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id_topic;

    private String name;

    public int getTopic_id() {
        return id_topic;
    }

    public void setTopic_id(int topic_id) {
        this.id_topic = topic_id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
