package com.myherochild.backend.common.model;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = false)
public class TaskTypeConverter implements AttributeConverter<TaskType, String> {

    @Override
    public String convertToDatabaseColumn(TaskType attribute) {
        return attribute == null ? TaskType.DEFAULT.getValue() : attribute.getValue();
    }

    @Override
    public TaskType convertToEntityAttribute(String dbData) {
        return TaskType.fromValue(dbData);
    }
}
