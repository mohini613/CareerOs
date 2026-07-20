package com.careeros.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class ResumeStatsResponse {
    private long totalAnalyses;
    private double averageMatchScore;
    private BestMatch bestMatch;
    private List<Integer> improvementOverTime;

    @Data
    @Builder
    public static class BestMatch {
        private String company;
        private int score;
    }
}
