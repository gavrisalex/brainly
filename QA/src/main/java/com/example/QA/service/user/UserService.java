package com.example.QA.service.user;

import com.example.QA.model.User;

import java.util.List;

public interface UserService {
    public User saveUser(User user);

    public List<User> getAllUsers();

    public String verify(User user);

    void assignRole(int userId, User.Role role);



}
