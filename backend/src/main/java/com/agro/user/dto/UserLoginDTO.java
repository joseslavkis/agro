package com.agro.user.dto;

import com.agro.user.UserCredentials;
import jakarta.validation.constraints.NotBlank;

public record UserLoginDTO(
        @NotBlank String email,
        @NotBlank String password
) implements UserCredentials {}