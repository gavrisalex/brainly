package com.example.QA.dto;

import com.example.QA.model.User;

public class UserDTO {
    private int id;
    private String name;
    private String email;
    private User.Role role;
    private int credibility;

    public UserDTO(int id, String name, String email, User.Role role, int credibility) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.role = role;
        this.credibility = credibility;
    }

    // Getters
    public int getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }

    public User.Role getRole() {
        return role;
    }

    public int getCredibility() {
        return credibility;
    }
}