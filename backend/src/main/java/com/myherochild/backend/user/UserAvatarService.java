package com.myherochild.backend.user;

import com.myherochild.backend.common.exception.BusinessException;
import com.myherochild.backend.user.dto.UserAvatarOptionResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserAvatarService {

    private final AvatarDefinitionRepository avatarDefinitionRepository;
    private final UserClaimedAvatarRepository userClaimedAvatarRepository;

    public List<UserAvatarOptionResponse> getAvatarOptions(User user) {
        Set<Long> claimedAvatarIds = userClaimedAvatarRepository.findAllByUserId(user.getId())
                .stream()
                .map(userClaimedAvatar -> userClaimedAvatar.getAvatar().getId())
                .collect(Collectors.toSet());

        return avatarDefinitionRepository.findAllByOrderByMinLevelAscIdAsc()
                .stream()
                .map(avatar -> {
                    boolean unlocked = user.getLevel() >= avatar.getMinLevel();
                    boolean claimed = avatar.getMinLevel() <= 1 || claimedAvatarIds.contains(avatar.getId());
                    boolean selectable = unlocked && claimed;

                    return UserAvatarOptionResponse.builder()
                            .avatar(avatar.getImageAvatar())
                            .minLevel(avatar.getMinLevel())
                            .unlocked(unlocked)
                            .claimed(claimed)
                            .selectable(selectable)
                            .build();
                })
                .toList();
    }

    public void claimAvatar(User user, String avatarKey) {
        AvatarDefinition avatar = avatarDefinitionRepository.findByImageAvatar(avatarKey)
                .orElseThrow(() -> new BusinessException("Avatar not found"));

        if (avatar.getMinLevel() <= 1) {
            return;
        }

        if (user.getLevel() < avatar.getMinLevel()) {
            throw new BusinessException("This avatar is still locked");
        }

        if (userClaimedAvatarRepository.existsByUserIdAndAvatarId(user.getId(), avatar.getId())) {
            return;
        }

        userClaimedAvatarRepository.save(
                UserClaimedAvatar.builder()
                        .user(user)
                        .avatar(avatar)
                        .claimedAt(LocalDateTime.now())
                        .build()
        );
    }

    public void validateSelectableOrCurrent(User user, String avatarKey) {
        if (avatarKey == null || avatarKey.isBlank()) {
            throw new BusinessException("Avatar is required");
        }

        if (avatarKey.equals(user.getAvatar())) {
            return;
        }

        AvatarDefinition avatar = avatarDefinitionRepository.findByImageAvatar(avatarKey)
                .orElseThrow(() -> new BusinessException("Avatar not found"));

        if (user.getLevel() < avatar.getMinLevel()) {
            throw new BusinessException("This avatar is still locked");
        }

        if (avatar.getMinLevel() > 1 && !userClaimedAvatarRepository.existsByUserIdAndAvatarId(user.getId(), avatar.getId())) {
            throw new BusinessException("This avatar must be claimed first");
        }
    }
}
