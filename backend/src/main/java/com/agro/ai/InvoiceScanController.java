package com.agro.ai;

import com.agro.user.User;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/ai")
public class InvoiceScanController {

    private final InvoiceScanService invoiceScanService;

    public InvoiceScanController(InvoiceScanService invoiceScanService) {
        this.invoiceScanService = invoiceScanService;
    }

    @PostMapping("/scan-invoice")
    public ResponseEntity<?> scanInvoice(
            @AuthenticationPrincipal User user,
            @RequestParam("file") MultipartFile file) {

        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("No file provided");
        }

        // Validate file type
        String contentType = file.getContentType();
        if (contentType == null || (!contentType.startsWith("image/") && !contentType.equals("application/pdf"))) {
            return ResponseEntity.badRequest().body("Only image files and PDFs are supported");
        }

        try {
            InvoiceScanResponseDTO result = invoiceScanService.scanInvoice(file);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            System.err.println("Invoice scan failed: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                    .body("Error scanning invoice: " + e.getMessage());
        }
    }
}
