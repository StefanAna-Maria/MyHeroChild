package com.myherochild.backend.common.model;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

import java.util.Arrays;

public enum TaskType {
    DEFAULT("default"),
    SCHOOL_WORK("school_work"),
    READING("reading"),
    HYGIENE("hygiene"),
    NEAT_TIDY("neat_tidy"),
    CHORES("chores"),
    FAMILY_HELP("family_help"),
    RESPONSIBILITY("responsibility"),
    RESPECT_KINDNESS("respect_kindness"),
    HEALTH("health"),
    LIFE_SKILLS("life_skills"),
    SELF_IMPROVEMENT("self_improvement"),
    DIGITAL_BALANCE("digital_balance"),
    SOCIAL_SKILLS("social_skills"),
    CREATIVITY("creativity");

    private final String value;

    TaskType(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    @JsonCreator
    public static TaskType fromValue(String value) {
        if (value == null || value.trim().isEmpty()) {
            return DEFAULT;
        }

        String normalized = value.trim().toLowerCase().replace('-', '_').replace(' ', '_');

        return Arrays.stream(values())
                .filter(type -> type.value.equals(normalized))
                .findFirst()
                .orElse(DEFAULT);
    }
}
