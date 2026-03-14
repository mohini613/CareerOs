package com.careeros.controller;

import com.careeros.dto.UserResponse;
import com.careeros.dto.UserProfileResponse;
import com.careeros.model.User;
import com.careeros.repository.UserRepository;
import com.careeros.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser(
            @RequestHeader("Authorization") String authHeader
    ) {
        String token = authHeader.substring(7);
        Long userId = jwtUtil.getUserIdFromToken(token);
        
        if (userId == null) {
            throw new RuntimeException("Invalid token");
        }
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        UserResponse response = new UserResponse();
        response.setId(user.getId());
        response.setEmail(user.getEmail());
        response.setFirstName(user.getFirstName());
        response.setLastName(user.getLastName());
        response.setActive(user.isActive());
        response.setEmailVerified(user.isEmailVerified());
        
        if (user.getProfile() != null) {
            UserProfileResponse profileResponse = new UserProfileResponse(
                user.getProfile().getId(),
                user.getId(),
                user.getProfile().getCurrentTitle(),
                user.getProfile().getCurrentCompany(),
                user.getProfile().getYearsOfExperience(),
                user.getProfile().getIndustry(),
                user.getProfile().getEducationLevel(),
                user.getProfile().getLocation(),
                user.getProfile().getBio(),
                user.getProfile().getLinkedinUrl(),
                user.getProfile().getGithubUrl(),
                user.getProfile().getPortfolioUrl()
            );
            response.setProfile(profileResponse);
        }
        
        return ResponseEntity.ok(response);
    }
}