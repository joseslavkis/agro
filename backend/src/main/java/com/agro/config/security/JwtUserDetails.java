package com.agro.config.security;

public record JwtUserDetails (
        String username,
        String role
) {}