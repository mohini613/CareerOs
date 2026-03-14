
package com.careeros.service;

import com.careeros.dto.CareerGoalRequest;
import com.careeros.dto.CareerGoalResponse;
import com.careeros.dto.UpdateGoalProgressRequest;
import com.careeros.model.CareerGoal;
import com.careeros.model.User;
import com.careeros.repository.CareerGoalRepository;
import com.careeros.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CareerGoalService {

    private final CareerGoalRepository careerGoalRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<CareerGoalResponse> getUserGoals(Long userId) {
        return careerGoalRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<CareerGoalResponse> getActiveGoals(Long userId) {
        return careerGoalRepository.findByUserIdAndStatus(userId, "active").stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CareerGoalResponse getGoalById(Long userId, Long goalId) {
        CareerGoal goal = careerGoalRepository.findById(goalId)
                .orElseThrow(() -> new RuntimeException("Goal not found"));
        
        if (!goal.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }
        
        return mapToResponse(goal);
    }

    @Transactional
    public CareerGoalResponse createGoal(Long userId, CareerGoalRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        CareerGoal goal = new CareerGoal();
        goal.setUser(user);
        updateGoalFromRequest(goal, request);
        goal.setStatus("active");
        goal.setProgressPercentage(0);

        CareerGoal saved = careerGoalRepository.save(goal);
        return mapToResponse(saved);
    }

    @Transactional
    public CareerGoalResponse updateGoal(Long userId, Long goalId, CareerGoalRequest request) {
        CareerGoal goal = careerGoalRepository.findById(goalId)
                .orElseThrow(() -> new RuntimeException("Goal not found"));

        if (!goal.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }

        updateGoalFromRequest(goal, request);
        CareerGoal updated = careerGoalRepository.save(goal);
        return mapToResponse(updated);
    }

    @Transactional
    public CareerGoalResponse updateProgress(Long userId, Long goalId, UpdateGoalProgressRequest request) {
        CareerGoal goal = careerGoalRepository.findById(goalId)
                .orElseThrow(() -> new RuntimeException("Goal not found"));

        if (!goal.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }

        goal.setProgressPercentage(request.getProgressPercentage());
        
        // Auto-complete goal if progress reaches 100%
        if (request.getProgressPercentage() == 100 && !"completed".equals(goal.getStatus())) {
            goal.setStatus("completed");
        }

        CareerGoal updated = careerGoalRepository.save(goal);
        return mapToResponse(updated);
    }

    @Transactional
    public void deleteGoal(Long userId, Long goalId) {
        CareerGoal goal = careerGoalRepository.findById(goalId)
                .orElseThrow(() -> new RuntimeException("Goal not found"));

        if (!goal.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }

        careerGoalRepository.delete(goal);
    }

    private void updateGoalFromRequest(CareerGoal goal, CareerGoalRequest request) {
        goal.setGoalType(request.getGoalType());
        goal.setTargetRole(request.getTargetRole());
        goal.setTargetCompany(request.getTargetCompany());
        goal.setTargetIndustry(request.getTargetIndustry());
        goal.setTargetSalaryMin(request.getTargetSalaryMin());
        goal.setTargetSalaryMax(request.getTargetSalaryMax());
        goal.setTargetDate(request.getTargetDate());
        goal.setDescription(request.getDescription());
    }

    private CareerGoalResponse mapToResponse(CareerGoal goal) {
        return new CareerGoalResponse(
            goal.getId(),
            goal.getUser().getId(),
            goal.getGoalType(),
            goal.getTargetRole(),
            goal.getTargetCompany(),
            goal.getTargetIndustry(),
            goal.getTargetSalaryMin(),
            goal.getTargetSalaryMax(),
            goal.getTargetDate(),
            goal.getDescription(),
            goal.getStatus(),
            goal.getProgressPercentage(),
            goal.getCreatedAt(),
            goal.getUpdatedAt()
        );
    }
}
