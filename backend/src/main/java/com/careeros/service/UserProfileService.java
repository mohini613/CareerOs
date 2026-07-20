package com.careeros.service;

import com.careeros.dto.UserProfileRequest;
import com.careeros.dto.UserProfileResponse;
import com.careeros.dto.ExtractedProfileDTO;
import com.careeros.dto.ExtractedSkillDTO;
import com.careeros.model.User;
import com.careeros.model.UserProfile;
import com.careeros.model.Skill;
import com.careeros.model.UserSkill;
import com.careeros.repository.UserRepository;
import com.careeros.repository.SkillRepository;
import com.careeros.repository.UserSkillRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserProfileService {

    private final UserRepository userRepository;
    private final AIAnalyzerService aiAnalyzerService;
    private final SkillRepository skillRepository;
    private final UserSkillRepository userSkillRepository;

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

    @Transactional
    public UserProfileResponse autofillFromResume(Long userId, Long resumeId) {
        // 1. Call AIAnalyzerService to extract profile data
        ExtractedProfileDTO extracted;
        try {
            extracted = aiAnalyzerService.extractProfileFromResume(userId, resumeId);
        } catch (Exception e) {
            throw new RuntimeException("Failed to extract profile details from resume: " + e.getMessage(), e);
        }

        // 2. Fetch User and update/create UserProfile
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        UserProfile profile = user.getProfile();
        if (profile == null) {
            profile = new UserProfile();
            profile.setUser(user);
            user.setProfile(profile);
        }
        
        if (extracted.getCurrentTitle() != null) {
            profile.setCurrentTitle(extracted.getCurrentTitle());
        }
        if (extracted.getCurrentCompany() != null) {
            profile.setCurrentCompany(extracted.getCurrentCompany());
        }
        if (extracted.getYearsOfExperience() != null) {
            profile.setYearsOfExperience(extracted.getYearsOfExperience());
        }
        if (extracted.getIndustry() != null) {
            profile.setIndustry(extracted.getIndustry());
        }
        if (extracted.getEducationLevel() != null) {
            profile.setEducationLevel(extracted.getEducationLevel());
        }
        if (extracted.getLocation() != null) {
            profile.setLocation(extracted.getLocation());
        }
        if (extracted.getBio() != null) {
            profile.setBio(extracted.getBio());
        }
        if (extracted.getLinkedinUrl() != null && !extracted.getLinkedinUrl().isEmpty()) {
            profile.setLinkedinUrl(extracted.getLinkedinUrl());
        }
        if (extracted.getGithubUrl() != null && !extracted.getGithubUrl().isEmpty()) {
            profile.setGithubUrl(extracted.getGithubUrl());
        }
        if (extracted.getPortfolioUrl() != null && !extracted.getPortfolioUrl().isEmpty()) {
            profile.setPortfolioUrl(extracted.getPortfolioUrl());
        }
        userRepository.save(user);

        // 3. Process skills
        if (extracted.getSkills() != null) {
            for (ExtractedSkillDTO extractedSkill : extracted.getSkills()) {
                if (extractedSkill.getName() == null || extractedSkill.getName().trim().isEmpty()) {
                    continue;
                }
                String skillName = extractedSkill.getName().trim();
                // Find or create skill in skills library (case-insensitive name check)
                Skill skill = skillRepository.findByNameIgnoreCase(skillName)
                        .orElseGet(() -> {
                            Skill newSkill = new Skill();
                            newSkill.setName(skillName);
                            newSkill.setCategory(extractedSkill.getCategory() != null ? extractedSkill.getCategory() : "Technical");
                            return skillRepository.save(newSkill);
                        });

                // Check if user already has this skill
                if (!userSkillRepository.existsByUserIdAndSkillId(userId, skill.getId())) {
                    UserSkill userSkill = new UserSkill();
                    userSkill.setUser(user);
                    userSkill.setSkill(skill);
                    
                    // Validate and set proficiency level
                    String proficiency = extractedSkill.getProficiencyLevel();
                    if (proficiency == null || 
                        (!proficiency.equals("Begginer") && 
                         !proficiency.equals("Intermediate") && 
                         !proficiency.equals("Advanced") && 
                         !proficiency.equals("Expert"))) {
                        proficiency = "Intermediate"; // default
                    }
                    userSkill.setProficiencyLevel(proficiency);
                    userSkill.setYearsOfExperience(extracted.getYearsOfExperience() != null ? extracted.getYearsOfExperience() : java.math.BigDecimal.ONE);
                    userSkill.setIsPrimary(false);
                    userSkill.setEndorsementCount(0);
                    
                    userSkillRepository.save(userSkill);
                }
            }
        }

        return mapToResponse(user.getProfile());
    }
}