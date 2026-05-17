package com.myherochild.backend.parent;

import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ParentAssignedTaskRepository extends JpaRepository<ParentAssignedTask, Long> {
    long countByChildIdAndReviewedFalseAndExpiredFalse(Long childId);

    java.util.Optional<ParentAssignedTask> findByIdAndChildId(Long id, Long childId);

    List<ParentAssignedTask> findAllByParentIdAndCompletionRequestedTrueAndReviewedFalseOrderByCompletionRequestedAtAscCreatedAtAsc(
            Long parentId
    );

    long countByChildIdAndReviewedFalseAndExpiredFalseAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
            Long childId,
            java.time.LocalDate startDate,
            java.time.LocalDate endDate
    );

    List<ParentAssignedTask> findAllByChildIdAndReviewedFalseAndExpiredFalseOrderByStartDateAscEndDateAscTitleAsc(Long childId);

    List<ParentAssignedTask> findAllByChildIdAndReviewedFalseAndExpiredFalseAndEndDateGreaterThanEqualOrderByStartDateAscEndDateAscTitleAsc(
            Long childId,
            java.time.LocalDate endDate
    );

    List<ParentAssignedTask> findAllByChildIdAndReviewedFalseAndExpiredFalseAndStartDateLessThanEqualAndEndDateGreaterThanEqualOrderByEndDateAscTitleAsc(
            Long childId,
            java.time.LocalDate startDate,
            java.time.LocalDate endDate
    );

    @Modifying
    @Transactional
    @Query("""
            update ParentAssignedTask task
               set task.expired = true
             where task.expired = false
               and task.reviewed = false
               and task.endDate < :today
            """)
    int markExpiredTasks(@Param("today") java.time.LocalDate today);
}
