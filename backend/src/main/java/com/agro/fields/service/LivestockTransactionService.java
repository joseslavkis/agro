package com.agro.fields.service;

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

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class LivestockTransactionService {

    private final LivestockTransactionRepository transactionRepository;
    private final FieldRepository fieldRepository;
    private final UserRepository userRepository;
    private final LivestockHistoryRepository livestockHistoryRepository;

    public LivestockTransactionService(LivestockTransactionRepository transactionRepository,
            FieldRepository fieldRepository,
            UserRepository userRepository,
            LivestockHistoryRepository livestockHistoryRepository) {
        this.transactionRepository = transactionRepository;
        this.fieldRepository = fieldRepository;
        this.userRepository = userRepository;
        this.livestockHistoryRepository = livestockHistoryRepository;
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

        LivestockTransaction saved = transactionRepository.save(transaction);
        return mapToDTO(saved);
    }

    @Transactional(readOnly = true)
    public List<LivestockTransactionResponseDTO> getTransactions(Long userId) {
        return transactionRepository.findByUserIdOrderByDateDesc(userId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
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
        return new LivestockTransactionResponseDTO(
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
    }
}
