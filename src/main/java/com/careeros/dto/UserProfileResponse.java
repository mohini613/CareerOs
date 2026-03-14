package com.careeros.dto;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileResponse {
        private Long id;
        private Long userId;
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
        

}
