package com.agro.fields.service;

import com.agro.fields.dto.FieldCreateDTO;
import com.agro.fields.dto.FieldResponseDTO;
import com.agro.fields.model.Field;
import com.agro.fields.model.LivestockHistory;
import com.agro.fields.repository.FieldRepository;
import com.agro.fields.repository.LivestockHistoryRepository;
import com.agro.user.User;
import com.agro.user.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class FieldService {

    private final FieldRepository fieldRepository;
    private final UserRepository userRepository;
    private final LivestockHistoryRepository livestockHistoryRepository;

    public FieldService(FieldRepository fieldRepository, UserRepository userRepository,
            LivestockHistoryRepository livestockHistoryRepository) {
        this.fieldRepository = fieldRepository;
        this.userRepository = userRepository;
        this.livestockHistoryRepository = livestockHistoryRepository;
    }

    @Transactional(readOnly = true)
    public List<FieldResponseDTO> getFieldsByUserId(Long userId) {
        return fieldRepository.findByUserId(userId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public FieldResponseDTO getFieldById(Long userId, Long fieldId) {
        Field field = fieldRepository.findById(fieldId)
                .orElseThrow(() -> new RuntimeException("Field not found"));

        if (!field.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized access to field");
        }

        return mapToDTO(field);
    }

    private static final List<String> DEFAULT_PHOTOS = List.of(
            "/fields_photos/pexels-despierres-cecile-93261-299031.jpg",
            "/fields_photos/pexels-kaip-585039.jpg",
            "/fields_photos/pexels-kelly-7446503.jpg",
            "/fields_photos/pexels-m-p-155330626-26236705.jpg",
            "/fields_photos/pexels-mikebirdy-448733.jpg",
            "/fields_photos/pexels-seb-116613-360013.jpg");

    @Transactional
    public FieldResponseDTO createField(Long userId, FieldCreateDTO createDTO,
            org.springframework.web.multipart.MultipartFile image) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String photo = null;
        if (image != null && !image.isEmpty()) {
            photo = saveImage(image);
        }

        if (createDTO.getHectares() <= 0) {
            throw new RuntimeException("Hectares must be greater than 0");
        }

        if (photo == null && (createDTO.getPhoto() == null || createDTO.getPhoto().trim().isEmpty())) {
            photo = DEFAULT_PHOTOS.get((int) (Math.random() * DEFAULT_PHOTOS.size()));
        } else if (photo == null) {
            photo = createDTO.getPhoto();
        }

        Field field = new Field(createDTO.getName(), createDTO.getHectares(), photo, user,
                createDTO.getHasAgriculture(), createDTO.getHasLivestock(), createDTO.getLatitude(),
                createDTO.getLongitude());

        if (createDTO.getCows() != null)
            field.setCows(createDTO.getCows());
        if (createDTO.getBulls() != null)
            field.setBulls(createDTO.getBulls());
        if (createDTO.getSteers() != null)
            field.setSteers(createDTO.getSteers());
        if (createDTO.getYoungSteers() != null)
            field.setYoungSteers(createDTO.getYoungSteers());
        if (createDTO.getHeifers() != null)
            field.setHeifers(createDTO.getHeifers());
        if (createDTO.getMaleCalves() != null)
            field.setMaleCalves(createDTO.getMaleCalves());
        if (createDTO.getFemaleCalves() != null)
            field.setFemaleCalves(createDTO.getFemaleCalves());

        Field savedField = fieldRepository.save(field);
        return mapToDTO(savedField);
    }

    @Transactional
    public void deleteField(Long userId, Long fieldId) {
        Field field = fieldRepository.findById(fieldId)
                .orElseThrow(() -> new RuntimeException("Field not found"));

        if (!field.getUser().getId().equals(userId)) {
            throw new RuntimeException("You are not authorized to delete this field");
        }

        fieldRepository.delete(field);
    }

    private String saveImage(org.springframework.web.multipart.MultipartFile image) {
        try {
            String uploadDir = "uploads/";
            java.io.File directory = new java.io.File(uploadDir);
            if (!directory.exists()) {
                directory.mkdirs();
            }

            String filename = java.util.UUID.randomUUID().toString() + "_" + image.getOriginalFilename();
            java.nio.file.Path filePath = java.nio.file.Paths.get(uploadDir + filename);
            java.nio.file.Files.write(filePath, image.getBytes());

            return "/uploads/" + filename;
        } catch (java.io.IOException e) {
            throw new RuntimeException("Failed to save image", e);
        }
    }

    @Transactional
    public FieldResponseDTO updateField(Long userId, Long fieldId, FieldCreateDTO updateDTO) {
        Field field = fieldRepository.findById(fieldId)
                .orElseThrow(() -> new RuntimeException("Field not found"));

        if (!field.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized access to field");
        }

        if (updateDTO.getHectares() <= 0) {
            throw new RuntimeException("Hectares must be greater than 0");
        }

        if (updateDTO.getName() != null)
            field.setName(updateDTO.getName());
        if (updateDTO.getHectares() != null)
            field.setHectares(updateDTO.getHectares());
        if (updateDTO.getHasAgriculture() != null)
            field.setHasAgriculture(updateDTO.getHasAgriculture());
        if (updateDTO.getHasLivestock() != null)
            field.setHasLivestock(updateDTO.getHasLivestock());
        if (updateDTO.getLatitude() != null)
            field.setLatitude(updateDTO.getLatitude());
        if (updateDTO.getLongitude() != null)
            field.setLongitude(updateDTO.getLongitude());

        Field updatedField = fieldRepository.save(field);
        return mapToDTO(updatedField);
    }

    private FieldResponseDTO mapToDTO(Field field) {
        return new FieldResponseDTO(field.getId(), field.getName(), field.getHectares(), field.getPhoto(),
                field.getHasAgriculture(), field.getHasLivestock(), field.getLatitude(), field.getLongitude(),
                field.getCows(), field.getBulls(), field.getSteers(), field.getYoungSteers(), field.getHeifers(),
                field.getMaleCalves(), field.getFemaleCalves());
    }

    @Transactional(readOnly = true)
    public List<com.agro.fields.dto.LivestockHistoryDTO> getLivestockHistory(Long userId, Long fieldId) {
        Field field = fieldRepository.findById(fieldId)
                .orElseThrow(() -> new RuntimeException("Field not found"));

        if (!field.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized access to field");
        }

        return livestockHistoryRepository.findByFieldIdOrderByDateAsc(fieldId).stream()
                .map(h -> new com.agro.fields.dto.LivestockHistoryDTO(h.getDate(), h.getCows(), h.getBulls(),
                        h.getSteers(), h.getYoungSteers(),
                        h.getHeifers(), h.getMaleCalves(), h.getFemaleCalves()))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<com.agro.fields.dto.LivestockHistoryDTO> getGlobalLivestockHistory(Long userId) {
        List<LivestockHistory> allHistory = livestockHistoryRepository.findByUserId(userId);

        // Map to store latest state of each field
        // FieldId -> LivestockHistory (representing counts)
        java.util.Map<Long, LivestockHistory> fieldStates = new java.util.HashMap<>();

        // Group by Date to handle multiple updates on same day
        java.util.Map<java.time.LocalDate, List<LivestockHistory>> byDate = allHistory.stream()
                .collect(Collectors.groupingBy(LivestockHistory::getDate, java.util.TreeMap::new, Collectors.toList()));

        List<com.agro.fields.dto.LivestockHistoryDTO> result = new java.util.ArrayList<>();

        // Accumulate state over time
        for (java.util.Map.Entry<java.time.LocalDate, List<LivestockHistory>> entry : byDate.entrySet()) {
            java.time.LocalDate date = entry.getKey();
            List<LivestockHistory> updates = entry.getValue();

            // Apply updates
            for (LivestockHistory update : updates) {
                fieldStates.put(update.getField().getId(), update);
            }

            // Calculate totals
            int cows = 0, bulls = 0, steers = 0, youngSteers = 0, heifers = 0, maleCalves = 0, femaleCalves = 0;

            for (LivestockHistory state : fieldStates.values()) {
                cows += state.getCows();
                bulls += state.getBulls();
                steers += state.getSteers();
                youngSteers += state.getYoungSteers();
                heifers += state.getHeifers();
                maleCalves += state.getMaleCalves();
                femaleCalves += state.getFemaleCalves();
            }

            result.add(new com.agro.fields.dto.LivestockHistoryDTO(
                    date, cows, bulls, steers, youngSteers, heifers, maleCalves, femaleCalves));
        }

        return result;
    }
}
