package com.agro.fields.dto;

import java.time.LocalDate;

public class RainfallRecordResponseDTO {

    private Long id;
    private Long fieldId;
    private LocalDate date;
    private Double amountMm;

    public RainfallRecordResponseDTO() {
    }

    public RainfallRecordResponseDTO(Long id, Long fieldId, LocalDate date, Double amountMm) {
        this.id = id;
        this.fieldId = fieldId;
        this.date = date;
        this.amountMm = amountMm;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getFieldId() {
        return fieldId;
    }

    public void setFieldId(Long fieldId) {
        this.fieldId = fieldId;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public Double getAmountMm() {
        return amountMm;
    }

    public void setAmountMm(Double amountMm) {
        this.amountMm = amountMm;
    }
}
