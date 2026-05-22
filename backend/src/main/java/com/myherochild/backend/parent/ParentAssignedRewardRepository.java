package com.myherochild.backend.parent;

import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ParentAssignedRewardRepository extends JpaRepository<ParentAssignedReward, Long> {
    long countByChildIdAndClaimedFalseAndExpiredFalse(Long childId);

    java.util.Optional<ParentAssignedReward> findByIdAndChildId(Long id, Long childId);

    long countByChildIdAndClaimedFalseAndExpiredFalseAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
            Long childId,
            java.time.LocalDate startDate,
            java.time.LocalDate endDate
    );

    List<ParentAssignedReward> findAllByChildIdAndClaimedFalseAndExpiredFalseOrderByStartDateAscEndDateAscTitleAsc(Long childId);

    List<ParentAssignedReward> findAllByChildIdAndClaimedFalseAndExpiredFalseAndStartDateLessThanEqualAndEndDateGreaterThanEqualOrderByEndDateAscTitleAsc(
            Long childId,
            java.time.LocalDate startDate,
            java.time.LocalDate endDate
    );

    List<ParentAssignedReward> findAllByChildIdAndClaimedTrueAndGrantedFalseOrderByClaimedAtDescCreatedAtDesc(Long childId);

    List<ParentAssignedReward> findAllByChildIdAndGrantedTrueOrderByGrantedAtDescClaimedAtDescCreatedAtDesc(Long childId);

    List<ParentAssignedReward> findAllByChildIdOrderByCreatedAtDesc(Long childId);

    List<ParentAssignedReward> findAllByParentIdAndClaimedTrueAndGrantedFalseOrderByClaimedAtDesc(Long parentId);

    @Modifying
    @Transactional
    @Query("""
            update ParentAssignedReward reward
               set reward.expired = true
             where reward.expired = false
               and reward.claimed = false
               and reward.endDate < :today
            """)
    int markExpiredRewards(@Param("today") java.time.LocalDate today);
}
