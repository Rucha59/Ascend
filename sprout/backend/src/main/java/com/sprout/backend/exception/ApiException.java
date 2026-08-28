package com.sprout.backend.exception;

import org.springframework.http.HttpStatus;

/** Thrown deliberately by service code for expected failure cases (duplicate email, bad login, etc). */
public class ApiException extends RuntimeException {

    private final HttpStatus status;

    public ApiException(HttpStatus status, String message) {
        super(message);
        this.status = status;
    }

    public HttpStatus getStatus() {
        return status;
    }
}
