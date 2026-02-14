package com.agro.fields.repository;

import com.agro.fields.model.LivestockExpense;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LivestockExpenseRepository extends JpaRepository<LivestockExpense, Long> {
    List<LivestockExpense> findByUserIdOrderByDateDesc(Long userId);
}
