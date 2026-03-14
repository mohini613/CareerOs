package com.careeros.service;

import com.careeros.dto.UserProfileRequest;
import com.careeros.dto.UserProfileResponse;
import com.careeros.model.User;
import com.careeros.model.UserProfile;
import com.careeros.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserProfileService {

    private final UserRepository userRepository;

    @Transactional
    public UserProfileResponse createOrUpdateProfile(Long userId, UserProfileRequest request) {
        if (userId == null) {
            throw new RuntimeException("User ID cannot be null");
        }
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        UserProfile profile = user.getProfile();
        
        if (profile == null) {
            profile = new UserProfile();
            profile.setUser(user);
            user.setProfile(profile);
        }
        
        updateProfileFields(profile, request);
        
        User savedUser = userRepository.save(user);
        
        return mapToResponse(savedUser.getProfile());
    }

    @Transactional(readOnly = true)
    public UserProfileResponse getProfile(Long userId) {
        if (userId == null) {
            throw new RuntimeException("User ID cannot be null");
        }
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (user.getProfile() == null) {
            throw new RuntimeException("Profile not found");
        }
        
        return mapToResponse(user.getProfile());
    }

    private void updateProfileFields(UserProfile profile, UserProfileRequest request) {
        profile.setCurrentTitle(request.getCurrentTitle());
        profile.setCurrentCompany(request.getCurrentCompany());
        profile.setYearsOfExperience(request.getYearsOfExperience());
        profile.setIndustry(request.getIndustry());
        profile.setEducationLevel(request.getEducationLevel());
        profile.setLocation(request.getLocation());
        profile.setBio(request.getBio());
        profile.setLinkedinUrl(request.getLinkdinUrl());
        profile.setGithubUrl(request.getGithubUrl());
        profile.setPortfolioUrl(request.getPortfolioUrl());
    }

    private UserProfileResponse mapToResponse(UserProfile profile) {
        return new UserProfileResponse(
            profile.getId(),
            profile.getUser().getId(),
            profile.getCurrentTitle(),
            profile.getCurrentCompany(),
            profile.getYearsOfExperience(),
            profile.getIndustry(),
            profile.getEducationLevel(),
            profile.getLocation(),
            profile.getBio(),
            profile.getLinkedinUrl(),
            profile.getGithubUrl(),
            profile.getPortfolioUrl()
        );
    }
}