package com.careeros.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@AllArgsConstructor
@NoArgsConstructor

public class AuthResponse {
    private String token;
    private String type="Bearer";
    private long userId;
    private String email;
    private String firstName;
    private String lastName;

    public AuthResponse(String token, long userId, String email, String firstName, String lastName){
        this.token=token;
        this.userId=userId;
        this.email=email;
        this.firstName=firstName;
        this.lastName=lastName;
        
    }
}
