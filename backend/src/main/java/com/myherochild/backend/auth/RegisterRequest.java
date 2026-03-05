package com.myherochild.backend.auth;

import com.myherochild.backend.user.UserRole;

import jakarta.validation.constraints.*;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RegisterRequest {

    @NotBlank(message = "Username is required")
    @Size(min = 3, max = 20, message = "Username must be between 3 and 20 characters")
    private String username;

    @Pattern(
        regexp = "^$|^[A-Za-z0-9+_.-]+@(gmail|yahoo|hotmail|test)\\.com$",
        message = "Email must be a valid address (@gmail.com, @yahoo.com, @hotmail.com or @test.com)"
    )
    private String email;

    @NotBlank(message = "Password is required")
    @Pattern(
        regexp = "^(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&]).{8,}$",
        message = "Password must contain at least 8 characters, one uppercase letter, one number and one symbol"
    )
    private String password;

    @NotBlank(message = "Confirm password is required")
    private String confirmPassword;

    @NotNull(message = "Role is required")
    private UserRole role;

    private String parentCode;
    private String adminCode;
}