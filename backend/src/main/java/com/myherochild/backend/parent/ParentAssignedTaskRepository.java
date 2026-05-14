package com.myherochild.backend.parent;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ParentAssignedTaskRepository extends JpaRepository<ParentAssignedTask, Long> {
    long countByChildIdAndCompletedFalse(Long childId);

    java.util.Optional<ParentAssignedTask> findByIdAndChildId(Long id, Long childId);

    List<ParentAssignedTask> findAllByParentIdAndCompletionRequestedTrueAndCompletedFalseOrderByCompletionRequestedAtAscCreatedAtAsc(
            Long parentId
    );

    long countByChildIdAndCompletedFalseAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
            Long childId,
            java.time.LocalDate startDate,
            java.time.LocalDate endDate
    );

    List<ParentAssignedTask> findAllByChildIdAndCompletedFalseOrderByStartDateAscEndDateAscTitleAsc(Long childId);

    List<ParentAssignedTask> findAllByChildIdAndCompletedFalseAndStartDateLessThanEqualAndEndDateGreaterThanEqualOrderByEndDateAscTitleAsc(
            Long childId,
            java.time.LocalDate startDate,
            java.time.LocalDate endDate
    );
}
