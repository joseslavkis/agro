package com.agro.fields.dto;

import com.agro.fields.model.LivestockActionType;
import com.agro.fields.model.LivestockCategory;
import java.time.LocalDate;
import java.math.BigDecimal;

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

    // Financial fields
    private BigDecimal pricePerUnit;
    private String currency;
    private BigDecimal exchangeRate;
    private BigDecimal pricePerUnitUSD;
    private BigDecimal totalValueUSD;
    private BigDecimal salvageValue;
    private BigDecimal salvageValueUSD;
    private Long agendaEventId;

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

    public BigDecimal getPricePerUnit() {
        return pricePerUnit;
    }

    public void setPricePerUnit(BigDecimal pricePerUnit) {
        this.pricePerUnit = pricePerUnit;
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

    public BigDecimal getPricePerUnitUSD() {
        return pricePerUnitUSD;
    }

    public void setPricePerUnitUSD(BigDecimal pricePerUnitUSD) {
        this.pricePerUnitUSD = pricePerUnitUSD;
    }

    public BigDecimal getTotalValueUSD() {
        return totalValueUSD;
    }

    public void setTotalValueUSD(BigDecimal totalValueUSD) {
        this.totalValueUSD = totalValueUSD;
    }

    public BigDecimal getSalvageValue() {
        return salvageValue;
    }

    public void setSalvageValue(BigDecimal salvageValue) {
        this.salvageValue = salvageValue;
    }

    public BigDecimal getSalvageValueUSD() {
        return salvageValueUSD;
    }

    public void setSalvageValueUSD(BigDecimal salvageValueUSD) {
        this.salvageValueUSD = salvageValueUSD;
    }

    public Long getAgendaEventId() {
        return agendaEventId;
    }

    public void setAgendaEventId(Long agendaEventId) {
        this.agendaEventId = agendaEventId;
    }
}
