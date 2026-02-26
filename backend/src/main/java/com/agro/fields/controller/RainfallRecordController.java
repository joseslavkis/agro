package com.agro.fields.controller;

import com.agro.fields.dto.RainfallRecordCreateDTO;
import com.agro.fields.dto.RainfallRecordResponseDTO;
import com.agro.fields.service.RainfallRecordService;
import com.agro.user.User;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/fields/{fieldId}/rainfall")
@SecurityRequirement(name = "bearer-key")
public class RainfallRecordController {

    private final RainfallRecordService rainfallService;

    public RainfallRecordController(RainfallRecordService rainfallService) {
        this.rainfallService = rainfallService;
    }

    @PostMapping
    public ResponseEntity<RainfallRecordResponseDTO> createRecord(
            @AuthenticationPrincipal User user,
            @PathVariable Long fieldId,
            @jakarta.validation.Valid @RequestBody RainfallRecordCreateDTO dto) {
        return ResponseEntity.ok(rainfallService.createRecord(user.getId(), fieldId, dto));
    }

    @GetMapping
    public ResponseEntity<List<RainfallRecordResponseDTO>> getRecords(
            @AuthenticationPrincipal User user,
            @PathVariable Long fieldId) {
        return ResponseEntity.ok(rainfallService.getRecordsByField(user.getId(), fieldId));
    }

    @DeleteMapping("/{recordId}")
    public ResponseEntity<Void> deleteRecord(
            @AuthenticationPrincipal User user,
            @PathVariable Long fieldId,
            @PathVariable Long recordId) {
        rainfallService.deleteRecord(user.getId(), recordId);
        return ResponseEntity.noContent().build();
    }
}
