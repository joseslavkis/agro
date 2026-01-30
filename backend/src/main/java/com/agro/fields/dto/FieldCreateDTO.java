package com.agro.fields.dto;

public class FieldCreateDTO {
    private String name;
    private Double hectares;
    private String photo;

    private Boolean hasAgriculture;
    private Boolean hasLivestock;
    private Double latitude;
    private Double longitude;

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
}
