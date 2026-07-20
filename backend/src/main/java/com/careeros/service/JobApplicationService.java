package com.careeros.service;

import com.careeros.dto.JobApplicationRequest;
import com.careeros.dto.JobApplicationResponse;
import com.careeros.dto.UpdateApplicationStatusRequest;
import com.careeros.model.JobApplication;
import com.careeros.model.User;
import com.careeros.repository.JobApplicationRepository;
import com.careeros.repository.JobApplicationSpecification;
import com.careeros.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class JobApplicationService {

    private final JobApplicationRepository jobApplicationRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final NotificationService notificationService;

    public List<JobApplicationResponse> getUserApplications(Long userId) {
        return jobApplicationRepository.findByUserIdOrderByApplicationDateDesc(userId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public Page<JobApplicationResponse> getApplicationsPaginated(Long userId, String status, String company, LocalDate dateFrom, Pageable pageable) {
        Specification<JobApplication> spec = Specification.where(JobApplicationSpecification.hasUserId(userId))
                .and(JobApplicationSpecification.hasStatus(status))
                .and(JobApplicationSpecification.hasCompany(company))
                .and(JobApplicationSpecification.appliedAfter(dateFrom));

        return jobApplicationRepository.findAll(spec, pageable).map(this::mapToResponse);
    }

    public JobApplicationResponse createApplication(Long userId, JobApplicationRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        JobApplication application = new JobApplication();
        application.setUser(user);
        application.setCompanyName(request.getCompanyName());
        application.setJobTitle(request.getJobTitle());
        application.setStatus("applied");
        application.setJobUrl(request.getJobUrl());
        application.setLocation(request.getLocation());
        application.setJobType(request.getJobType());
        application.setSalaryRange(request.getSalaryRange());
        application.setApplicationDate(request.getApplicationDate());
        application.setFollowUpDate(request.getFollowUpDate());
        application.setInterviewDate(request.getInterviewDate());
        application.setNotes(request.getNotes());

        JobApplication saved = jobApplicationRepository.save(application);
        
        notificationService.createNotification(
                user,
                "Application Added",
                "Successfully added application for " + saved.getJobTitle() + " at " + saved.getCompanyName(),
                "APPLICATION_STATUS"
        );

        return mapToResponse(saved);
    }

    public JobApplicationResponse updateApplication(Long userId, Long applicationId, JobApplicationRequest request) {
        JobApplication application = jobApplicationRepository.findByIdAndUserId(applicationId, userId)
                .orElseThrow(() -> new RuntimeException("Application not found"));

        application.setCompanyName(request.getCompanyName());
        application.setJobTitle(request.getJobTitle());
        application.setJobUrl(request.getJobUrl());
        application.setLocation(request.getLocation());
        application.setJobType(request.getJobType());
        application.setSalaryRange(request.getSalaryRange());
        application.setApplicationDate(request.getApplicationDate());
        application.setFollowUpDate(request.getFollowUpDate());
        application.setInterviewDate(request.getInterviewDate());
        application.setNotes(request.getNotes());

        return mapToResponse(jobApplicationRepository.save(application));
    }

    public JobApplicationResponse updateStatus(Long userId, Long applicationId,
            UpdateApplicationStatusRequest request) {
        JobApplication application = jobApplicationRepository.findByIdAndUserId(applicationId, userId)
                .orElseThrow(() -> new RuntimeException("Application not found"));

        application.setStatus(request.getStatus());
        JobApplication saved = jobApplicationRepository.save(application);

        notificationService.createNotification(
                saved.getUser(),
                "Status Updated",
                "Your application for " + saved.getJobTitle() + " at " + saved.getCompanyName() + " is now " + request.getStatus(),
                "APPLICATION_STATUS"
        );

        try {
            emailService.sendApplicationStatusUpdate(
                    saved.getUser().getEmail(),
                    saved.getUser().getFirstName(),
                    saved.getCompanyName(),
                    saved.getJobTitle(),
                    request.getStatus()
            );
        } catch (Exception e) {
            System.out.println("Email notification failed: " + e.getMessage());
        }

        return mapToResponse(saved);
    }

    public void deleteApplication(Long userId, Long applicationId) {
        JobApplication application = jobApplicationRepository.findByIdAndUserId(applicationId, userId)
                .orElseThrow(() -> new RuntimeException("Application not found"));
        jobApplicationRepository.delete(application);
    }

    private JobApplicationResponse mapToResponse(JobApplication app) {
        JobApplicationResponse response = new JobApplicationResponse();
        response.setId(app.getId());
        response.setCompanyName(app.getCompanyName());
        response.setJobTitle(app.getJobTitle());
        response.setStatus(app.getStatus());
        response.setJobUrl(app.getJobUrl());
        response.setLocation(app.getLocation());
        response.setJobType(app.getJobType());
        response.setSalaryRange(app.getSalaryRange());
        response.setApplicationDate(app.getApplicationDate());
        response.setFollowUpDate(app.getFollowUpDate());
        response.setInterviewDate(app.getInterviewDate());
        response.setNotes(app.getNotes());
        response.setCreatedAt(app.getCreatedAt());
        response.setUpdatedAt(app.getUpdatedAt());
        return response;
    }
}