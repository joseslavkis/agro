package com.agro.user.dto;

import java.time.LocalDate;

public record UserProfileDTO(
                Long id,
                String email,
                String name,
                String lastname,
                String photo,
                String gender,
                LocalDate birthDate,
                String username) {
}