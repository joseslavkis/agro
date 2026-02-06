package com.agro.agenda.dto;

import com.agro.agenda.AgendaEvent.EventType;
import java.time.LocalDateTime;

public class AgendaResponseDTO {
    private Long id;
    private String title;
    private String description;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private EventType eventType;
    private Long fieldId;

    public AgendaResponseDTO(Long id, String title, String description, LocalDateTime startDate, LocalDateTime endDate,
            EventType eventType, Long fieldId) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.startDate = startDate;
        this.endDate = endDate;
        this.eventType = eventType;
        this.fieldId = fieldId;
    }

    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public String getDescription() {
        return description;
    }

    public LocalDateTime getStartDate() {
        return startDate;
    }

    public LocalDateTime getEndDate() {
        return endDate;
    }

    public EventType getEventType() {
        return eventType;
    }

    public Long getFieldId() {
        return fieldId;
    }
}
