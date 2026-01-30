package com.agro.fields.model;

import com.agro.user.User;
import jakarta.persistence.*;

@Entity(name = "fields")
public class Field {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private Double hectares;

    @Column(nullable = true)
    private String photo;

    @Column(name = "has_agriculture")
    private Boolean hasAgriculture;

    @Column(name = "has_livestock")
    private Boolean hasLivestock;

    @Column
    private Double latitude;

    @Column
    private Double longitude;

    // Livestock counters
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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    public Field() {
    }

    public Field(String name, Double hectares, String photo, User user, Boolean hasAgriculture, Boolean hasLivestock,
            Double latitude, Double longitude) {
        this.name = name;
        this.hectares = hectares;
        this.photo = photo;
        this.user = user;
        this.hasAgriculture = hasAgriculture;
        this.hasLivestock = hasLivestock;
        this.latitude = latitude;
        this.longitude = longitude;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Double getHectares() {
        return hectares;
    }

    public void setHectares(Double hectares) {
        this.hectares = hectares;
    }

    public String getPhoto() {
        return photo;
    }

    public void setPhoto(String photo) {
        this.photo = photo;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Boolean getHasAgriculture() {
        return hasAgriculture;
    }

    public void setHasAgriculture(Boolean hasAgriculture) {
        this.hasAgriculture = hasAgriculture;
    }

    public Boolean getHasLivestock() {
        return hasLivestock;
    }

    public void setHasLivestock(Boolean hasLivestock) {
        this.hasLivestock = hasLivestock;
    }

    public Double getLatitude() {
        return latitude;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
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
