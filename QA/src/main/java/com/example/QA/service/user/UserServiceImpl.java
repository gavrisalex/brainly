package com.example.QA.service.user;

import com.example.QA.exceptions.user.EmailAlreadyExistsException;
import com.example.QA.exceptions.user.NameAlreadyExistsException;
import com.example.QA.model.User;
import com.example.QA.repository.UserRepository;
import com.example.QA.service.jwt.JWTService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserServiceImpl implements UserService{

    @Autowired
    private UserRepository userRepository;

    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    JWTService jwtService;

    private BCryptPasswordEncoder encoder=new BCryptPasswordEncoder(12);
    @Override
    public User saveUser(User user) {

        if(userRepository.existsByEmail(user.getEmail()))
            throw new EmailAlreadyExistsException("Email already exists!");

        if(userRepository.existsByName(user.getName()))
            throw new NameAlreadyExistsException("Name already exists!");

        user.setPassword(encoder.encode(user.getPassword()));
        return userRepository.save(user);
    }

    @Override
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Override
    public String verify(User user) {
        Authentication authentication=authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(user.getName(),user.getPassword()));
        if(authentication.isAuthenticated())
            return jwtService.generateToken(user.getName());

        return "User not logged in!";
    }

}
