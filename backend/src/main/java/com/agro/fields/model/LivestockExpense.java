package com.agro.fields.model;

import com.agro.user.User;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "livestock_expenses")
public class LivestockExpense {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String name;

    // Optional: link to a specific field
    private Long fieldId;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal cost;

    @Column(length = 3)
    private String currency = "USD";

    @Column(precision = 19, scale = 4)
    private BigDecimal exchangeRate;

    @Column(precision = 19, scale = 2)
    private BigDecimal costUSD;

    @Column(columnDefinition = "TEXT")
    private String note;

    @Column(nullable = false)
    private LocalDate date;

    // Calendar synchronization
    private Long agendaEventId;

    public LivestockExpense() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

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

    public BigDecimal getCostUSD() {
        return costUSD;
    }

    public void setCostUSD(BigDecimal costUSD) {
        this.costUSD = costUSD;
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

    public Long getAgendaEventId() {
        return agendaEventId;
    }

    public void setAgendaEventId(Long agendaEventId) {
        this.agendaEventId = agendaEventId;
    }
}
