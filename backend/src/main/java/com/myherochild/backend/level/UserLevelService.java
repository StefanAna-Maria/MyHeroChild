package com.myherochild.backend.level;

import com.myherochild.backend.common.exception.BusinessException;
import com.myherochild.backend.user.User;
import com.myherochild.backend.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserLevelService {

    private final LevelThresholdRepository levelThresholdRepository;
    private final UserRepository userRepository;

    public LevelProgress resolveProgress(int totalXp) {
        LevelThreshold currentLevel = levelThresholdRepository
                .findFirstByMinTotalXpLessThanEqualOrderByMinTotalXpDesc(totalXp)
                .orElseThrow(() -> new BusinessException("No level threshold found for current XP"));

        Integer nextLevelMinTotalXp = levelThresholdRepository
                .findFirstByMinTotalXpGreaterThanOrderByMinTotalXpAsc(totalXp)
                .map(LevelThreshold::getMinTotalXp)
                .orElse(null);

        return LevelProgress.builder()
                .level(currentLevel.getLevel())
                .currentLevelMinTotalXp(currentLevel.getMinTotalXp())
                .nextLevelMinTotalXp(nextLevelMinTotalXp)
                .build();
    }

    public User syncLevel(User user) {
        LevelProgress progress = resolveProgress(user.getXp());

        if (user.getLevel() == progress.getLevel()) {
            return user;
        }

        user.setLevel(progress.getLevel());
        return userRepository.save(user);
    }
}
