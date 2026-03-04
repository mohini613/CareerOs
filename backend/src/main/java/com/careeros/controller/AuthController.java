package com.careeros.controller;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.careeros.dto.AuthResponse;
import com.careeros.dto.LoginRequest;
import com.careeros.dto.RegisterRequest;
import com.careeros.service.AuthService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor



public class AuthController {
    
    private final AuthService authService;
@PostMapping("/register")
public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
    System.out.println("========== REGISTER ENDPOINT HIT ==========");
    System.out.println("Email: " + request.getEmail());
    AuthResponse response = authService.register(request);
    return ResponseEntity.ok(response);
}

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request){
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);

    }


    }

