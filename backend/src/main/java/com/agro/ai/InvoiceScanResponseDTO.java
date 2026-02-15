package com.agro.ai;

import java.math.BigDecimal;

public class InvoiceScanResponseDTO {
    private String name;
    private BigDecimal cost;
    private String currency;
    private String date;
    private String note;

    public InvoiceScanResponseDTO() {
    }

    public InvoiceScanResponseDTO(String name, BigDecimal cost, String currency, String date, String note) {
        this.name = name;
        this.cost = cost;
        this.currency = currency;
        this.date = date;
        this.note = note;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
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

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }
}
