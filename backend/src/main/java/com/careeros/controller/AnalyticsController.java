package com.careeros.controller;

import com.careeros.dto.DashboardResponse;
import com.careeros.security.CustomUserDetailsService;
import com.careeros.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardResponse> getDashboard(Authentication authentication) {
        Long userId = ((CustomUserDetailsService.CustomUserDetails) authentication.getPrincipal()).getUserId();
        return ResponseEntity.ok(analyticsService.getDashboardStats(userId));
    }
}
