package com.agro.fields.dto;

import java.time.LocalDate;

public class LivestockHistoryDTO {
    private LocalDate date;
    private Integer cows;
    private Integer bulls;
    private Integer steers;
    private Integer youngSteers;
    private Integer heifers;
    private Integer maleCalves;
    private Integer femaleCalves;

    public LivestockHistoryDTO(LocalDate date, Integer cows, Integer bulls, Integer steers, Integer youngSteers,
            Integer heifers, Integer maleCalves, Integer femaleCalves) {
        this.date = date;
        this.cows = cows;
        this.bulls = bulls;
        this.steers = steers;
        this.youngSteers = youngSteers;
        this.heifers = heifers;
        this.maleCalves = maleCalves;
        this.femaleCalves = femaleCalves;
    }

    public LocalDate getDate() {
        return date;
    }

    public Integer getCows() {
        return cows;
    }

    public Integer getBulls() {
        return bulls;
    }

    public Integer getSteers() {
        return steers;
    }

    public Integer getYoungSteers() {
        return youngSteers;
    }

    public Integer getHeifers() {
        return heifers;
    }

    public Integer getMaleCalves() {
        return maleCalves;
    }

    public Integer getFemaleCalves() {
        return femaleCalves;
    }
}
