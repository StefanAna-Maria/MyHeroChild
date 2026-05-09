package com.myherochild.backend.parent;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ParentCustomTaskRepository extends JpaRepository<ParentCustomTask, Long> {
    List<ParentCustomTask> findAllByParentIdOrderByTitleAsc(Long parentId);
    Optional<ParentCustomTask> findByIdAndParentId(Long id, Long parentId);
}
