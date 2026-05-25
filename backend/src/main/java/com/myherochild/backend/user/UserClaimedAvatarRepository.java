package com.myherochild.backend.user;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserClaimedAvatarRepository extends JpaRepository<UserClaimedAvatar, Long> {
    List<UserClaimedAvatar> findAllByUserId(Long userId);
    boolean existsByUserIdAndAvatarId(Long userId, Long avatarId);
}
