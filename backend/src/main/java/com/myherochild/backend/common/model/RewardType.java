package com.myherochild.backend.common.model;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

import java.util.Arrays;

public enum RewardType {
    DEFAULT("default"),
    TOY("toy"),
    SCREEN_TIME("screen_time"),
    SWEET_TREAT("sweet_treat"),
    PARENTS_CHOICE("parents_choice"),
    FAMILY("family"),
    SOCIAL("social"),
    ALLOWANCE("allowance"),
    SHOPPING("shopping"),
    FREEDOM("freedom"),
    GAMING("gaming"),
    EDUCATION("education");

    private final String value;

    RewardType(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    @JsonCreator
    public static RewardType fromValue(String value) {
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
