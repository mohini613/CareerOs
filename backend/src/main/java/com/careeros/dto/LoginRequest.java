package com.careeros.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data


public class LoginRequest {
    @NotBlank(message =" email is reuired ")
    @Email(message=" invalid email address")
    private String Email;

    @NotBlank(message="password is required")
    private String password;

    
}
