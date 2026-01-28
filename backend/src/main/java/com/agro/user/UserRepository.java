package com.agro.user;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    Optional<User> findById(Long id);

    Optional<User> findByUsername(String username);

    @org.springframework.data.jpa.repository.Query("SELECT u FROM User u WHERE LOWER(u.username) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(u.name) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(u.lastname) LIKE LOWER(CONCAT('%', :query, '%'))")
    java.util.List<User> findBySearchTerm(@org.springframework.data.repository.query.Param("query") String query);
}