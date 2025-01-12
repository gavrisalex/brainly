package com.example.QA.model;

import jakarta.persistence.*;

import java.util.Date;

@Entity
public class Response {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int response_id;

    @ManyToOne
    @JoinColumn(name = "question_id", nullable = false)
    private Question question;

    @ManyToOne
    @JoinColumn(name = "id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String content;

    private Date postedOn;

    private int nrOfVotes;

    public enum Solution {
        NO,
        YES
    }

    private Solution solution;

    @Transient
    private Vote.TypeOfVote userVote;

    public int getResponse_id() {
        return response_id;
    }

    public void setResponse_id(int response_id) {
        this.response_id = response_id;
    }

    public Question getQuestion() {
        return question;
    }

    public void setQuestion(Question question) {
        this.question = question;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
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

    public int getNrOfVotes() {
        return nrOfVotes;
    }

    public void setNrOfVotes(int nrOfVotes) {
        this.nrOfVotes = nrOfVotes;
    }

    public Solution getSolution() {
        return solution;
    }

    public void setSolution(Solution solution) {
        this.solution = solution;
    }

    public Vote.TypeOfVote getUserVote() {
        return userVote;
    }

    public void setUserVote(Vote.TypeOfVote userVote) {
        this.userVote = userVote;
    }
}
