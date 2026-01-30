package com.agro.fields.controller;

import com.agro.fields.dto.FieldCreateDTO;
import com.agro.fields.dto.FieldResponseDTO;
import com.agro.fields.service.FieldService;
import com.agro.user.User;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/fields")
@SecurityRequirement(name = "bearer-key")
public class FieldController {

    private final FieldService fieldService;

    public FieldController(FieldService fieldService) {
        this.fieldService = fieldService;
    }

    @GetMapping
    public ResponseEntity<List<FieldResponseDTO>> getMyFields(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(fieldService.getFieldsByUserId(user.getId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<FieldResponseDTO> getField(@AuthenticationPrincipal User user, @PathVariable Long id) {
        return ResponseEntity.ok(fieldService.getFieldById(user.getId(), id));
    }

    @PostMapping
    public ResponseEntity<FieldResponseDTO> createField(@AuthenticationPrincipal User user,
            @RequestPart("field") FieldCreateDTO createDTO,
            @RequestPart(value = "image", required = false) org.springframework.web.multipart.MultipartFile image) {
        try {
            System.out.println("Received createField request for: " + createDTO.getName());
            if (user == null) {
                System.out.println("User is null! Request was allowed publicly but no user context found.");
                return ResponseEntity.status(401).build();
            }
            return ResponseEntity.ok(fieldService.createField(user.getId(), createDTO, image));
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Error creating field: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteField(@AuthenticationPrincipal User user, @PathVariable Long id) {
        try {
            System.out.println("Received delete request for field ID: " + id);
            if (user == null) {
                System.out.println("User is null during delete request!");
                return ResponseEntity.status(401).build();
            }
            fieldService.deleteField(user.getId(), id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            System.out.println("Error deleting field: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<FieldResponseDTO> updateField(@AuthenticationPrincipal User user, @PathVariable Long id,
            @RequestBody FieldCreateDTO updateDTO) {
        return ResponseEntity.ok(fieldService.updateField(user.getId(), id, updateDTO));
    }
}
