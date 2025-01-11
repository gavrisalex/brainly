package com.example.QA.exceptions.user;

public class NameAlreadyExistsException extends RuntimeException {
    public NameAlreadyExistsException(String message) {
        super(message);
    }
}