package com.agro.fields.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.time.LocalDate;

public class RainfallRecordCreateDTO {

    @NotNull
    private LocalDate date;

    @NotNull
    @Positive
    private Double amountMm;

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
