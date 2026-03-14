package com.careeros.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_profiles")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserProfile {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @OneToOne
    @JoinColumn(name = "user_id", unique = true, nullable = false)
    private User user;
    
    @Column(name = "current_title", length = 200)
    private String currentTitle;
    
    @Column(name = "current_company", length = 200)
    private String currentCompany;
    
    @Column(name = "years_of_experience", precision = 4, scale = 1)
    private BigDecimal yearsOfExperience;
    
    @Column(length = 100)
    private String industry;
    
    @Column(name = "education_level", length = 50)
    private String educationLevel;
    
    @Column(length = 200)
    private String location;
    
    @Column(columnDefinition = "TEXT")
    private String bio;
    
    @Column(name = "linkedin_url", length = 500)
    private String linkedinUrl;
    
    @Column(name = "github_url", length = 500)
    private String githubUrl;
    
    @Column(name = "portfolio_url", length = 500)
    private String portfolioUrl;
    
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;


}
