package com.careeros.controller;

import com.careeros.dto.CareerGoalRequest;
import com.careeros.dto.CareerGoalResponse;
import com.careeros.dto.UpdateGoalProgressRequest;
import com.careeros.service.CareerGoalService;
import com.careeros.util.JwtUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/goals")
@RequiredArgsConstructor
public class CareerGoalController {

    private final CareerGoalService careerGoalService;
    private final JwtUtil jwtUtil;

    @GetMapping
    public ResponseEntity<List<CareerGoalResponse>> getMyGoals(
            @RequestHeader("Authorization") String authHeader
    ) {
        Long userId = getUserIdFromToken(authHeader);
        return ResponseEntity.ok(careerGoalService.getUserGoals(userId));
    }

    @GetMapping("/active")
    public ResponseEntity<List<CareerGoalResponse>> getActiveGoals(
            @RequestHeader("Authorization") String authHeader
    ) {
        Long userId = getUserIdFromToken(authHeader);
        return ResponseEntity.ok(careerGoalService.getActiveGoals(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CareerGoalResponse> getGoal(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long id
    ) {
        Long userId = getUserIdFromToken(authHeader);
        return ResponseEntity.ok(careerGoalService.getGoalById(userId, id));
    }

    @PostMapping
    public ResponseEntity<CareerGoalResponse> createGoal(
            @RequestHeader("Authorization") String authHeader,
            @Valid @RequestBody CareerGoalRequest request
    ) {
        Long userId = getUserIdFromToken(authHeader);
        return ResponseEntity.ok(careerGoalService.createGoal(userId, request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CareerGoalResponse> updateGoal(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long id,
            @Valid @RequestBody CareerGoalRequest request
    ) {
        Long userId = getUserIdFromToken(authHeader);
        return ResponseEntity.ok(careerGoalService.updateGoal(userId, id, request));
    }

    @PatchMapping("/{id}/progress")
    public ResponseEntity<CareerGoalResponse> updateProgress(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long id,
            @Valid @RequestBody UpdateGoalProgressRequest request
    ) {
        Long userId = getUserIdFromToken(authHeader);
        return ResponseEntity.ok(careerGoalService.updateProgress(userId, id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteGoal(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long id
    ) {
        Long userId = getUserIdFromToken(authHeader);
        careerGoalService.deleteGoal(userId, id);
        return ResponseEntity.noContent().build();
    }

    private Long getUserIdFromToken(String authHeader) {
        String token = authHeader.substring(7);
        return jwtUtil.getUserIdFromToken(token);
    }
}
