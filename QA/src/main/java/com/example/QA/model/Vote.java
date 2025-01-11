package com.example.QA.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;

@Entity
public class Vote {

    @Id
    private int vote_id;

    @ManyToOne
    @JoinColumn(name = "response_id", nullable = false)
    private Response response;

    @ManyToOne
    @JoinColumn(name = "id", nullable = false)
    private User user;

    enum TypeOfVote{
        LIKE,
        DISLIKE
    }

    private TypeOfVote typeOfVote;

    public int getVote_id() {
        return vote_id;
    }

    public void setVote_id(int vote_id) {
        this.vote_id = vote_id;
    }

    public Response getResponse() {
        return response;
    }

    public void setResponse(Response response) {
        this.response = response;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public TypeOfVote getTypeOfVote() {
        return typeOfVote;
    }

    public void setTypeOfVote(TypeOfVote typeOfVote) {
        this.typeOfVote = typeOfVote;
    }
}
