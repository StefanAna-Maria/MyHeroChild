package com.myherochild.backend.level;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class LevelProgress {

    private final int level;
    private final int currentLevelMinTotalXp;
    private final Integer nextLevelMinTotalXp;
}
