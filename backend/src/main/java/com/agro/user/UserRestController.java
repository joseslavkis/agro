package com.agro.user;

import com.agro.user.dto.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/v1/users")
@Tag(name = "1 - Users")
class UserRestController {
        private final UserService userService;

        @Autowired
        UserRestController(UserService userService) {
                this.userService = userService;
        }

        @PreAuthorize("isAuthenticated()")
        @GetMapping(value = "/profile/{id}", produces = "application/json")
        @Operation(summary = "View a user's profile by ID")
        @ResponseStatus(HttpStatus.OK)
        @ApiResponse(responseCode = "404", description = "User not found", content = @Content)
        @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content)
        ResponseEntity<UserProfileDTO> viewProfile(
                        @PathVariable Long id) {
                return userService.getUserProfileById(id)
                                .map(ResponseEntity::ok)
                                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).build());
        }

        @PreAuthorize("isAuthenticated()")
        @DeleteMapping(value = "/delete/me", produces = "application/json")
        @Operation(summary = "Delete yourself")
        @ResponseStatus(HttpStatus.OK)
        @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content)
        @ApiResponse(responseCode = "404", description = "User not found", content = @Content)
        ResponseEntity<StatusResponseDTO> deleteUser(
                        @AuthenticationPrincipal(expression = "username") String email) {
                var currentUser = userService.getUserByEmail(email);
                return userService.deleteUser(currentUser.getId())
                                .map(user -> ResponseEntity.ok(new StatusResponseDTO("success", "User deleted")))
                                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                                                .body(new StatusResponseDTO("error", "User not found")));
        }

        @PreAuthorize("isAuthenticated()")
        @PatchMapping(value = "/update/me", produces = "application/json")
        @Operation(summary = "Update yourself")
        @ResponseStatus(HttpStatus.OK)
        @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content)
        @ApiResponse(responseCode = "404", description = "User not found", content = @Content)
        Optional<ResponseEntity<StatusResponseDTO>> updateUser(
                        @RequestBody UserUpdateDTO userDTO,
                        @AuthenticationPrincipal(expression = "username") String email) {
                var currentUser = userService.getUserByEmail(email);
                return userService.updateUser(userDTO, currentUser.getId());
        }

}