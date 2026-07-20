package com.careeros.service;

import com.careeros.dto.DashboardResponse;
import com.careeros.model.JobApplication;
import com.careeros.repository.CareerGoalRepository;
import com.careeros.repository.JobApplicationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.format.TextStyle;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final JobApplicationRepository jobApplicationRepository;
    private final CareerGoalRepository careerGoalRepository;

    public DashboardResponse getDashboardStats(Long userId) {
        List<JobApplication> applications = jobApplicationRepository.findByUserIdOrderByApplicationDateDesc(userId);
        
        long total = applications.size();
        
        Map<String, Long> byStatus = applications.stream()
                .collect(Collectors.groupingBy(JobApplication::getStatus, Collectors.counting()));
        
        long responses = applications.stream()
                .filter(app -> List.of("interviewing", "offered", "rejected").contains(app.getStatus().toLowerCase()))
                .count();
        
        double responseRate = total > 0 ? (double) responses / total * 100 : 0;
        
        List<String> topCompanies = applications.stream()
                .collect(Collectors.groupingBy(JobApplication::getCompanyName, Collectors.counting()))
                .entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .limit(5)
                .map(Map.Entry::getKey)
                .collect(Collectors.toList());

        Map<String, Long> byMonth = applications.stream()
                .collect(Collectors.groupingBy(app -> 
                    app.getApplicationDate().getMonth().getDisplayName(TextStyle.SHORT, Locale.ENGLISH),
                    Collectors.counting()));

        long completedGoals = careerGoalRepository.findByUserId(userId).stream()
                .filter(goal -> "completed".equalsIgnoreCase(goal.getStatus()) || (goal.getProgressPercentage() != null && goal.getProgressPercentage() == 100))
                .count();
        
        long inProgressGoals = careerGoalRepository.findByUserId(userId).stream()
                .filter(goal -> "active".equalsIgnoreCase(goal.getStatus()) && (goal.getProgressPercentage() == null || goal.getProgressPercentage() < 100))
                .count();

        return DashboardResponse.builder()
                .totalApplications(total)
                .applicationsByStatus(byStatus)
                .responseRate(Math.round(responseRate * 10.0) / 10.0)
                .averageTimeToResponse("12 days") // Mocked for now
                .topCompanies(topCompanies)
                .applicationsByMonth(byMonth)
                .goalsProgress(DashboardResponse.GoalsProgress.builder()
                        .completed(completedGoals)
                        .inProgress(inProgressGoals)
                        .build())
                .build();
    }
}
