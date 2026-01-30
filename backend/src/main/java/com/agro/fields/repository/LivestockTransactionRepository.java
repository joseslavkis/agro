package com.agro.fields.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.agro.fields.model.LivestockTransaction;
import java.util.List;

@Repository
public interface LivestockTransactionRepository extends JpaRepository<LivestockTransaction, Long> {
    List<LivestockTransaction> findByUserIdOrderByDateDesc(Long userId);
}
