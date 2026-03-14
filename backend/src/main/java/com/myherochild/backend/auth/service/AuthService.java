package com.myherochild.backend.auth.service;

import com.myherochild.backend.auth.LoginRequest;
import com.myherochild.backend.auth.RegisterRequest;
import com.myherochild.backend.auth.dto.RegisterResponse;
import com.myherochild.backend.common.exception.BusinessException;
import com.myherochild.backend.config.AppProperties;
import com.myherochild.backend.security.JwtService;
import com.myherochild.backend.user.User;
import com.myherochild.backend.user.UserRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AppProperties appProperties;

    public RegisterResponse register(RegisterRequest request) {

        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new BusinessException("Passwords do not match");
        }

        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new BusinessException("Username already exists");
        }

        if (request.getEmail() != null && !request.getEmail().isBlank()) {
            if (userRepository.findByEmail(request.getEmail()).isPresent()) {
                throw new BusinessException("Email address already in use");
            }
        }

        if (request.getRole() == null) {
            throw new BusinessException("Role is required");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole());
        user.setCreatedAt(LocalDateTime.now());
        user.setLevel(1);
        user.setXp(0);
        user.setRewardPoints(0);

        String parentCode = null;

        switch (request.getRole()) {

            case PARENT -> {

                if (request.getEmail() == null || request.getEmail().isBlank()) {
                    throw new BusinessException("Email is required for parent");
                }

                user.setEmail(request.getEmail());

                parentCode = generateParentCode();
                user.setParentCode(parentCode);
            }

            case ADMIN -> {

                if (request.getEmail() == null || request.getEmail().isBlank()) {
                    throw new BusinessException("Email is required for admin");
                }

                String adminCode = request.getAdminCode();

                if (adminCode == null || adminCode.isBlank()) {
                    throw new BusinessException("Admin code is required");
                }

                if (!adminCode.equals(appProperties.getAdminCode())) {
                    throw new BusinessException("Incorrect admin code");
                }

                user.setEmail(request.getEmail());
            }

            case CHILD -> {

                if (request.getParentCode() == null || request.getParentCode().isBlank()) {
                    throw new BusinessException("Parent code is required");
                }

                User parent = userRepository.findByParentCode(request.getParentCode())
                        .orElseThrow(() -> new BusinessException("Invalid parent code"));

                user.setParent(parent);

                if (request.getEmail() != null && !request.getEmail().isBlank()) {
                    user.setEmail(request.getEmail());
                }
            }
        }

        userRepository.save(user);

        return RegisterResponse.builder()
                .parentCode(parentCode)
                .build();
    }

    public String login(LoginRequest request) {

        User user = userRepository.findByUsername(request.getIdentifier())
                .or(() -> userRepository.findByEmail(request.getIdentifier()))
                .orElseThrow(() -> new BusinessException("User not found"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new BusinessException("Invalid password");
        }

        return jwtService.generateToken(
                user.getUsername(),
                user.getRole().name()
        );
    }

    private String generateParentCode() {

        return UUID.randomUUID()
                .toString()
                .replace("-", "")
                .substring(0, 8)
                .toUpperCase();
    }
}