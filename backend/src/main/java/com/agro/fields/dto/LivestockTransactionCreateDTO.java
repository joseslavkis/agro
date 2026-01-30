package com.agro.fields.dto;

import com.agro.fields.model.LivestockActionType;
import com.agro.fields.model.LivestockCategory;
import java.time.LocalDate;

public class LivestockTransactionCreateDTO {
    private LivestockActionType actionType;
    private LivestockCategory category;
    private Integer quantity;
    private Long sourceFieldId;
    private Long targetFieldId;
    private LocalDate date;
    private String notes;

    public LivestockActionType getActionType() {
        return actionType;
    }

    public void setActionType(LivestockActionType actionType) {
        this.actionType = actionType;
    }

    public LivestockCategory getCategory() {
        return category;
    }

    public void setCategory(LivestockCategory category) {
        this.category = category;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public Long getSourceFieldId() {
        return sourceFieldId;
    }

    public void setSourceFieldId(Long sourceFieldId) {
        this.sourceFieldId = sourceFieldId;
    }

    public Long getTargetFieldId() {
        return targetFieldId;
    }

    public void setTargetFieldId(Long targetFieldId) {
        this.targetFieldId = targetFieldId;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
