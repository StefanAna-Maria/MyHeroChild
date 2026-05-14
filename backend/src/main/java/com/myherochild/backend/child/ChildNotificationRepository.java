package com.myherochild.backend.child;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ChildNotificationRepository extends JpaRepository<ChildNotification, Long> {
    List<ChildNotification> findAllByChildIdAndSeenFalseOrderByCreatedAtAsc(Long childId);
}
