package com.agro.fields.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public class LivestockExpenseResponseDTO {
    private Long id;
    private String name;
    private Long fieldId;
    private String fieldName;
    private BigDecimal cost;
    private String currency;
    private BigDecimal exchangeRate;
    private BigDecimal costUSD;
    private String note;
    private LocalDate date;
    private Long agendaEventId;

    public LivestockExpenseResponseDTO(Long id, String name, Long fieldId, String fieldName,
            BigDecimal cost, String currency, BigDecimal exchangeRate, BigDecimal costUSD,
            String note, LocalDate date, Long agendaEventId) {
        this.id = id;
        this.name = name;
        this.fieldId = fieldId;
        this.fieldName = fieldName;
        this.cost = cost;
        this.currency = currency;
        this.exchangeRate = exchangeRate;
        this.costUSD = costUSD;
        this.note = note;
        this.date = date;
        this.agendaEventId = agendaEventId;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public Long getFieldId() {
        return fieldId;
    }

    public String getFieldName() {
        return fieldName;
    }

    public BigDecimal getCost() {
        return cost;
    }

    public String getCurrency() {
        return currency;
    }

    public BigDecimal getExchangeRate() {
        return exchangeRate;
    }

    public BigDecimal getCostUSD() {
        return costUSD;
    }

    public String getNote() {
        return note;
    }

    public LocalDate getDate() {
        return date;
    }

    public Long getAgendaEventId() {
        return agendaEventId;
    }
}
