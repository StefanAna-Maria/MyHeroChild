package com.myherochild.backend.user;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserPointsHistoryRepository extends JpaRepository<UserPointsHistory, Long> {
    List<UserPointsHistory> findAllByUserIdOrderByCreatedAtDescIdDesc(Long userId);
}
