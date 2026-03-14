package com.careeros.service;

import com.careeros.dto.SkillResponse;
import com.careeros.dto.UserSkillRequest;
import com.careeros.dto.UserSkillResponse;
import com.careeros.model.Skill;
import com.careeros.model.User;
import com.careeros.model.UserSkill;
import com.careeros.repository.SkillRepository;
import com.careeros.repository.UserRepository;
import com.careeros.repository.UserSkillRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SkillService {

    private final SkillRepository skillRepository;
    private final UserSkillRepository userSkillRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<SkillResponse> getAllSkills() {
        return skillRepository.findAll().stream()
                .map(this::mapSkillToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<SkillResponse> getSkillsByCategory(String category) {
        return skillRepository.findByCategoryOrderByNameAsc(category).stream()
                .map(this::mapSkillToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<UserSkillResponse> getUserSkills(Long userId) {
        return userSkillRepository.findByUserId(userId).stream()
                .map(this::mapUserSkillToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public UserSkillResponse addSkillToUser(Long userId, UserSkillRequest request) {
        // Check if user already has this skill
        if (userSkillRepository.existsByUserIdAndSkillId(userId, request.getSkillId())) {
            throw new RuntimeException("User already has this skill");
        }

        if (userId == null) {
            throw new RuntimeException("User ID cannot be null");
        }
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Long skillId = request.getSkillId();
        if (skillId == null) {
            throw new RuntimeException("Skill ID cannot be null");
        }
        Skill skill = skillRepository.findById(skillId)
                .orElseThrow(() -> new RuntimeException("Skill not found"));

        UserSkill userSkill = new UserSkill();
        userSkill.setUser(user);
        userSkill.setSkill(skill);
        userSkill.setProficiencyLevel(request.getProficiencyLevel());
        userSkill.setYearsOfExperience(request.getYearsOfExperience());
        userSkill.setLastUsedDate(request.getLastUsedDate());
        userSkill.setIsPrimary(request.getIsPrimary());
        userSkill.setEndorsementCount(0);

        UserSkill saved = userSkillRepository.save(userSkill);
        return mapUserSkillToResponse(saved);
    }

    @Transactional
    public UserSkillResponse updateUserSkill(Long userId, Long userSkillId, UserSkillRequest request) {
        if (userSkillId == null) {
            throw new RuntimeException("User skill ID cannot be null");
        }
        UserSkill userSkill = userSkillRepository.findById(userSkillId)
                .orElseThrow(() -> new RuntimeException("User skill not found"));

        if (!userSkill.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }

        userSkill.setProficiencyLevel(request.getProficiencyLevel());
        userSkill.setYearsOfExperience(request.getYearsOfExperience());
        userSkill.setLastUsedDate(request.getLastUsedDate());
        userSkill.setIsPrimary(request.getIsPrimary());

        UserSkill updated = userSkillRepository.save(userSkill);
        return mapUserSkillToResponse(updated);
    }

    @Transactional
    public void deleteUserSkill(Long userId, Long userSkillId) {
        UserSkill userSkill = userSkillRepository.findById(userSkillId)
                .orElseThrow(() -> new RuntimeException("User skill not found"));

        if (!userSkill.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }

        userSkillRepository.delete(userSkill);
    }

    private SkillResponse mapSkillToResponse(Skill skill) {
        return new SkillResponse(
            skill.getId(),
            skill.getName(),
            skill.getCategory(),
            skill.getSubcategory()
        );
    }

    private UserSkillResponse mapUserSkillToResponse(UserSkill userSkill) {
        SkillResponse skillResponse = mapSkillToResponse(userSkill.getSkill());
        
        return new UserSkillResponse(
            userSkill.getId(),
            userSkill.getUser().getId(),
            skillResponse,
            userSkill.getProficiencyLevel(),
            userSkill.getYearsOfExperience(),
            userSkill.getLastUsedDate(),
            userSkill.getIsPrimary(),
            userSkill.getEndorsementCount()
        );
    }
}