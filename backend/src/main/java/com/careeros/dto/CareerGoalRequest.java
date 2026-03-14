package com.careeros.dto;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data

public class CareerGoalRequest {
   @NotBlank(message="Goal type is required")
   @Pattern(regexp="ROle_Change| Skill_Development |Promotion|Industry_Switch|Salary_Increase|Other",
    message="Invalid goal type")
    private String goalType;


    private String targetCompany;
    private String targetRole;
    private String targetIndustry;
    private BigDecimal tagretSalaryMin;
    private BigDecimal targetSlaryMax;
    private LocalDate targetDate;
    private String description;

   
}
