package com.careeros.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CareerGoalResponse {
    private Long id;
    private Long userId;
    private String goalType;
    private String targetRole;
    private String targetCompany;
    private String targetIndustry;
    private BigDecimal targetSalaryMin;
    private BigDecimal targetSalaryMax;
    private LocalDate targetDate;
    private String description;
    private String status;
    private Integer progressPercentage;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
