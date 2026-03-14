package com.careeros.dto;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data

public class UserSkillRequest {
     @NotNull(message ="skill ID is required")
     private Long skillId;

     @NotNull(message = "proficiency level is required ")
     @Pattern(regexp="Begginer|Intermediate|Advanced|Expert",
     message ="proficiency must be:Beggginer, Intermediate, Advanced,or Expert")
     private String proficiencyLevel;

     private BigDecimal yearsOfExperience;
     private LocalDate lastUsedDate;
     private Boolean isPrimary = false;
}

