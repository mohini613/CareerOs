package com.careeros.controller;

import com.careeros.dto.CoverLetterRequest;
import com.careeros.dto.ResumeStatsResponse;
import com.careeros.model.AnalysisResult;
import com.careeros.repository.AnalysisResultRepository;
import com.careeros.security.CustomUserDetailsService;
import com.careeros.service.AIAnalyzerService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/resumes")
@RequiredArgsConstructor
public class ResumeAnalysisController {

    private final AIAnalyzerService aiAnalyzerService;
    private final AnalysisResultRepository analysisResultRepository;

    private Long getUserId(Authentication authentication) {
        CustomUserDetailsService.CustomUserDetails userDetails =
                (CustomUserDetailsService.CustomUserDetails) authentication.getPrincipal();
        return userDetails.getUserId();
    }

    @PostMapping("/{resumeId}/analyze")
    public ResponseEntity<?> analyzeResume(
            Authentication authentication,
            @PathVariable Long resumeId,
            @RequestBody AnalyzeRequest request) {
        try {
            Long userId = getUserId(authentication);
            AnalysisResult result = aiAnalyzerService.analyzeResume(
                    userId,
                    resumeId,
                    request.getJobDescription(),
                    request.getJobTitle(),
                    request.getCompanyName()
            );
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{resumeId}/cover-letter")
    public ResponseEntity<?> generateCoverLetter(
            Authentication authentication,
            @PathVariable Long resumeId,
            @RequestBody CoverLetterRequest request) {
        try {
            Long userId = getUserId(authentication);
            String coverLetter = aiAnalyzerService.generateCoverLetter(
                    userId,
                    resumeId,
                    request.getJobDescription(),
                    request.getJobTitle(),
                    request.getCompanyName(),
                    request.getTone()
            );
            return ResponseEntity.ok(Map.of("coverLetter", coverLetter));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{resumeId}/stats")
    public ResponseEntity<ResumeStatsResponse> getResumeStats(
            Authentication authentication,
            @PathVariable Long resumeId) {
        Long userId = getUserId(authentication);
        List<AnalysisResult> analyses = analysisResultRepository.findByResumeIdAndUserIdOrderByCreatedAtDesc(resumeId, userId);

        if (analyses.isEmpty()) {
            return ResponseEntity.ok(ResumeStatsResponse.builder().totalAnalyses(0).build());
        }

        double avgScore = analyses.stream()
                .mapToInt(AnalysisResult::getMatchScore)
                .average()
                .orElse(0.0);

        AnalysisResult best = analyses.stream()
                .max(Comparator.comparingInt(AnalysisResult::getMatchScore))
                .orElse(null);

        List<Integer> improvement = analyses.stream()
                .sorted(Comparator.comparing(AnalysisResult::getCreatedAt))
                .map(AnalysisResult::getMatchScore)
                .collect(Collectors.toList());

        return ResponseEntity.ok(ResumeStatsResponse.builder()
                .totalAnalyses(analyses.size())
                .averageMatchScore(Math.round(avgScore * 10.0) / 10.0)
                .bestMatch(best != null ? ResumeStatsResponse.BestMatch.builder()
                        .company(best.getCompanyName())
                        .score(best.getMatchScore())
                        .build() : null)
                .improvementOverTime(improvement)
                .build());
    }

    @GetMapping("/{resumeId}/analysis")
    public ResponseEntity<List<AnalysisResult>> getAnalysisHistory(
            Authentication authentication,
            @PathVariable Long resumeId) {
        Long userId = getUserId(authentication);
        return ResponseEntity.ok(
                analysisResultRepository.findByResumeIdAndUserIdOrderByCreatedAtDesc(resumeId, userId)
        );
    }

    @GetMapping("/analysis/all")
    public ResponseEntity<List<AnalysisResult>> getAllAnalysis(Authentication authentication) {
        Long userId = getUserId(authentication);
        return ResponseEntity.ok(
                analysisResultRepository.findByUserIdOrderByCreatedAtDesc(userId)
        );
    }

    @Data
    static class AnalyzeRequest {
        private String jobDescription;
        private String jobTitle;
        private String companyName;
    }
}