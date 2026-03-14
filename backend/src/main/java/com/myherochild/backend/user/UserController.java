package com.myherochild.backend.user;

import com.myherochild.backend.common.dto.ApiResponse;
import com.myherochild.backend.user.dto.UserMeResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;

    @GetMapping("/users/me")
    public ApiResponse<UserMeResponse> getCurrentUser(Authentication authentication) {

        String username = authentication.getName();

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        UserMeResponse response = UserMeResponse.builder()
                .username(user.getUsername())
                .role(user.getRole())
                .level(user.getLevel())
                .xp(user.getXp())
                .rewardPoints(user.getRewardPoints())
                .build();

        return ApiResponse.success("User fetched successfully", response);
    }
}