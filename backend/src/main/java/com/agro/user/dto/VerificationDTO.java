package com.agro.user.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record VerificationDTO(
        @NotBlank @Email String email,
        @NotBlank String code) {
}
