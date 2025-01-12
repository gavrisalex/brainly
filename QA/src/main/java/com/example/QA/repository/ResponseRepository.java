package com.example.QA.repository;

import com.example.QA.model.Response;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ResponseRepository extends JpaRepository<Response, Integer> {
    List<Response> findByUserId(int userId);
}
