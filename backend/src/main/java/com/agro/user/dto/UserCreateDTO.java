package com.agro.user.dto;

import com.agro.user.User;
import com.agro.user.UserCredentials;
import jakarta.validation.constraints.*;

import java.time.LocalDate;
import java.util.function.Function;

public record UserCreateDTO(
        @NotNull @Email(message = "Email must be a valid email address") String email,
        @NotNull @Size(min = 4, message = "Password must be at least 4 characters long") String password,
        String photo,
        String name,
        String lastname,
        String gender,
        LocalDate birthDate,
        @NotNull(message = "Username is required") String username)
        implements UserCredentials {
    public User asUser(Function<String, String> encryptPassword) {
        return new User(
                name != null ? name : "User",
                encryptPassword.apply(password),
                gender != null ? gender : "Other",
                email,
                lastname != null ? lastname : "",
                photo != null ? photo : "",
                birthDate != null ? birthDate : LocalDate.of(2000, 1, 1),
                username);
    }
}