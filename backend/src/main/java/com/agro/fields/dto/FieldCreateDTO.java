package com.agro.fields.dto;

public class FieldCreateDTO {
    private String name;
    private Double hectares;
    private String photo;

    private Boolean hasAgriculture;
    private Boolean hasLivestock;
    private Double latitude;

    private Double longitude;

    private Integer cows;
    private Integer bulls;
    private Integer steers;
    private Integer youngSteers;
    private Integer heifers;
    private Integer maleCalves;
    private Integer femaleCalves;

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
