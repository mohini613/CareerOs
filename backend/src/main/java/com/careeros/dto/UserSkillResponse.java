package com.careeros.dto;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserSkillResponse {
    private Long id;
    private Long userId;
    private SkillResponse skill;
    private String proficiencyLevel;
    private BigDecimal yearsOfExperience;
    private LocalDate lastDateUsed;
    private Boolean isPrimary;
    private Integer endorsementCount;

}
