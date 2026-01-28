package com.agro.user;

import jakarta.persistence.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDate;
import java.util.Collection;
import java.util.List;

@Entity
@Table(name = "users")
public class User implements UserDetails, UserCredentials {

    @Id
    @GeneratedValue
    private Long id;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String lastname;

    @Column(nullable = false)
    private String photo;

    @Column(nullable = false)
    private String gender;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false) // user name in the platform, distinct from email
    private String username;

    @Column(nullable = false)
    private LocalDate birthDate;

    public User(String name, String password, String gender, String email, String lastname, String photo,
            LocalDate birthDate, String username) {
        this.name = name;
        this.lastname = lastname;
        this.email = email;
        this.photo = photo;
        this.birthDate = birthDate;
        this.password = password;
        this.gender = gender;
        this.username = username;
    }

    public User() {
    }

    @Override
    public String email() {
        return email;
    }

    @Override
    public String password() {
        return password;
    }

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public String getPhoto() {
        return photo;
    }

    public void setPhoto(String photo) {
        this.photo = photo;
    }

    public String getLastname() {
        return lastname;
    }

    public void setLastname(String lastname) {
        this.lastname = lastname;
    }

    public String getEmail() {
        return email;
    }

    @Override
    public String getUsername() {
        return email;
    }

    public String getAppUsername() {
        return username;
    }

    public void setAppUsername(String username) {
        this.username = username;
    }

    @Override
    public String getPassword() {
        return password;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public LocalDate getBirthDate() {
        return birthDate;
    }

    public void setBirthDate(LocalDate birthDate) {
        this.birthDate = birthDate;
    }

    public Long getId() {
        return id;
    }

    // Role getters removed

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // Return empty authorities or a default one if Spring Security complains about
        // empty authorities (it usually doesn't for basic auth, but sometimes
        // anonymous)
        // Actually, returning an empty list is fine for "no specific roles".
        return List.of();
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}