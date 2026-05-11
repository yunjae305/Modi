package com.modi.common;

import io.jsonwebtoken.JwtException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class ErrorResponseAdvice {

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiResponse<Object>> handleBadRequest(IllegalArgumentException exception) {
        return ResponseEntity.badRequest().body(ApiResponse.fail(exception.getMessage()));
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<ApiResponse<Object>> handleState(IllegalStateException exception) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(ApiResponse.fail(exception.getMessage()));
    }

    @ExceptionHandler(JwtException.class)
    public ResponseEntity<ApiResponse<Object>> handleJwt(JwtException exception) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.fail("로그인이 필요합니다."));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Object>> handleValidation(MethodArgumentNotValidException exception) {
        String message = exception.getBindingResult().getFieldErrors().stream()
            .findFirst()
            .map(error -> error.getField() + " " + error.getDefaultMessage())
            .orElse("요청 값이 올바르지 않습니다.");
        return ResponseEntity.badRequest().body(ApiResponse.fail(message));
    }
}
