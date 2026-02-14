package com.agro.fields.controller;

import com.agro.fields.dto.LivestockExpenseCreateDTO;
import com.agro.fields.dto.LivestockExpenseResponseDTO;
import com.agro.fields.service.LivestockExpenseService;
import com.agro.user.User;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/livestock")
public class LivestockExpenseController {

    private final LivestockExpenseService expenseService;

    public LivestockExpenseController(LivestockExpenseService expenseService) {
        this.expenseService = expenseService;
    }

    @PostMapping("/expense")
    public ResponseEntity<LivestockExpenseResponseDTO> createExpense(
            @AuthenticationPrincipal User user,
            @jakarta.validation.Valid @RequestBody LivestockExpenseCreateDTO dto) {
        return ResponseEntity.ok(expenseService.createExpense(user.getId(), dto));
    }

    @GetMapping("/expenses")
    public ResponseEntity<List<LivestockExpenseResponseDTO>> getExpenses(
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(expenseService.getExpenses(user.getId()));
    }

    @PutMapping("/expense/{id}")
    public ResponseEntity<LivestockExpenseResponseDTO> updateExpense(
            @PathVariable Long id,
            @AuthenticationPrincipal User user,
            @jakarta.validation.Valid @RequestBody LivestockExpenseCreateDTO dto) {
        return ResponseEntity.ok(expenseService.updateExpense(id, user.getId(), dto));
    }

    @DeleteMapping("/expense/{id}")
    public ResponseEntity<Void> deleteExpense(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        expenseService.deleteExpense(id, user.getId());
        return ResponseEntity.noContent().build();
    }
}
