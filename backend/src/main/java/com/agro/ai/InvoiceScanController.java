package com.agro.ai;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/ai")
public class InvoiceScanController {

    private final InvoiceScanService scanService;

    public InvoiceScanController(InvoiceScanService scanService) {
        this.scanService = scanService;
    }

    @PostMapping("/scan-invoice")
    public ResponseEntity<InvoiceScanResponseDTO> scanInvoice(@RequestParam("file") MultipartFile file) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().build();
            }

            String mimeType = file.getContentType();
            if (mimeType == null || !mimeType.startsWith("image/")) {
                return ResponseEntity.badRequest().build();
            }

            InvoiceScanResponseDTO result = scanService.scanInvoice(file.getBytes(), mimeType);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            throw new RuntimeException("Error processing invoice: " + e.getMessage(), e);
        }
    }
}
