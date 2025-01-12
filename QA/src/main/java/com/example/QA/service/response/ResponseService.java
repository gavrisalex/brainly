package com.example.QA.service.response;

import com.example.QA.model.Response;
import com.example.QA.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface ResponseService {
    Response addResponse(Response response);

    Page<Response> findAll(Pageable pageable);

    Response markAsSolution(int responseId, User user);

    Response findById(int id);

    List<Response> findByUserId(int userId);
}
