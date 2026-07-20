package com.careeros.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class ExtractedProfileDTO {
    private String currentTitle;
    private String currentCompany;
    private BigDecimal yearsOfExperience;
    private String industry;
    private String educationLevel;
    private String location;
    private String bio;
    private String linkedinUrl;
    private String githubUrl;
    private String portfolioUrl;
    private List<ExtractedSkillDTO> skills;
}
