package com.example.QA.model;

import jakarta.persistence.*;

import java.util.Date;

@Entity
public class Question {

    public enum Visibility {
        VISIBLE,
        HIDDEN
    }

    public enum Status {
        PENDING,
        ACCEPTED,
        DENIED
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int question_id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "topic_id", nullable = false)
    private Topic topic;

    @Column(nullable = false)
    private String content;

    @Column(name = "date", nullable = false)
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

    public Topic getTopic() {
        return topic;
    }

    public void setTopic(Topic topic) {
        this.topic = topic;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public Date getPostedOn() {
        return postedOn;
    }

    public void setPostedOn(Date postedOn) {
        this.postedOn = postedOn;
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
