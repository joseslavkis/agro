package com.agro.agenda;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AgendaRepository extends JpaRepository<AgendaEvent, Long> {
    List<AgendaEvent> findByUserId(Long userId);

    List<AgendaEvent> findByUserIdAndFieldId(Long userId, Long fieldId);
}
