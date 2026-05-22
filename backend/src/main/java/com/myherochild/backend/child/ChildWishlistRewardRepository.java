package com.myherochild.backend.child;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ChildWishlistRewardRepository extends JpaRepository<ChildWishlistReward, Long> {
    List<ChildWishlistReward> findAllByChildIdAndAddedToParentCatalogueFalseOrderByCreatedAtDesc(Long childId);
    long countByChildIdAndAddedToParentCatalogueFalse(Long childId);
    Optional<ChildWishlistReward> findByIdAndChildId(Long id, Long childId);
}
