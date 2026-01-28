package com.agro.partners.dto;

import java.time.LocalDateTime;

public record PartnerRequestDTO(
        Long id,
        Long senderId,
        String senderName,
        String senderUsername,
        String senderPhoto,
        String status,
        LocalDateTime createdAt) {
}
