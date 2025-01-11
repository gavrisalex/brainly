package com.example.QA.controller;

import com.example.QA.controller.common.ApiResponse;
import com.example.QA.exceptions.user.EmailAlreadyExistsException;
import com.example.QA.exceptions.user.NameAlreadyExistsException;
import com.example.QA.model.User;
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

    @PostMapping("/add")
    public ApiResponse<String> add(@RequestBody User user){

        try{
            userService.saveUser(user);
            return new ApiResponse<>(true, "New user added", null);
        }
        catch(EmailAlreadyExistsException | NameAlreadyExistsException e)
        {
            return new ApiResponse<>(false, null, e.getMessage());
        }
    }
    @PostMapping("/login")
    public String login(@RequestBody User user)
    {


        return userService.verify(user);
    }
    @GetMapping("/getAll")
    public List<User> getAllUsers()
    {
        return userService.getAllUsers();
    }


}
