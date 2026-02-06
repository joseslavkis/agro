package com.agro.fields.service;

import com.agro.agenda.AgendaEvent;
import com.agro.agenda.AgendaService;
import com.agro.agenda.dto.AgendaCreateDTO;
import com.agro.agenda.dto.AgendaResponseDTO;
import com.agro.currency.ExchangeRateException;
import com.agro.currency.ExchangeRateService;
import com.agro.fields.dto.LivestockTransactionCreateDTO;
import com.agro.fields.dto.LivestockTransactionResponseDTO;
import com.agro.fields.model.*;
import com.agro.fields.repository.FieldRepository;
import com.agro.fields.repository.LivestockHistoryRepository;
import com.agro.fields.repository.LivestockTransactionRepository;
import com.agro.user.User;
import com.agro.user.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class LivestockTransactionService {

    private final LivestockTransactionRepository transactionRepository;
    private final FieldRepository fieldRepository;
    private final UserRepository userRepository;
    private final LivestockHistoryRepository livestockHistoryRepository;
    private final ExchangeRateService exchangeRateService;
    private final AgendaService agendaService;

    public LivestockTransactionService(LivestockTransactionRepository transactionRepository,
            FieldRepository fieldRepository,
            UserRepository userRepository,
            LivestockHistoryRepository livestockHistoryRepository,
            ExchangeRateService exchangeRateService,
            AgendaService agendaService) {
        this.transactionRepository = transactionRepository;
        this.fieldRepository = fieldRepository;
        this.userRepository = userRepository;
        this.livestockHistoryRepository = livestockHistoryRepository;
        this.exchangeRateService = exchangeRateService;
        this.agendaService = agendaService;
    }

    @Transactional
    public LivestockTransactionResponseDTO createTransaction(Long userId, LivestockTransactionCreateDTO dto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Field sourceField = null;
        if (dto.getSourceFieldId() != null) {
            sourceField = fieldRepository.findById(dto.getSourceFieldId())
                    .orElseThrow(() -> new RuntimeException("Source field not found"));
            if (!sourceField.getUser().getId().equals(userId)) {
                throw new RuntimeException("Unauthorized access to source field");
            }
        }

        Field targetField = null;
        if (dto.getTargetFieldId() != null) {
            targetField = fieldRepository.findById(dto.getTargetFieldId())
                    .orElseThrow(() -> new RuntimeException("Target field not found"));
            if (!targetField.getUser().getId().equals(userId)) {
                throw new RuntimeException("Unauthorized access to target field");
            }
        }

        Integer qty = dto.getQuantity();
        if (qty == null || qty <= 0) {
            throw new RuntimeException("Quantity must be positive");
        }

        // Logic based on Action Type
        switch (dto.getActionType()) {
            case BIRTH:
            case PURCHASE:
                if (targetField == null)
                    throw new RuntimeException("Target field is required for " + dto.getActionType());
                increaseStock(targetField, dto.getCategory(), qty);
                break;
            case DEATH:
            case SALE:
                if (sourceField == null)
                    throw new RuntimeException("Source field is required for " + dto.getActionType());
                decreaseStock(sourceField, dto.getCategory(), qty);
                break;
            case MOVE:
                if (sourceField == null || targetField == null)
                    throw new RuntimeException("Source and Target fields are required for MOVE");
                decreaseStock(sourceField, dto.getCategory(), qty);
                increaseStock(targetField, dto.getCategory(), qty);
                break;
        }

        // Save fields and history
        if (sourceField != null) {
            fieldRepository.save(sourceField);
            saveHistory(sourceField);
        }
        if (targetField != null) {
            fieldRepository.save(targetField);
            saveHistory(targetField);
        }

        // Save transaction
        LivestockTransaction transaction = new LivestockTransaction(
                user,
                sourceField,
                targetField,
                dto.getCategory(),
                qty,
                dto.getActionType(),
                dto.getDate() != null ? dto.getDate() : LocalDate.now(),
                dto.getNotes());

        // Handle currency conversion for financial tracking
        if (dto.getPricePerUnit() != null) {
            transaction.setPricePerUnit(dto.getPricePerUnit());
            transaction.setCurrency(dto.getCurrency() != null ? dto.getCurrency() : "USD");

            // Convert to USD if currency is ARS
            if ("ARS".equals(transaction.getCurrency())) {
                BigDecimal exchangeRate = dto.getExchangeRate();
                if (exchangeRate == null) {
                    try {
                        exchangeRate = exchangeRateService.getCurrentExchangeRate();
                    } catch (ExchangeRateException e) {
                        throw new RuntimeException("Failed to get exchange rate. Please provide it manually.", e);
                    }
                }
                transaction.setExchangeRate(exchangeRate);
                transaction.setPricePerUnitUSD(dto.getPricePerUnit().divide(exchangeRate, 2, RoundingMode.HALF_UP));

                // Convert salvage value if present
                if (dto.getSalvageValue() != null) {
                    transaction.setSalvageValue(dto.getSalvageValue());
                    transaction.setSalvageValueUSD(dto.getSalvageValue().divide(exchangeRate, 2, RoundingMode.HALF_UP));
                }
            } else {
                // USD - no conversion needed
                transaction.setPricePerUnitUSD(dto.getPricePerUnit());
                if (dto.getSalvageValue() != null) {
                    transaction.setSalvageValue(dto.getSalvageValue());
                    transaction.setSalvageValueUSD(dto.getSalvageValue());
                }
            }
        }

        LivestockTransaction saved = transactionRepository.save(transaction);

        // Create corresponding calendar event (non-critical, don't fail if it errors)
        createCalendarEventAsync(saved, user);

        return mapToDTO(saved);
    }

    @Transactional(readOnly = true)
    public List<LivestockTransactionResponseDTO> getTransactions(Long userId) {
        return transactionRepository.findByUserIdOrderByDateDesc(userId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public LivestockTransactionResponseDTO updateTransaction(Long transactionId, Long userId,
            LivestockTransactionCreateDTO dto) {
        LivestockTransaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));

        if (!transaction.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }

        // Revert old transaction effect
        // If it was an action that INCREASED stock on target, we DECREASE it.
        // If it was an action that DECREASED stock on source, we INCREASE it.
        Field sourceField = transaction.getSourceField();
        Field targetField = transaction.getTargetField();
        Integer oldQty = transaction.getQuantity();
        LivestockCategory oldCategory = transaction.getCategory();

        // Revert logic
        switch (transaction.getActionType()) {
            case BIRTH:
            case PURCHASE:
                // Originally increased target. Revert by decreasing target.
                if (targetField != null) {
                    decreaseStock(targetField, oldCategory, oldQty);
                    fieldRepository.save(targetField);
                }
                break;
            case DEATH:
            case SALE:
                // Originally decreased source. Revert by increasing source.
                if (sourceField != null) {
                    increaseStock(sourceField, oldCategory, oldQty);
                    fieldRepository.save(sourceField);
                }
                break;
            case MOVE:
                // Originally decreased source, increased target.
                // Revert: increase source, decrease target.
                if (sourceField != null) {
                    increaseStock(sourceField, oldCategory, oldQty);
                    fieldRepository.save(sourceField);
                }
                if (targetField != null) {
                    decreaseStock(targetField, oldCategory, oldQty);
                    fieldRepository.save(targetField);
                }
                break;
        }

        // Now apply NEW transaction details
        // Note: For simplicity, we assume Source/Target fields CANNOT be changed in an
        // update, only Quantity/Date/Notes/Category.
        // If Source/Target needed to change, it would require re-fetching fields.
        // Let's assume for now the user is fixing a mistake in numbers or date.
        // If they want to change the FIELD, they should delete and re-create.

        // Update basic fields
        transaction.setQuantity(dto.getQuantity());
        transaction.setDate(dto.getDate());
        transaction.setNotes(dto.getNotes());
        transaction.setCategory(dto.getCategory());
        // Note: Changing category also requires re-applying stock logic to the NEW
        // category.

        Integer newQty = dto.getQuantity();
        LivestockCategory newCategory = dto.getCategory();

        // Apply new logic
        switch (transaction.getActionType()) {
            case BIRTH:
            case PURCHASE:
                if (targetField != null) {
                    increaseStock(targetField, newCategory, newQty);
                    fieldRepository.save(targetField);
                    saveHistory(targetField);
                }
                break;
            case DEATH:
            case SALE:
                if (sourceField != null) {
                    decreaseStock(sourceField, newCategory, newQty);
                    fieldRepository.save(sourceField);
                    saveHistory(sourceField);
                }
                break;
            case MOVE:
                if (sourceField != null) {
                    decreaseStock(sourceField, newCategory, newQty);
                    fieldRepository.save(sourceField);
                    saveHistory(sourceField);
                }
                if (targetField != null) {
                    increaseStock(targetField, newCategory, newQty);
                    fieldRepository.save(targetField);
                    saveHistory(targetField);
                }
                break;
        }

        LivestockTransaction saved = transactionRepository.save(transaction);

        // Update financial fields if present
        if (dto.getPricePerUnit() != null) {
            updateFinancialFields(saved, dto);
            saved = transactionRepository.save(saved);
        }

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
    public void deleteTransaction(Long transactionId, Long userId) {
        LivestockTransaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));

        if (!transaction.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }

        Field sourceField = transaction.getSourceField();
        Field targetField = transaction.getTargetField();
        Integer quantity = transaction.getQuantity();
        LivestockCategory category = transaction.getCategory();

        // Revert effect before deleting
        switch (transaction.getActionType()) {
            case BIRTH:
            case PURCHASE:
                if (targetField != null) {
                    decreaseStock(targetField, category, quantity);
                    fieldRepository.save(targetField);
                    saveHistory(targetField);
                }
                break;
            case DEATH:
            case SALE:
                if (sourceField != null) {
                    increaseStock(sourceField, category, quantity);
                    fieldRepository.save(sourceField);
                    saveHistory(sourceField);
                }
                break;
            case MOVE:
                if (sourceField != null) {
                    increaseStock(sourceField, category, quantity);
                    fieldRepository.save(sourceField);
                    saveHistory(sourceField);
                }
                if (targetField != null) {
                    decreaseStock(targetField, category, quantity);
                    fieldRepository.save(targetField);
                    saveHistory(targetField);
                }
                break;
        }

        // Delete associated calendar event if exists
        if (transaction.getAgendaEventId() != null) {
            try {
                agendaService.deleteEvent(transaction.getAgendaEventId(), userId);
            } catch (Exception e) {
                // Log error but continue with transaction deletion
                System.err.println("Failed to delete calendar event: " + e.getMessage());
            }
        }

        transactionRepository.delete(transaction);
    }

    private void increaseStock(Field field, LivestockCategory category, int amount) {
        switch (category) {
            case COWS:
                field.setCows((field.getCows() == null ? 0 : field.getCows()) + amount);
                break;
            case BULLS:
                field.setBulls((field.getBulls() == null ? 0 : field.getBulls()) + amount);
                break;
            case STEERS:
                field.setSteers((field.getSteers() == null ? 0 : field.getSteers()) + amount);
                break;
            case YOUNG_STEERS:
                field.setYoungSteers((field.getYoungSteers() == null ? 0 : field.getYoungSteers()) + amount);
                break;
            case HEIFERS:
                field.setHeifers((field.getHeifers() == null ? 0 : field.getHeifers()) + amount);
                break;
            case MALE_CALVES:
                field.setMaleCalves((field.getMaleCalves() == null ? 0 : field.getMaleCalves()) + amount);
                break;
            case FEMALE_CALVES:
                field.setFemaleCalves((field.getFemaleCalves() == null ? 0 : field.getFemaleCalves()) + amount);
                break;
        }
    }

    private void decreaseStock(Field field, LivestockCategory category, int amount) {
        int current = 0;
        switch (category) {
            case COWS:
                current = field.getCows() == null ? 0 : field.getCows();
                break;
            case BULLS:
                current = field.getBulls() == null ? 0 : field.getBulls();
                break;
            case STEERS:
                current = field.getSteers() == null ? 0 : field.getSteers();
                break;
            case YOUNG_STEERS:
                current = field.getYoungSteers() == null ? 0 : field.getYoungSteers();
                break;
            case HEIFERS:
                current = field.getHeifers() == null ? 0 : field.getHeifers();
                break;
            case MALE_CALVES:
                current = field.getMaleCalves() == null ? 0 : field.getMaleCalves();
                break;
            case FEMALE_CALVES:
                current = field.getFemaleCalves() == null ? 0 : field.getFemaleCalves();
                break;
        }

        if (current < amount) {
            throw new RuntimeException("Insufficient stock in field " + field.getName() + " for category " + category);
        }

        switch (category) {
            case COWS:
                field.setCows(current - amount);
                break;
            case BULLS:
                field.setBulls(current - amount);
                break;
            case STEERS:
                field.setSteers(current - amount);
                break;
            case YOUNG_STEERS:
                field.setYoungSteers(current - amount);
                break;
            case HEIFERS:
                field.setHeifers(current - amount);
                break;
            case MALE_CALVES:
                field.setMaleCalves(current - amount);
                break;
            case FEMALE_CALVES:
                field.setFemaleCalves(current - amount);
                break;
        }
    }

    private void saveHistory(Field field) {
        LivestockHistory history = new LivestockHistory(field, LocalDate.now(),
                field.getCows(), field.getBulls(), field.getSteers(), field.getYoungSteers(),
                field.getHeifers(), field.getMaleCalves(), field.getFemaleCalves());
        livestockHistoryRepository.save(history);
    }

    private LivestockTransactionResponseDTO mapToDTO(LivestockTransaction t) {
        LivestockTransactionResponseDTO dto = new LivestockTransactionResponseDTO(
                t.getId(),
                t.getActionType(),
                t.getCategory(),
                t.getQuantity(),
                t.getSourceField() != null ? t.getSourceField().getId() : null,
                t.getSourceField() != null ? t.getSourceField().getName() : null,
                t.getTargetField() != null ? t.getTargetField().getId() : null,
                t.getTargetField() != null ? t.getTargetField().getName() : null,
                t.getDate(),
                t.getNotes());

        // Add financial fields
        dto.setPricePerUnit(t.getPricePerUnit());
        dto.setCurrency(t.getCurrency());
        dto.setExchangeRate(t.getExchangeRate());
        dto.setPricePerUnitUSD(t.getPricePerUnitUSD());
        dto.setSalvageValue(t.getSalvageValue());
        dto.setSalvageValueUSD(t.getSalvageValueUSD());
        dto.setAgendaEventId(t.getAgendaEventId());

        // Calculate total value in USD
        if (t.getPricePerUnitUSD() != null) {
            BigDecimal totalValue = t.getPricePerUnitUSD().multiply(new BigDecimal(t.getQuantity()));
            dto.setTotalValueUSD(totalValue);
        }

        return dto;
    }

    /**
     * Create a calendar event from a livestock transaction
     */
    private AgendaResponseDTO createAgendaEventFromTransaction(LivestockTransaction transaction, User user) {
        String title = buildEventTitle(transaction);
        String description = buildEventDescription(transaction);
        AgendaEvent.EventType eventType = mapTransactionToEventType(transaction.getActionType());

        AgendaCreateDTO agendaDto = new AgendaCreateDTO();
        agendaDto.setTitle(title);
        agendaDto.setDescription(description);
        agendaDto.setEventType(eventType);
        agendaDto.setStartDate(transaction.getDate().atStartOfDay());
        agendaDto.setEndDate(transaction.getDate().atTime(23, 59));

        // Set field ID based on transaction type
        Long fieldId = getFieldIdFromTransaction(transaction);
        agendaDto.setFieldId(fieldId);

        return agendaService.createEvent(user.getId(), agendaDto);
    }

    private String buildEventTitle(LivestockTransaction t) {
        return switch (t.getActionType()) {
            case PURCHASE -> "Compra: " + t.getQuantity() + " " + getCategoryName(t.getCategory());
            case SALE -> "Venta: " + t.getQuantity() + " " + getCategoryName(t.getCategory());
            case DEATH -> "Muerte: " + t.getQuantity() + " " + getCategoryName(t.getCategory());
            case BIRTH -> "Nacimiento: " + t.getQuantity() + " " + getCategoryName(t.getCategory());
            case MOVE -> "Movimiento: " + t.getQuantity() + " " + getCategoryName(t.getCategory());
        };
    }

    private String buildEventDescription(LivestockTransaction t) {
        StringBuilder desc = new StringBuilder();
        desc.append("Transacción de ganadería: ").append(t.getActionType()).append("\n");
        desc.append("Categoría: ").append(getCategoryName(t.getCategory())).append("\n");
        desc.append("Cantidad: ").append(t.getQuantity()).append("\n");

        if (t.getSourceField() != null) {
            desc.append("Campo origen: ").append(t.getSourceField().getName()).append("\n");
        }
        if (t.getTargetField() != null) {
            desc.append("Campo destino: ").append(t.getTargetField().getName()).append("\n");
        }
        if (t.getPricePerUnitUSD() != null) {
            desc.append("Precio unitario: USD ").append(t.getPricePerUnitUSD()).append("\n");
        }
        if (t.getNotes() != null && !t.getNotes().isEmpty()) {
            desc.append("Notas: ").append(t.getNotes());
        }

        return desc.toString();
    }

    private AgendaEvent.EventType mapTransactionToEventType(LivestockActionType actionType) {
        return switch (actionType) {
            case PURCHASE -> AgendaEvent.EventType.PURCHASE;
            case SALE -> AgendaEvent.EventType.SALE;
            case DEATH -> AgendaEvent.EventType.HEALTH;
            case BIRTH -> AgendaEvent.EventType.LIVESTOCK_BIRTH;
            case MOVE -> AgendaEvent.EventType.LIVESTOCK_MOVE;
        };
    }

    private Long getFieldIdFromTransaction(LivestockTransaction transaction) {
        // Priority: target field for births/purchases, source field otherwise
        if (transaction.getTargetField() != null) {
            return transaction.getTargetField().getId();
        } else if (transaction.getSourceField() != null) {
            return transaction.getSourceField().getId();
        }
        return null;
    }

    private String getCategoryName(LivestockCategory category) {
        return switch (category) {
            case COWS -> "Vacas";
            case BULLS -> "Toros";
            case STEERS -> "Novillos";
            case YOUNG_STEERS -> "Novillitos";
            case HEIFERS -> "Vaquillonas";
            case MALE_CALVES -> "Terneros";
            case FEMALE_CALVES -> "Terneras";
        };
    }

    /**
     * Create calendar event asynchronously to avoid transaction rollback issues
     */
    private void createCalendarEventAsync(LivestockTransaction transaction, User user) {
        try {
            AgendaResponseDTO agendaResponse = createAgendaEventFromTransaction(transaction, user);
            if (agendaResponse != null && agendaResponse.getId() != null) {
                transaction.setAgendaEventId(agendaResponse.getId());
                transactionRepository.save(transaction);
            }
        } catch (Exception e) {
            // Log error but don't fail the main transaction
            System.err.println("Failed to create calendar event for transaction " +
                    transaction.getId() + ": " + e.getMessage());
            e.printStackTrace();
        }
    }

    private void updateFinancialFields(LivestockTransaction transaction, LivestockTransactionCreateDTO dto) {
        transaction.setPricePerUnit(dto.getPricePerUnit());
        transaction.setCurrency(dto.getCurrency() != null ? dto.getCurrency() : "USD");

        // Convert to USD if currency is ARS
        if ("ARS".equals(transaction.getCurrency())) {
            BigDecimal exchangeRate = dto.getExchangeRate();
            if (exchangeRate == null) {
                try {
                    exchangeRate = exchangeRateService.getCurrentExchangeRate();
                } catch (ExchangeRateException e) {
                    throw new RuntimeException("Failed to get exchange rate. Please provide it manually.", e);
                }
            }
            transaction.setExchangeRate(exchangeRate);
            transaction.setPricePerUnitUSD(dto.getPricePerUnit().divide(exchangeRate, 2, RoundingMode.HALF_UP));

            // Convert salvage value if present
            if (dto.getSalvageValue() != null) {
                transaction.setSalvageValue(dto.getSalvageValue());
                transaction.setSalvageValueUSD(dto.getSalvageValue().divide(exchangeRate, 2, RoundingMode.HALF_UP));
            }
        } else {
            // USD - no conversion needed
            transaction.setPricePerUnitUSD(dto.getPricePerUnit());
            if (dto.getSalvageValue() != null) {
                transaction.setSalvageValue(dto.getSalvageValue());
                transaction.setSalvageValueUSD(dto.getSalvageValue());
            }
        }
    }

    private void updateAgendaEvent(LivestockTransaction transaction) {
        AgendaEvent.EventType eventType = mapTransactionToEventType(transaction.getActionType());
        String title = buildEventTitle(transaction);
        String description = buildEventDescription(transaction);

        AgendaCreateDTO updateDto = new AgendaCreateDTO();
        updateDto.setTitle(title);
        updateDto.setDescription(description);
        updateDto.setStartDate(transaction.getDate().atStartOfDay());
        updateDto.setEndDate(transaction.getDate().atTime(23, 59));
        updateDto.setEventType(eventType);
        updateDto.setFieldId(transaction.getTargetField() != null ? transaction.getTargetField().getId()
                : (transaction.getSourceField() != null ? transaction.getSourceField().getId() : null));

        agendaService.updateEvent(transaction.getUser().getId(), transaction.getAgendaEventId(), updateDto);
    }
}
