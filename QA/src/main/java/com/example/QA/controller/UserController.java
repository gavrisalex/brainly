package com.example.QA.controller;

import com.example.QA.controller.common.ApiResponse;
import com.example.QA.exceptions.user.EmailAlreadyExistsException;
import com.example.QA.exceptions.user.NameAlreadyExistsException;
import com.example.QA.model.User;
import com.example.QA.service.MyUserDetailsService;
import com.example.QA.service.user.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/user")
@CrossOrigin
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private MyUserDetailsService userDetailsService;

    @PostMapping("/add")
    public ApiResponse<String> add(@RequestBody User user) {

        try {

            userService.saveUser(user);
            return new ApiResponse<>(true, "New user added", null);
        } catch (EmailAlreadyExistsException | NameAlreadyExistsException e) {
            return new ApiResponse<>(false, null, e.getMessage());
        }
    }

    @PostMapping("/login")
    public ApiResponse<String> login(@RequestBody User user) {
        try {
            String token = userService.verify(user);
            return new ApiResponse<>(true, token, null);
        } catch (Exception e) {
            return new ApiResponse<>(false, null, e.getMessage());
        }
    }

    @GetMapping("/getAll")
    public List<User> getAllUsers() {
        return userService.getAllUsers();
    }

    @PostMapping("/assignRole")
    public ApiResponse<String> assignRole(
            @RequestHeader("Authorization") String token,
            @RequestParam int userId,
            @RequestParam User.Role role) {
        try {
            // First verify if the requesting user is an admin
            if (!userDetailsService.isAdmin(token)) {
                return new ApiResponse<>(false, null, "Unauthorized: Only administrators can assign roles");
            }

            userService.assignRole(userId, role);
            return new ApiResponse<>(true, "Role assigned successfully", null);
        } catch (Exception e) {
            return new ApiResponse<>(false, null, e.getMessage());
        }
    }

    @PostMapping("/test")
    public String test() {
        return "TEST SUCCESS";
    }

}
