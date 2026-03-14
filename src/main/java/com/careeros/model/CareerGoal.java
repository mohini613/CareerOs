package com.careeros.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "career_goals")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CareerGoal {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Column(name = "goal_type", nullable = false, length = 50)
    private String goalType;
    
    @Column(name = "target_role", length = 200)
    private String targetRole;
    
    @Column(name = "target_company", length = 200)
    private String targetCompany;
    
    @Column(name = "target_industry", length = 100)
    private String targetIndustry;
    
    @Column(name = "target_salary_min", precision = 12, scale = 2)
    private BigDecimal targetSalaryMin;
    
    @Column(name = "target_salary_max", precision = 12, scale = 2)
    private BigDecimal targetSalaryMax;
    
    @Column(name = "target_date")
    private LocalDate targetDate;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(length = 20)
    private String status = "active";
    
    @Column(name = "progress_percentage")
    private Integer progressPercentage = 0;
    
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}