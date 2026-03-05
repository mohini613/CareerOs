package com.careeros.dto;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class UserProfileRequest {
    private String currentTitle;
    private String currentCompany;
    private BigDecimal currentSalary;
    private String industry;
    private String educationLevel;
    private String location;
    private String bio;
    private String linkdinUrl;
    private String githubUrl;
    private String portfolioUrl;
    public BigDecimal getYearsOfExperience() {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'getYearsOfExperience'");
    }


}
