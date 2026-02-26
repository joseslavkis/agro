package com.agro.fields.service;

import com.agro.fields.dto.RainfallRecordCreateDTO;
import com.agro.fields.dto.RainfallRecordResponseDTO;
import com.agro.fields.model.Field;
import com.agro.fields.model.RainfallRecord;
import com.agro.fields.repository.FieldRepository;
import com.agro.fields.repository.RainfallRecordRepository;
import com.agro.user.User;
import com.agro.user.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class RainfallRecordService {

    private final RainfallRecordRepository rainfallRepository;
    private final FieldRepository fieldRepository;
    private final UserRepository userRepository;

    public RainfallRecordService(RainfallRecordRepository rainfallRepository,
            FieldRepository fieldRepository,
            UserRepository userRepository) {
        this.rainfallRepository = rainfallRepository;
        this.fieldRepository = fieldRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public RainfallRecordResponseDTO createRecord(Long userId, Long fieldId, RainfallRecordCreateDTO dto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Field field = fieldRepository.findById(fieldId)
                .orElseThrow(() -> new RuntimeException("Field not found"));

        if (!field.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized: field does not belong to user");
        }

        RainfallRecord record = new RainfallRecord();
        record.setUser(user);
        record.setField(field);
        record.setDate(dto.getDate());
        record.setAmountMm(dto.getAmountMm());

        RainfallRecord saved = rainfallRepository.save(record);
        return mapToDTO(saved);
    }

    @Transactional(readOnly = true)
    public List<RainfallRecordResponseDTO> getRecordsByField(Long userId, Long fieldId) {
        return rainfallRepository.findByFieldIdAndFieldUserIdOrderByDateDesc(fieldId, userId)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteRecord(Long userId, Long recordId) {
        RainfallRecord record = rainfallRepository.findById(recordId)
                .orElseThrow(() -> new RuntimeException("Rainfall record not found"));

        if (!record.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }

        rainfallRepository.delete(record);
    }

    private RainfallRecordResponseDTO mapToDTO(RainfallRecord r) {
        return new RainfallRecordResponseDTO(
                r.getId(),
                r.getField().getId(),
                r.getDate(),
                r.getAmountMm());
    }
}
