package com.myherochild.backend.user;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AvatarDefinitionRepository extends JpaRepository<AvatarDefinition, Long> {
    List<AvatarDefinition> findAllByOrderByMinLevelAscIdAsc();
    Optional<AvatarDefinition> findByImageAvatar(String imageAvatar);
}
