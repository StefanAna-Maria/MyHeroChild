package com.myherochild.backend.user;

import com.myherochild.backend.common.dto.ApiResponse;
import com.myherochild.backend.user.dto.UserMeResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/users")
public class UserController {

    private final UserRepository userRepository;

    // GET CURRENT USER (folosit de frontend pentru header)
    @GetMapping("/me")
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
                .avatar(user.getAvatar())
                .build();

        return ApiResponse.success("User fetched successfully", response);
    }

    // UPDATE AVATAR (folosit de AvatarPicker)
    @PatchMapping("/me/avatar")
    public ApiResponse<String> updateAvatar(
            Authentication authentication,
            @RequestBody Map<String, String> body
    ) {

        String username = authentication.getName();

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String avatar = body.get("avatar");

        if (avatar == null || avatar.isBlank()) {
            throw new RuntimeException("Avatar is required");
        }

        user.setAvatar(avatar);
        userRepository.save(user);

        return ApiResponse.success("Avatar updated successfully", null);
    }
}