package com.example.QA.repository;

import com.example.QA.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<User,Integer> {
    boolean existsByName(String name);
    boolean existsByEmail(String email);

    User findByName(String name);
}
