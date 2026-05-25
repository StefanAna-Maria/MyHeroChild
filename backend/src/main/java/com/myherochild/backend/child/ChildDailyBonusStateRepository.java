package com.myherochild.backend.child;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ChildDailyBonusStateRepository extends JpaRepository<ChildDailyBonusState, Long> {
    Optional<ChildDailyBonusState> findByChildId(Long childId);
}
