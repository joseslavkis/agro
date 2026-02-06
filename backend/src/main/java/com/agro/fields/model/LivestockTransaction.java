package com.agro.fields.model;

import com.agro.user.User;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "livestock_transactions")
public class LivestockTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // The user who performed the action
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // For moves: source field. For births/purchases: null.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "source_field_id")
    private Field sourceField;

    // For moves: target field. For deaths/sales: null.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "target_field_id")
    private Field targetField;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private LivestockCategory category;

    @Column(nullable = false)
    private Integer quantity;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private LivestockActionType actionType;

    @Column(nullable = false)
    private LocalDate date;

    @Column(columnDefinition = "TEXT")
    private String notes;

    // Financial fields for accounting
    @Column(precision = 19, scale = 2)
    private BigDecimal pricePerUnit;

    @Column(length = 3)
    private String currency = "USD"; // ARS or USD

    @Column(precision = 19, scale = 4)
    private BigDecimal exchangeRate; // ARS to USD rate if currency is ARS

    @Column(precision = 19, scale = 2)
    private BigDecimal pricePerUnitUSD; // Normalized price in USD

    @Column(precision = 19, scale = 2)
    private BigDecimal salvageValue; // For DEATH transactions

    @Column(precision = 19, scale = 2)
    private BigDecimal salvageValueUSD;

    // Calendar synchronization
    private Long agendaEventId; // Reference to AgendaEvent

    public LivestockTransaction() {
    }

    public LivestockTransaction(User user, Field sourceField, Field targetField, LivestockCategory category,
            Integer quantity, LivestockActionType actionType, LocalDate date, String notes) {
        this.user = user;
        this.sourceField = sourceField;
        this.targetField = targetField;
        this.category = category;
        this.quantity = quantity;
        this.actionType = actionType;
        this.date = date;
        this.notes = notes;
    }

    public Long getId() {
        return id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Field getSourceField() {
        return sourceField;
    }

    public void setSourceField(Field sourceField) {
        this.sourceField = sourceField;
    }

    public Field getTargetField() {
        return targetField;
    }

    public void setTargetField(Field targetField) {
        this.targetField = targetField;
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

    public LivestockActionType getActionType() {
        return actionType;
    }

    public void setActionType(LivestockActionType actionType) {
        this.actionType = actionType;
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
