package com.agro.fields.repository;

import com.agro.fields.model.RainfallRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RainfallRecordRepository extends JpaRepository<RainfallRecord, Long> {
    List<RainfallRecord> findByFieldIdAndFieldUserIdOrderByDateDesc(Long fieldId, Long userId);
}
