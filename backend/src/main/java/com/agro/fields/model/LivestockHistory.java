package com.agro.fields.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity(name = "livestock_history")
public class LivestockHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "field_id", nullable = false)
    private Field field;

    @Column(nullable = false)
    private LocalDate date;

    @Column(columnDefinition = "integer default 0")
    private Integer cows = 0;
    @Column(columnDefinition = "integer default 0")
    private Integer bulls = 0;
    @Column(columnDefinition = "integer default 0")
    private Integer steers = 0;
    @Column(columnDefinition = "integer default 0")
    private Integer youngSteers = 0;
    @Column(columnDefinition = "integer default 0")
    private Integer heifers = 0;
    @Column(columnDefinition = "integer default 0")
    private Integer maleCalves = 0;
    @Column(columnDefinition = "integer default 0")
    private Integer femaleCalves = 0;

    public LivestockHistory() {
    }

    public LivestockHistory(Field field, LocalDate date, Integer cows, Integer bulls, Integer steers,
            Integer youngSteers, Integer heifers, Integer maleCalves, Integer femaleCalves) {
        this.field = field;
        this.date = date;
        this.cows = cows;
        this.bulls = bulls;
        this.steers = steers;
        this.youngSteers = youngSteers;
        this.heifers = heifers;
        this.maleCalves = maleCalves;
        this.femaleCalves = femaleCalves;
    }

    public Long getId() {
        return id;
    }

    public Field getField() {
        return field;
    }

    public void setField(Field field) {
        this.field = field;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public Integer getCows() {
        return cows;
    }

    public void setCows(Integer cows) {
        this.cows = cows;
    }

    public Integer getBulls() {
        return bulls;
    }

    public void setBulls(Integer bulls) {
        this.bulls = bulls;
    }

    public Integer getSteers() {
        return steers;
    }

    public void setSteers(Integer steers) {
        this.steers = steers;
    }

    public Integer getYoungSteers() {
        return youngSteers;
    }

    public void setYoungSteers(Integer youngSteers) {
        this.youngSteers = youngSteers;
    }

    public Integer getHeifers() {
        return heifers;
    }

    public void setHeifers(Integer heifers) {
        this.heifers = heifers;
    }

    public Integer getMaleCalves() {
        return maleCalves;
    }

    public void setMaleCalves(Integer maleCalves) {
        this.maleCalves = maleCalves;
    }

    public Integer getFemaleCalves() {
        return femaleCalves;
    }

    public void setFemaleCalves(Integer femaleCalves) {
        this.femaleCalves = femaleCalves;
    }
}
