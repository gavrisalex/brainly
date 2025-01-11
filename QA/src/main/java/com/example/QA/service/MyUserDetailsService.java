package com.example.QA.service;

import com.example.QA.model.User;
import com.example.QA.model.UserPrincipal;
import com.example.QA.repository.UserRepository;
import com.example.QA.service.jwt.JWTService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class MyUserDetailsService implements UserDetailsService {

    @Autowired
    UserRepository userRepository;
    @Autowired
    JWTService jwtService;
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {

        User user= userRepository.findByName(username);

        if (user == null) {
            System.out.println("User Not Found");
            throw new UsernameNotFoundException("user not found");
        }

        return new UserPrincipal(user);

    }
    public boolean isAdmin(String token) {
        // Decode the token to get the user
        User user = getUserFromToken(token);
        // Check if the user has ADMIN role
        return user != null && user.getRole() == User.Role.ADMIN;
    }

    public User getUserFromToken(String token) {
        // Remove "Bearer " if present
        String actualToken = token.startsWith("Bearer ") ? token.substring(7) : token;
        // Use your JWT service or token service to decode and get the user
        return userRepository.findByName(jwtService.extractUserName(actualToken));
    }
}
