package com.careeros.dto;

import lombok.Data;

@Data
public class CoverLetterRequest {
    private String jobDescription;
    private String jobTitle;
    private String companyName;
    private String tone; // e.g., "professional", "creative", "enthusiastic"
}
