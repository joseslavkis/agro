package com.agro.fields.service;

import com.agro.fields.dto.FieldCreateDTO;
import com.agro.fields.dto.FieldResponseDTO;
import com.agro.fields.model.Field;
import com.agro.fields.repository.FieldRepository;
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

    public FieldService(FieldRepository fieldRepository, UserRepository userRepository) {
        this.fieldRepository = fieldRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<FieldResponseDTO> getFieldsByUserId(Long userId) {
        return fieldRepository.findByUserId(userId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
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

        if (photo == null && (createDTO.getPhoto() == null || createDTO.getPhoto().trim().isEmpty())) {
            photo = DEFAULT_PHOTOS.get((int) (Math.random() * DEFAULT_PHOTOS.size()));
        } else if (photo == null) {
            photo = createDTO.getPhoto();
        }

        Field field = new Field(createDTO.getName(), createDTO.getHectares(), photo, user);
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

    private FieldResponseDTO mapToDTO(Field field) {
        return new FieldResponseDTO(field.getId(), field.getName(), field.getHectares(), field.getPhoto());
    }
}
