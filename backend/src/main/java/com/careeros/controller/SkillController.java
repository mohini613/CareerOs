package com.careeros.controller;

import com.careeros.dto.SkillResponse;
import com.careeros.dto.UserSkillRequest;
import com.careeros.dto.UserSkillResponse;
import com.careeros.service.SkillService;
import com.careeros.util.JwtUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/skills")
@RequiredArgsConstructor
public class SkillController {

    private final SkillService skillService;
    private final JwtUtil jwtUtil;

    @GetMapping
    public ResponseEntity<List<SkillResponse>> getAllSkills() {
        return ResponseEntity.ok(skillService.getAllSkills());
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<List<SkillResponse>> getSkillsByCategory(@PathVariable String category) {
        return ResponseEntity.ok(skillService.getSkillsByCategory(category));
    }

    @GetMapping("/my-skills")
    public ResponseEntity<List<UserSkillResponse>> getMySkills(
            @RequestHeader("Authorization") String authHeader
    ) {
        Long userId = getUserIdFromToken(authHeader);
        return ResponseEntity.ok(skillService.getUserSkills(userId));
    }

    @PostMapping("/my-skills")
    public ResponseEntity<UserSkillResponse> addSkill(
            @RequestHeader("Authorization") String authHeader,
            @Valid @RequestBody UserSkillRequest request
    ) {
        Long userId = getUserIdFromToken(authHeader);
        return ResponseEntity.ok(skillService.addSkillToUser(userId, request));
    }

    @PutMapping("/my-skills/{id}")
    public ResponseEntity<UserSkillResponse> updateSkill(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long id,
            @Valid @RequestBody UserSkillRequest request
    ) {
        Long userId = getUserIdFromToken(authHeader);
        return ResponseEntity.ok(skillService.updateUserSkill(userId, id, request));
    }

    @DeleteMapping("/my-skills/{id}")
    public ResponseEntity<Void> deleteSkill(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long id
    ) {
        Long userId = getUserIdFromToken(authHeader);
        skillService.deleteUserSkill(userId, id);
        return ResponseEntity.noContent().build();
    }

    private Long getUserIdFromToken(String authHeader) {
        String token = authHeader.substring(7);
        return jwtUtil.getUserIdFromToken(token);
    }
}