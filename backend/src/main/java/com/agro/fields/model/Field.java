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
}
