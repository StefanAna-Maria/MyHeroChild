package com.myherochild.backend.parent;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ParentAssignedRewardRepository extends JpaRepository<ParentAssignedReward, Long> {
    long countByChildIdAndClaimedFalse(Long childId);

    long countByChildIdAndClaimedFalseAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
            Long childId,
            java.time.LocalDate startDate,
            java.time.LocalDate endDate
    );

    List<ParentAssignedReward> findAllByChildIdAndClaimedFalseOrderByStartDateAscEndDateAscTitleAsc(Long childId);

    List<ParentAssignedReward> findAllByParentIdAndClaimedTrueOrderByClaimedAtDesc(Long parentId);
}
