package com.myherochild.backend.parent;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class ParentAssignedRewardStatusService {

    private final ParentAssignedRewardRepository parentAssignedRewardRepository;

    public void syncExpiredRewards() {
        parentAssignedRewardRepository.markExpiredRewards(LocalDate.now());
    }
}
