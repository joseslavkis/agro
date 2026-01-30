package com.agro.fields.dto;

import com.agro.fields.model.LivestockActionType;
import com.agro.fields.model.LivestockCategory;
import java.time.LocalDate;

public class LivestockTransactionResponseDTO {
    private Long id;
    private LivestockActionType actionType;
    private LivestockCategory category;
    private Integer quantity;
    private Long sourceFieldId;
    private String sourceFieldName;
    private Long targetFieldId;
    private String targetFieldName;
    private LocalDate date;
    private String notes;

    public LivestockTransactionResponseDTO(Long id, LivestockActionType actionType, LivestockCategory category,
            Integer quantity, Long sourceFieldId, String sourceFieldName, Long targetFieldId, String targetFieldName,
            LocalDate date, String notes) {
        this.id = id;
        this.actionType = actionType;
        this.category = category;
        this.quantity = quantity;
        this.sourceFieldId = sourceFieldId;
        this.sourceFieldName = sourceFieldName;
        this.targetFieldId = targetFieldId;
        this.targetFieldName = targetFieldName;
        this.date = date;
        this.notes = notes;
    }

    public Long getId() {
        return id;
    }

    public LivestockActionType getActionType() {
        return actionType;
    }

    public LivestockCategory getCategory() {
        return category;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public Long getSourceFieldId() {
        return sourceFieldId;
    }

    public String getSourceFieldName() {
        return sourceFieldName;
    }

    public Long getTargetFieldId() {
        return targetFieldId;
    }

    public String getTargetFieldName() {
        return targetFieldName;
    }

    public LocalDate getDate() {
        return date;
    }

    public String getNotes() {
        return notes;
    }
}
