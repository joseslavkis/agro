package com.agro.partners.controller;

import com.agro.partners.dto.PartnerRequestDTO;
import com.agro.partners.service.PartnerService;
import com.agro.user.User;
import com.agro.user.dto.UserProfileDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/partners")
@SecurityRequirement(name = "bearer-key")
public class PartnerController {

    private final PartnerService partnerService;

    public PartnerController(PartnerService partnerService) {
        this.partnerService = partnerService;
    }

    @PostMapping("/invite/{username}")
    @Operation(summary = "Send an invitation to a user by username")
    public ResponseEntity<Void> sendInvitation(@AuthenticationPrincipal User user, @PathVariable String username) {
        try {
            partnerService.sendInvitation(user.getId(), username);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/accept/{requestId}")
    @Operation(summary = "Accept a partner invitation")
    public ResponseEntity<Void> acceptInvitation(@AuthenticationPrincipal User user, @PathVariable Long requestId) {
        partnerService.acceptInvitation(user.getId(), requestId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/decline/{requestId}")
    @Operation(summary = "Decline a partner invitation")
    public ResponseEntity<Void> declineInvitation(@AuthenticationPrincipal User user, @PathVariable Long requestId) {
        partnerService.declineInvitation(user.getId(), requestId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/pending")
    @Operation(summary = "Get pending invitations received by the current user")
    public ResponseEntity<List<PartnerRequestDTO>> getPendingInvitations(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(partnerService.getPendingInvitations(user.getId()));
    }

    @GetMapping("/list")
    @Operation(summary = "Get list of accepted partners")
    public ResponseEntity<List<UserProfileDTO>> getPartners(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(partnerService.getPartners(user.getId()));
    }
}
