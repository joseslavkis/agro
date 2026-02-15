package com.agro.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import net.sourceforge.tess4j.Tesseract;
import net.sourceforge.tess4j.TesseractException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Service
public class InvoiceScanService {

    private static final String GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

    @Value("${groq.api.key:}")
    private String groqApiKey;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public InvoiceScanResponseDTO scanInvoice(MultipartFile file) throws Exception {
        if (groqApiKey == null || groqApiKey.isBlank()) {
            throw new RuntimeException("Groq API key is not configured. Set GROQ_API_KEY in your .env file.");
        }

        // Step 1: OCR — extract text from image using Tesseract
        String extractedText = extractTextFromImage(file);

        if (extractedText == null || extractedText.isBlank()) {
            throw new RuntimeException("No se pudo extraer texto de la imagen. Asegurate de que la foto sea clara.");
        }

        System.out.println("=== OCR Extracted Text ===");
        System.out.println(extractedText);
        System.out.println("=========================");

        // Step 2: AI — interpret the extracted text using Groq + Llama
        return interpretTextWithAI(extractedText);
    }

    private String extractTextFromImage(MultipartFile file) throws Exception {
        Tesseract tesseract = new Tesseract();
        tesseract.setLanguage("spa");

        // Try common tessdata paths
        String[] tessdataPaths = {
                "/usr/share/tesseract-ocr/5/tessdata",
                "/usr/share/tesseract-ocr/4.00/tessdata",
                "/usr/share/tessdata",
                "/usr/local/share/tessdata"
        };

        String validPath = null;
        for (String path : tessdataPaths) {
            java.io.File dir = new java.io.File(path);
            if (dir.exists() && dir.isDirectory()) {
                validPath = path;
                break;
            }
        }

        if (validPath != null) {
            tesseract.setDatapath(validPath);
        }

        try {
            byte[] imageBytes = file.getBytes();
            BufferedImage image = ImageIO.read(new ByteArrayInputStream(imageBytes));
            if (image == null) {
                throw new RuntimeException("No se pudo leer la imagen. Formato no soportado.");
            }
            return tesseract.doOCR(image);
        } catch (TesseractException e) {
            throw new RuntimeException("Error en OCR: " + e.getMessage(), e);
        }
    }

    private InvoiceScanResponseDTO interpretTextWithAI(String ocrText) throws Exception {
        String prompt = """
                You are an invoice parser for an agricultural expense tracking app in Argentina.
                You will receive raw text extracted via OCR from an invoice or receipt.
                The text may contain errors or formatting issues from OCR.

                Analyze the text and extract the following information.
                Return ONLY a valid JSON object (no markdown, no explanation):
                {
                  "name": "short description of the expense (in Spanish, max 50 chars)",
                  "cost": numeric total amount (number only, no currency symbols),
                  "currency": "USD" or "ARS" (if it mentions pesos, $, or AR$ assume ARS, if USD/dollars use USD),
                  "date": "YYYY-MM-DD" (date from the invoice, or null if not found),
                  "note": "provider name, invoice number, and other relevant details (in Spanish)"
                }

                Rules:
                - "cost" MUST be a number, not a string
                - If a field cannot be determined, set it to null
                - Prefer the TOTAL amount over subtotals
                - If the text is unreadable or not an invoice, return all fields as null with note explaining why
                """;

        Map<String, Object> requestBody = Map.of(
                "model", "llama-3.3-70b-versatile",
                "messages", List.of(
                        Map.of("role", "system", "content", prompt),
                        Map.of("role", "user", "content", "Here is the OCR text from the invoice:\n\n" + ocrText)),
                "temperature", 0.1,
                "max_tokens", 500);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(groqApiKey);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        ResponseEntity<String> response = restTemplate.exchange(
                GROQ_API_URL, HttpMethod.POST, entity, String.class);

        if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
            throw new RuntimeException("Groq API returned error: " + response.getStatusCode());
        }

        return parseGroqResponse(response.getBody());
    }

    private InvoiceScanResponseDTO parseGroqResponse(String responseBody) throws Exception {
        JsonNode root = objectMapper.readTree(responseBody);

        // Groq uses OpenAI-compatible format: choices[0].message.content
        JsonNode choices = root.path("choices");
        if (choices.isEmpty()) {
            throw new RuntimeException("No response from Groq AI");
        }

        String textContent = choices.get(0)
                .path("message")
                .path("content")
                .asText();

        // Clean the response: remove markdown code blocks if present
        textContent = textContent.trim();
        if (textContent.startsWith("```json")) {
            textContent = textContent.substring(7);
        } else if (textContent.startsWith("```")) {
            textContent = textContent.substring(3);
        }
        if (textContent.endsWith("```")) {
            textContent = textContent.substring(0, textContent.length() - 3);
        }
        textContent = textContent.trim();

        // Parse the JSON
        JsonNode parsed = objectMapper.readTree(textContent);

        InvoiceScanResponseDTO dto = new InvoiceScanResponseDTO();

        if (parsed.has("name") && !parsed.get("name").isNull()) {
            dto.setName(parsed.get("name").asText());
        }
        if (parsed.has("cost") && !parsed.get("cost").isNull()) {
            dto.setCost(new BigDecimal(parsed.get("cost").asText()));
        }
        if (parsed.has("currency") && !parsed.get("currency").isNull()) {
            dto.setCurrency(parsed.get("currency").asText());
        }
        if (parsed.has("date") && !parsed.get("date").isNull()) {
            dto.setDate(parsed.get("date").asText());
        }
        if (parsed.has("note") && !parsed.get("note").isNull()) {
            dto.setNote(parsed.get("note").asText());
        }

        return dto;
    }
}
