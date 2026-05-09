package com.myherochild.backend.parent;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ParentCustomRewardRepository extends JpaRepository<ParentCustomReward, Long> {
    List<ParentCustomReward> findAllByParentIdOrderByTitleAsc(Long parentId);
    Optional<ParentCustomReward> findByIdAndParentId(Long id, Long parentId);
}
