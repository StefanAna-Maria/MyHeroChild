package com.myherochild.backend.level;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface LevelThresholdRepository extends JpaRepository<LevelThreshold, Integer> {
    List<LevelThreshold> findAllByOrderByLevelAsc();

    Optional<LevelThreshold> findFirstByMinTotalXpLessThanEqualOrderByMinTotalXpDesc(Integer totalXp);

    Optional<LevelThreshold> findFirstByMinTotalXpGreaterThanOrderByMinTotalXpAsc(Integer totalXp);
}
