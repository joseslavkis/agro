package com.agro.fields.controller;

import com.agro.fields.dto.LivestockTransactionCreateDTO;
import com.agro.fields.dto.LivestockTransactionResponseDTO;
import com.agro.fields.service.LivestockTransactionService;
import com.agro.user.User;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/livestock")
public class LivestockTransactionController {

    private final LivestockTransactionService transactionService;

    public LivestockTransactionController(LivestockTransactionService transactionService) {
        this.transactionService = transactionService;
    }

    @PostMapping("/transaction")
    public ResponseEntity<LivestockTransactionResponseDTO> createTransaction(
            @AuthenticationPrincipal User user,
            @RequestBody LivestockTransactionCreateDTO dto) {
        return ResponseEntity.ok(transactionService.createTransaction(user.getId(), dto));
    }

    @GetMapping("/transactions")
    public ResponseEntity<List<LivestockTransactionResponseDTO>> getTransactions(
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(transactionService.getTransactions(user.getId()));
    }

    @PutMapping("/transaction/{id}")
    public ResponseEntity<LivestockTransactionResponseDTO> updateTransaction(
            @PathVariable Long id,
            @AuthenticationPrincipal User user,
            @RequestBody LivestockTransactionCreateDTO dto) {
        return ResponseEntity.ok(transactionService.updateTransaction(id, user.getId(), dto));
    }

    @DeleteMapping("/transaction/{id}")
    public ResponseEntity<Void> deleteTransaction(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        transactionService.deleteTransaction(id, user.getId());
        return ResponseEntity.noContent().build();
    }
}
