package com.myherochild.backend.user;

import com.myherochild.backend.common.exception.BusinessException;
import com.myherochild.backend.user.dto.UserPointsHistoryEntryResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserPointsHistoryService {

    private final UserRepository userRepository;
    private final UserPointsHistoryRepository userPointsHistoryRepository;

    public void record(
            User user,
            String actionType,
            String sourceType,
            Long sourceId,
            int deltaXp,
            int deltaRewardPoints,
            String description
    ) {
        userPointsHistoryRepository.save(
                UserPointsHistory.builder()
                        .user(user)
                        .actionType(actionType)
                        .sourceType(sourceType)
                        .sourceId(sourceId)
                        .deltaXp(deltaXp)
                        .deltaRewardPoints(deltaRewardPoints)
                        .totalXpAfter(user.getXp())
                        .totalRewardPointsAfter(user.getRewardPoints())
                        .description(description)
                        .createdAt(LocalDateTime.now())
                        .build()
        );
    }

    public List<UserPointsHistoryEntryResponse> getCurrentUserHistory(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new BusinessException("User not found"));

        return userPointsHistoryRepository.findAllByUserIdOrderByCreatedAtDescIdDesc(user.getId())
                .stream()
                .map(entry -> UserPointsHistoryEntryResponse.builder()
                        .id(entry.getId())
                        .actionType(entry.getActionType())
                        .sourceType(entry.getSourceType())
                        .sourceId(entry.getSourceId())
                        .deltaXp(entry.getDeltaXp())
                        .deltaRewardPoints(entry.getDeltaRewardPoints())
                        .totalXpAfter(entry.getTotalXpAfter())
                        .totalRewardPointsAfter(entry.getTotalRewardPointsAfter())
                        .description(entry.getDescription())
                        .createdAt(entry.getCreatedAt().toString())
                        .build())
                .toList();
    }
}
