package com.myherochild.backend.auth;

import com.myherochild.backend.user.User;
import com.myherochild.backend.user.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.myherochild.backend.security.JwtService;
import com.myherochild.backend.config.AppProperties;
import java.util.UUID;


import java.time.LocalDateTime;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AppProperties appProperties;


    @PostMapping("/register")
    public String register(@Valid @RequestBody RegisterRequest request) {

        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new RuntimeException("Passwords do not match");
        }

        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new RuntimeException("Username already exists");
        }

        if (request.getRole() == null) {
            throw new RuntimeException("Role is required");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole());
        user.setCreatedAt(LocalDateTime.now());
        user.setLevel(1);
        user.setXp(0);
        user.setRewardPoints(0);

        switch (request.getRole()) {

            case PARENT -> {
                if (request.getEmail() == null || request.getEmail().isBlank()) {
                    throw new RuntimeException("Email is required for parent");
                }

                user.setEmail(request.getEmail());
                user.setParentCode(generateParentCode());
            }

            case ADMIN -> {
                if (request.getEmail() == null || request.getEmail().isBlank()) {
                    throw new RuntimeException("Email is required for admin");
                }

                if (!request.getAdminCode().equals(appProperties.getAdminCode())) {
                    throw new RuntimeException("Invalid admin code");
                }

                user.setEmail(request.getEmail());
            }

            case CHILD -> {
                if (request.getParentCode() == null || request.getParentCode().isBlank()) {
                    throw new RuntimeException("Parent code is required");
                }

                User parent = userRepository.findByParentCode(request.getParentCode())
                        .orElseThrow(() -> new RuntimeException("Invalid parent code"));

                user.setParent(parent);

                if (request.getEmail() != null && !request.getEmail().isBlank()) {
                    user.setEmail(request.getEmail());
                }
            }
        }

        userRepository.save(user);

        return "User registered successfully";
    }


    @PostMapping("/login")
    public String login(@Valid @RequestBody LoginRequest request) {

        User user = userRepository.findByUsername(request.getIdentifier())
                .or(() -> userRepository.findByEmail(request.getIdentifier()))
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Invalid password");
        }

        return jwtService.generateToken(user.getUsername(), user.getRole().name());
    }

    private String generateParentCode() {
    return UUID.randomUUID()
            .toString()
            .replace("-", "")
            .substring(0, 8)
            .toUpperCase();
    }
}

