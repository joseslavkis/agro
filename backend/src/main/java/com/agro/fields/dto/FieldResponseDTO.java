package com.agro.fields.dto;

public class FieldResponseDTO {
    private Long id;
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

    public FieldResponseDTO(Long id, String name, Double hectares, String photo, Boolean hasAgriculture,
            Boolean hasLivestock, Double latitude, Double longitude,
            Integer cows, Integer bulls, Integer steers, Integer youngSteers, Integer heifers, Integer maleCalves,
            Integer femaleCalves) {
        this.id = id;
        this.name = name;
        this.hectares = hectares;
        this.photo = photo;
        this.hasAgriculture = hasAgriculture;
        this.hasLivestock = hasLivestock;
        this.latitude = latitude;
        this.longitude = longitude;
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
