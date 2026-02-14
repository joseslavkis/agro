package com.agro.fields.service;

import com.agro.agenda.AgendaEvent;
import com.agro.agenda.AgendaService;
import com.agro.agenda.dto.AgendaCreateDTO;
import com.agro.agenda.dto.AgendaResponseDTO;
import com.agro.currency.ExchangeRateException;
import com.agro.currency.ExchangeRateService;
import com.agro.fields.dto.LivestockExpenseCreateDTO;
import com.agro.fields.dto.LivestockExpenseResponseDTO;
import com.agro.fields.model.LivestockExpense;
import com.agro.fields.repository.FieldRepository;
import com.agro.fields.repository.LivestockExpenseRepository;
import com.agro.user.User;
import com.agro.user.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class LivestockExpenseService {

    private final LivestockExpenseRepository expenseRepository;
    private final FieldRepository fieldRepository;
    private final UserRepository userRepository;
    private final ExchangeRateService exchangeRateService;
    private final AgendaService agendaService;

    public LivestockExpenseService(LivestockExpenseRepository expenseRepository,
            FieldRepository fieldRepository,
            UserRepository userRepository,
            ExchangeRateService exchangeRateService,
            AgendaService agendaService) {
        this.expenseRepository = expenseRepository;
        this.fieldRepository = fieldRepository;
        this.userRepository = userRepository;
        this.exchangeRateService = exchangeRateService;
        this.agendaService = agendaService;
    }

    @Transactional
    public LivestockExpenseResponseDTO createExpense(Long userId, LivestockExpenseCreateDTO dto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        LivestockExpense expense = new LivestockExpense();
        expense.setUser(user);
        expense.setName(dto.getName());
        expense.setFieldId(dto.getFieldId());
        expense.setCost(dto.getCost());
        expense.setNote(dto.getNote());
        expense.setDate(dto.getDate());

        // Handle currency conversion
        updateCostUSD(expense, dto);

        LivestockExpense saved = expenseRepository.save(expense);

        // Create corresponding calendar event
        createCalendarEvent(saved, user);

        return mapToDTO(saved);
    }

    @Transactional(readOnly = true)
    public List<LivestockExpenseResponseDTO> getExpenses(Long userId) {
        return expenseRepository.findByUserIdOrderByDateDesc(userId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public LivestockExpenseResponseDTO updateExpense(Long expenseId, Long userId, LivestockExpenseCreateDTO dto) {
        LivestockExpense expense = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new RuntimeException("Expense not found"));

        if (!expense.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }

        expense.setName(dto.getName());
        expense.setFieldId(dto.getFieldId());
        expense.setCost(dto.getCost());
        expense.setNote(dto.getNote());
        expense.setDate(dto.getDate());

        // Handle currency conversion
        updateCostUSD(expense, dto);

        LivestockExpense saved = expenseRepository.save(expense);

        // Update associated agenda event if exists
        if (saved.getAgendaEventId() != null) {
            try {
                updateAgendaEvent(saved);
            } catch (Exception e) {
                System.err.println("Failed to update calendar event: " + e.getMessage());
            }
        }

        return mapToDTO(saved);
    }

    @Transactional
    public void deleteExpense(Long expenseId, Long userId) {
        LivestockExpense expense = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new RuntimeException("Expense not found"));

        if (!expense.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }

        // Delete associated calendar event if exists
        if (expense.getAgendaEventId() != null) {
            try {
                agendaService.deleteEvent(expense.getUser().getId(), expense.getAgendaEventId());
            } catch (Exception e) {
                System.err.println("Failed to delete calendar event: " + e.getMessage());
            }
        }

        expenseRepository.delete(expense);
    }

    private void updateCostUSD(LivestockExpense expense, LivestockExpenseCreateDTO dto) {
        String currency = dto.getCurrency() != null ? dto.getCurrency() : "USD";
        expense.setCurrency(currency);

        if ("ARS".equals(currency)) {
            BigDecimal exchangeRate = dto.getExchangeRate();
            if (exchangeRate == null) {
                try {
                    exchangeRate = exchangeRateService.getCurrentExchangeRate();
                } catch (ExchangeRateException e) {
                    throw new RuntimeException("Failed to get exchange rate. Please provide it manually.", e);
                }
            }
            expense.setExchangeRate(exchangeRate);
            expense.setCostUSD(dto.getCost().divide(exchangeRate, 2, RoundingMode.HALF_UP));
        } else {
            // USD - no conversion needed
            expense.setCostUSD(dto.getCost());
        }
    }

    private void createCalendarEvent(LivestockExpense expense, User user) {
        try {
            AgendaCreateDTO agendaDto = new AgendaCreateDTO();
            agendaDto.setTitle("💸 Gasto: " + expense.getName());
            agendaDto.setDescription(buildEventDescription(expense));
            agendaDto.setEventType(AgendaEvent.EventType.LIVESTOCK_EXPENSE);
            agendaDto.setStartDate(expense.getDate().atStartOfDay());
            agendaDto.setEndDate(expense.getDate().atTime(23, 59));
            agendaDto.setFieldId(expense.getFieldId());

            AgendaResponseDTO agendaResponse = agendaService.createEvent(user.getId(), agendaDto);
            if (agendaResponse != null && agendaResponse.getId() != null) {
                expense.setAgendaEventId(agendaResponse.getId());
                expenseRepository.save(expense);
            }
        } catch (Exception e) {
            System.err.println("Failed to create calendar event for expense " +
                    expense.getId() + ": " + e.getMessage());
            e.printStackTrace();
        }
    }

    private void updateAgendaEvent(LivestockExpense expense) {
        AgendaCreateDTO updateDto = new AgendaCreateDTO();
        updateDto.setTitle("💸 Gasto: " + expense.getName());
        updateDto.setDescription(buildEventDescription(expense));
        updateDto.setStartDate(expense.getDate().atStartOfDay());
        updateDto.setEndDate(expense.getDate().atTime(23, 59));
        updateDto.setEventType(AgendaEvent.EventType.LIVESTOCK_EXPENSE);
        updateDto.setFieldId(expense.getFieldId());

        agendaService.updateEvent(expense.getUser().getId(), expense.getAgendaEventId(), updateDto);
    }

    private String buildEventDescription(LivestockExpense expense) {
        StringBuilder desc = new StringBuilder();
        desc.append("Gasto de ganadería\n");
        desc.append("Costo: ").append(expense.getCurrency()).append(" ").append(expense.getCost()).append("\n");
        if (expense.getCostUSD() != null && !"USD".equals(expense.getCurrency())) {
            desc.append("Costo USD: $").append(expense.getCostUSD()).append("\n");
        }
        if (expense.getNote() != null && !expense.getNote().isEmpty()) {
            desc.append("Nota: ").append(expense.getNote());
        }
        return desc.toString();
    }

    private LivestockExpenseResponseDTO mapToDTO(LivestockExpense e) {
        String fieldName = null;
        if (e.getFieldId() != null) {
            fieldName = fieldRepository.findById(e.getFieldId())
                    .map(f -> f.getName())
                    .orElse(null);
        }

        return new LivestockExpenseResponseDTO(
                e.getId(),
                e.getName(),
                e.getFieldId(),
                fieldName,
                e.getCost(),
                e.getCurrency(),
                e.getExchangeRate(),
                e.getCostUSD(),
                e.getNote(),
                e.getDate(),
                e.getAgendaEventId());
    }
}
