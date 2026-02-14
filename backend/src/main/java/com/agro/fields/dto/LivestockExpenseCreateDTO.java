package com.agro.fields.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public class LivestockExpenseCreateDTO {

    @jakarta.validation.constraints.NotNull
    private String name;

    private Long fieldId;

    @jakarta.validation.constraints.NotNull
    private BigDecimal cost;

    private String currency = "USD";

    private BigDecimal exchangeRate;

    private String note;

    @jakarta.validation.constraints.NotNull
    private LocalDate date;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Long getFieldId() {
        return fieldId;
    }

    public void setFieldId(Long fieldId) {
        this.fieldId = fieldId;
    }

    public BigDecimal getCost() {
        return cost;
    }

    public void setCost(BigDecimal cost) {
        this.cost = cost;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public BigDecimal getExchangeRate() {
        return exchangeRate;
    }

    public void setExchangeRate(BigDecimal exchangeRate) {
        this.exchangeRate = exchangeRate;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }
}
