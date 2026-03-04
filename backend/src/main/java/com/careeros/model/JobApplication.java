package com.careeros.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "job_applications")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class JobApplication {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Column(name = "company_name", nullable = false, length = 200)
    private String companyName;
    
    @Column(name = "job_title", nullable = false, length = 200)
    private String jobTitle;
    
    @Column(name = "job_url", length = 500)
    private String jobUrl;
    
    @Column(name = "application_date", nullable = false)
    private LocalDate applicationDate;
    
    @Column(length = 50)
    private String status = "applied";
    
    @Column(name = "salary_range", length = 100)
    private String salaryRange;
    
    @Column(length = 200)
    private String location;
    
    @Column(name = "job_type", length = 50)
    private String jobType;
    
    @Column(columnDefinition = "TEXT")
    private String notes;
    
    @Column(name = "interview_date")
    private LocalDateTime interviewDate;
    
    @Column(name = "follow_up_date")
    private LocalDate followUpDate;
    
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}