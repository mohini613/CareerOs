package com.careeros.dto;

import lombok.Builder;
import lombok.Data;

import java.util.Map;
import java.util.List;

@Data
@Builder
public class DashboardResponse {
    private long totalApplications;
    private Map<String, Long> applicationsByStatus;
    private double responseRate;
    private String averageTimeToResponse;
    private List<String> topCompanies;
    private Map<String, Long> applicationsByMonth;
    private GoalsProgress goalsProgress;

    @Data
    @Builder
    public static class GoalsProgress {
        private long completed;
        private long inProgress;
    }
}
