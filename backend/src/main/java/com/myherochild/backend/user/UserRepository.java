package com.myherochild.backend.user;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByUsername(String username);
    Optional<User> findByParentCode(String parentCode);
    List<User> findAllByParentIdAndRoleOrderByUsernameAsc(Long parentId, UserRole role);

    @EntityGraph(attributePaths = "catalogPackages")
    Optional<User> findWithCatalogPackagesByUsername(String username);
}
