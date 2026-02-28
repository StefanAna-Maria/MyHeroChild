package com.myherochild.backend.auth;

import com.myherochild.backend.user.UserRole;
import jakarta.validation.constraints.Email;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RegisterRequest {

    @NotBlank
    private String username;

    private String email;

    @NotBlank
    private String password;

    @NotBlank
    private String confirmPassword;

    private UserRole role;

    private String parentCode; 
    private String adminCode;
}
