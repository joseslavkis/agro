package com.agro.fields.dto;

public class FieldResponseDTO {
    private Long id;
    private String name;
    private Double hectares;
    private String photo;

    public FieldResponseDTO(Long id, String name, Double hectares, String photo) {
        this.id = id;
        this.name = name;
        this.hectares = hectares;
        this.photo = photo;
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
}
