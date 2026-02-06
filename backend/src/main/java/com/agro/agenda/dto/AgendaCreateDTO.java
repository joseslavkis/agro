package com.agro.agenda.dto;

import com.agro.agenda.AgendaEvent.EventType;
import java.time.LocalDateTime;

public class AgendaCreateDTO {
    @jakarta.validation.constraints.NotNull
    private String title;
    private String description;
    @jakarta.validation.constraints.NotNull
    private LocalDateTime startDate;
    @jakarta.validation.constraints.NotNull
    private LocalDateTime endDate;
    @jakarta.validation.constraints.NotNull
    private EventType eventType;
    private Long fieldId;

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDateTime getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDateTime startDate) {
        this.startDate = startDate;
    }

    public LocalDateTime getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDateTime endDate) {
        this.endDate = endDate;
    }

    public EventType getEventType() {
        return eventType;
    }

    public void setEventType(EventType eventType) {
        this.eventType = eventType;
    }

    public Long getFieldId() {
        return fieldId;
    }

    public void setFieldId(Long fieldId) {
        this.fieldId = fieldId;
    }
}
