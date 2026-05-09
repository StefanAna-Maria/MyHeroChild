package com.myherochild.backend.parent;

import com.myherochild.backend.common.exception.BusinessException;
import com.myherochild.backend.parent.dto.ParentChildSummaryResponse;
import com.myherochild.backend.parent.dto.ParentProfileResponse;
import com.myherochild.backend.security.JwtService;
import com.myherochild.backend.user.User;
import com.myherochild.backend.user.UserRepository;
import com.myherochild.backend.user.UserRole;
import com.myherochild.backend.user.dto.UpdateUserProfileRequest;
import com.myherochild.backend.user.dto.UpdateUserProfileResponse;
import com.myherochild.backend.user.dto.UserMeResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ParentProfileService {

    private final UserRepository userRepository;
    private final JwtService jwtService;

    public ParentProfileResponse getProfile(String username) {
        User parent = getParent(username);

        List<ParentChildSummaryResponse> children = userRepository
                .findAllByParentIdAndRoleOrderByUsernameAsc(parent.getId(), UserRole.CHILD)
                .stream()
                .map(child -> ParentChildSummaryResponse.builder()
                        .id(child.getId())
                        .username(child.getUsername())
                        .avatar(child.getAvatar())
                        // The active task distribution flow is not persisted yet.
                        .activeTasksCount(0)
                        .build())
                .toList();

        return ParentProfileResponse.builder()
                .username(parent.getUsername())
                .email(parent.getEmail())
                .avatar(parent.getAvatar())
                .children(children)
                .claimedRewards(Collections.emptyList())
                .build();
    }

    public UpdateUserProfileResponse updateProfile(String username, UpdateUserProfileRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new BusinessException("User not found"));

        String nextUsername = request.getUsername() == null ? "" : request.getUsername().trim();
        String nextEmail = request.getEmail() == null ? "" : request.getEmail().trim();
        String nextAvatar = request.getAvatar() == null ? "" : request.getAvatar().trim();

        if (nextUsername.isEmpty()) {
            throw new BusinessException("Username is required");
        }

        if (nextEmail.isEmpty()) {
            throw new BusinessException("Email is required");
        }

        if (nextAvatar.isEmpty()) {
            throw new BusinessException("Avatar is required");
        }

        userRepository.findByUsername(nextUsername)
                .filter(existingUser -> !existingUser.getId().equals(user.getId()))
                .ifPresent(existingUser -> {
                    throw new BusinessException("Username already exists");
                });

        userRepository.findByEmail(nextEmail)
                .filter(existingUser -> !existingUser.getId().equals(user.getId()))
                .ifPresent(existingUser -> {
                    throw new BusinessException("Email address already in use");
                });

        user.setUsername(nextUsername);
        user.setEmail(nextEmail);
        user.setAvatar(nextAvatar);

        User savedUser = userRepository.save(user);
        String refreshedToken = jwtService.generateToken(savedUser.getUsername(), savedUser.getRole().name());

        return UpdateUserProfileResponse.builder()
                .user(mapUserMeResponse(savedUser))
                .token(refreshedToken)
                .build();
    }

    private User getParent(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new BusinessException("User not found"));

        if (user.getRole() != UserRole.PARENT) {
            throw new BusinessException("Only parents can access this profile");
        }

        return user;
    }

    private UserMeResponse mapUserMeResponse(User user) {
        return UserMeResponse.builder()
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole())
                .level(user.getLevel())
                .xp(user.getXp())
                .rewardPoints(user.getRewardPoints())
                .avatar(user.getAvatar())
                .build();
    }
}
