package com.agro.agenda;

import com.agro.agenda.dto.AgendaCreateDTO;
import com.agro.agenda.dto.AgendaResponseDTO;
import com.agro.user.User;
import com.agro.user.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AgendaService {

    private final AgendaRepository agendaRepository;
    private final UserRepository userRepository;

    public AgendaService(AgendaRepository agendaRepository, UserRepository userRepository) {
        this.agendaRepository = agendaRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<AgendaResponseDTO> getMyEvents(Long userId) {
        return agendaRepository.findByUserId(userId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public AgendaResponseDTO createEvent(Long userId, AgendaCreateDTO createDTO) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        AgendaEvent event = new AgendaEvent();
        event.setTitle(createDTO.getTitle());
        event.setDescription(createDTO.getDescription());
        event.setStartDate(createDTO.getStartDate());
        event.setEndDate(createDTO.getEndDate());
        event.setEventType(createDTO.getEventType());
        event.setFieldId(createDTO.getFieldId());
        event.setUser(user);

        return mapToDTO(agendaRepository.save(event));
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public AgendaResponseDTO updateEvent(Long userId, Long eventId, AgendaCreateDTO updateDTO) {
        AgendaEvent event = agendaRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        if (!event.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }

        event.setTitle(updateDTO.getTitle());
        event.setDescription(updateDTO.getDescription());
        event.setStartDate(updateDTO.getStartDate());
        event.setEndDate(updateDTO.getEndDate());
        event.setEventType(updateDTO.getEventType());
        event.setFieldId(updateDTO.getFieldId());

        return mapToDTO(agendaRepository.save(event));
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void deleteEvent(Long userId, Long eventId) {
        AgendaEvent event = agendaRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        if (!event.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }

        agendaRepository.delete(event);
    }

    private AgendaResponseDTO mapToDTO(AgendaEvent event) {
        return new AgendaResponseDTO(
                event.getId(),
                event.getTitle(),
                event.getDescription(),
                event.getStartDate(),
                event.getEndDate(),
                event.getEventType(),
                event.getFieldId());
    }
}
