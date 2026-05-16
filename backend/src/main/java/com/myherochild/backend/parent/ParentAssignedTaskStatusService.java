package com.myherochild.backend.parent;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class ParentAssignedTaskStatusService {

    private final ParentAssignedTaskRepository parentAssignedTaskRepository;

    public void syncExpiredTasks() {
        parentAssignedTaskRepository.markExpiredTasks(LocalDate.now());
    }
}
