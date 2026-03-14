package com.careeros.controller;

import com.careeros.dto.UserProfileRequest;
import com.careeros.dto.UserProfileResponse;
import com.careeros.service.UserProfileService;
import com.careeros.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class UserProfileController {

    private final UserProfileService userProfileService;
    private final JwtUtil jwtUtil;

    @GetMapping
    public ResponseEntity<UserProfileResponse> getMyProfile(
            @RequestHeader("Authorization") String authHeader
    ) {
        Long userId = getUserIdFromToken(authHeader);
        UserProfileResponse profile = userProfileService.getProfile(userId);
        return ResponseEntity.ok(profile);
    }

    @PostMapping
    public ResponseEntity<UserProfileResponse> createOrUpdateProfile(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody UserProfileRequest request
    ) {
        Long userId = getUserIdFromToken(authHeader);
        UserProfileResponse profile = userProfileService.createOrUpdateProfile(userId, request);
        return ResponseEntity.ok(profile);
    }

    private Long getUserIdFromToken(String authHeader) {
        String token = authHeader.substring(7);
        return jwtUtil.getUserIdFromToken(token);
    }
}