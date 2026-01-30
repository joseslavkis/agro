package com.agro.fields.repository;

import com.agro.fields.model.LivestockHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface LivestockHistoryRepository extends JpaRepository<LivestockHistory, Long> {
    List<LivestockHistory> findByFieldIdOrderByDateAsc(Long fieldId);

    Optional<LivestockHistory> findByFieldIdAndDate(Long fieldId, LocalDate date);

    @org.springframework.data.jpa.repository.Query("SELECT h FROM LivestockHistory h JOIN h.field f WHERE f.user.id = :userId ORDER BY h.date ASC")
    List<LivestockHistory> findByUserId(@org.springframework.data.repository.query.Param("userId") Long userId);
}
