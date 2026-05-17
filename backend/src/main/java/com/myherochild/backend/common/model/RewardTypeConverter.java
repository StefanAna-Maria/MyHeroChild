package com.myherochild.backend.common.model;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = false)
public class RewardTypeConverter implements AttributeConverter<RewardType, String> {

    @Override
    public String convertToDatabaseColumn(RewardType attribute) {
        return attribute == null ? RewardType.DEFAULT.getValue() : attribute.getValue();
    }

    @Override
    public RewardType convertToEntityAttribute(String dbData) {
        return RewardType.fromValue(dbData);
    }
}
