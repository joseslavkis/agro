package com.agro.agenda;

import com.agro.agenda.dto.AgendaCreateDTO;
import com.agro.agenda.dto.AgendaResponseDTO;
import com.agro.user.User;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/agenda")
@SecurityRequirement(name = "bearer-key")
public class AgendaController {

    private final AgendaService agendaService;

    public AgendaController(AgendaService agendaService) {
        this.agendaService = agendaService;
    }

    @GetMapping
    public ResponseEntity<List<AgendaResponseDTO>> getMyEvents(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(agendaService.getMyEvents(user.getId()));
    }

    @PostMapping
    public ResponseEntity<AgendaResponseDTO> createEvent(@AuthenticationPrincipal User user,
            @jakarta.validation.Valid @RequestBody AgendaCreateDTO createDTO) {
        return ResponseEntity.ok(agendaService.createEvent(user.getId(), createDTO));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AgendaResponseDTO> updateEvent(@AuthenticationPrincipal User user, @PathVariable Long id,
            @jakarta.validation.Valid @RequestBody AgendaCreateDTO updateDTO) {
        return ResponseEntity.ok(agendaService.updateEvent(user.getId(), id, updateDTO));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEvent(@AuthenticationPrincipal User user, @PathVariable Long id) {
        agendaService.deleteEvent(user.getId(), id);
        return ResponseEntity.noContent().build();
    }
}
