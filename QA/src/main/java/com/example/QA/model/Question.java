package com.example.QA.model;

import jakarta.persistence.*;

import java.util.Date;

@Entity
public class Question {

    enum Visibility {
        VISIBLE,
        HIDDEN
    }

    enum Status {
        ACCEPTED,
        DENIED
    }

    @Id
    private int question_id;

    @ManyToOne
    @JoinColumn(name = "id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "topic_id", nullable = false)
    private User topic;

    @Column(nullable = false)
    private String content;

    @Column(nullable = false)
    private Date postedOn;
    private Status status;
    private Visibility visibility;
    private int approvedSolution;

    public int getQuestion_id() {
        return question_id;
    }

    public void setQuestion_id(int question_id) {
        this.question_id = question_id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public User getTopic() {
        return topic;
    }

    public void setTopic(User topic) {
        this.topic = topic;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public Date getDate() {
        return postedOn;
    }

    public void setDate(Date date) {
        this.postedOn = date;
    }

    public Status getStatus() {
        return status;
    }

    public void setStatus(Status status) {
        this.status = status;
    }

    public Visibility getVisibility() {
        return visibility;
    }

    public void setVisibility(Visibility visibility) {
        this.visibility = visibility;
    }

    public int getApprovedSolution() {
        return approvedSolution;
    }

    public void setApprovedSolution(int approvedSolution) {
        this.approvedSolution = approvedSolution;
    }
}
