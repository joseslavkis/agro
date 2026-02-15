package com.agro.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.*;

@Service
public class InvoiceScanService {

    @Value("${gemini.api.key:}")
    private String apiKey;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    private static final String GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models/";
    private static final String[] MODELS = { "gemini-2.0-flash", "gemini-2.0-flash-lite" };

    private static final String PROMPT = """
            Analizá esta imagen de una factura o ticket de compra relacionada con ganadería/campo.
            Extraé la siguiente información y devolvela SOLAMENTE como un JSON válido (sin markdown, sin ```json, solo el JSON puro):
            {
              "name": "nombre descriptivo corto del gasto (ej: Vacunación Aftosa, Compra de alambre, Servicio veterinario)",
              "cost": 12345.67,
              "currency": "ARS o USD",
              "date": "YYYY-MM-DD",
              "note": "detalles relevantes como proveedor, cantidad de productos, etc."
            }

            Reglas:
            - "cost" debe ser un número (sin comillas), el monto total de la factura
            - "currency" debe ser "ARS" si la factura está en pesos argentinos, "USD" si está en dólares
            - "date" debe ser la fecha de la factura en formato YYYY-MM-DD. Si no se ve la fecha, usá la fecha de hoy.
            - "name" debe ser un resumen corto y claro del gasto principal
            - "note" puede incluir detalles como el proveedor, número de factura, etc.
            - Si no podés leer algún campo, poné null para ese campo
            - IMPORTANTE: Respondé SOLAMENTE con el JSON, nada más
            """;

    public InvoiceScanResponseDTO scanInvoice(byte[] imageData, String mimeType) {
        if (apiKey == null || apiKey.isBlank()) {
            throw new RuntimeException("Gemini API key not configured. Set GEMINI_API_KEY environment variable.");
        }

        // Build request body (reusable across model attempts)
        String requestJson;
        try {
            String base64Image = Base64.getEncoder().encodeToString(imageData);

            Map<String, Object> inlineData = new LinkedHashMap<>();
            inlineData.put("mimeType", mimeType);
            inlineData.put("data", base64Image);

            Map<String, Object> imagePart = Map.of("inlineData", inlineData);
            Map<String, Object> textPart = Map.of("text", PROMPT);

            Map<String, Object> content = Map.of("parts", List.of(textPart, imagePart));
            Map<String, Object> requestBody = Map.of("contents", List.of(content));

            requestJson = objectMapper.writeValueAsString(requestBody);
        } catch (Exception e) {
            throw new RuntimeException("Error building request: " + e.getMessage(), e);
        }

        // Try each model, fallback on rate limit
        Exception lastException = null;
        for (String model : MODELS) {
            try {
                String url = GEMINI_BASE_URL + model + ":generateContent?key=" + apiKey;

                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);
                HttpEntity<String> entity = new HttpEntity<>(requestJson, headers);

                ResponseEntity<String> response = restTemplate.exchange(
                        url, HttpMethod.POST, entity, String.class);

                if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                    return parseGeminiResponse(response.getBody());
                }
            } catch (org.springframework.web.client.HttpClientErrorException.TooManyRequests e) {
                lastException = e;
                // Try next model
                continue;
            } catch (org.springframework.web.client.HttpClientErrorException e) {
                if (e.getStatusCode().value() == 429) {
                    lastException = e;
                    continue;
                }
                throw new RuntimeException("Error de Gemini API: " + e.getStatusCode(), e);
            } catch (Exception e) {
                throw new RuntimeException("Error escaneando factura: " + e.getMessage(), e);
            }
        }

        // All models hit rate limit
        throw new RuntimeException(
                "Se superó el límite de uso de la IA. Esperá 1 minuto y volvé a intentar.");
    }

    private InvoiceScanResponseDTO parseGeminiResponse(String responseBody) throws Exception {
        JsonNode root = objectMapper.readTree(responseBody);

        // Navigate: candidates[0].content.parts[0].text
        JsonNode candidates = root.get("candidates");
        if (candidates == null || candidates.isEmpty()) {
            throw new RuntimeException("Gemini returned no candidates");
        }

        String text = candidates.get(0)
                .get("content")
                .get("parts")
                .get(0)
                .get("text")
                .asText();

        // Clean up: remove possible markdown code fences
        text = text.trim();
        if (text.startsWith("```json")) {
            text = text.substring(7);
        } else if (text.startsWith("```")) {
            text = text.substring(3);
        }
        if (text.endsWith("```")) {
            text = text.substring(0, text.length() - 3);
        }
        text = text.trim();

        // Parse the JSON
        JsonNode data = objectMapper.readTree(text);

        InvoiceScanResponseDTO dto = new InvoiceScanResponseDTO();
        dto.setName(getTextOrNull(data, "name"));
        dto.setCurrency(getTextOrNull(data, "currency"));
        dto.setDate(getTextOrNull(data, "date"));
        dto.setNote(getTextOrNull(data, "note"));

        if (data.has("cost") && !data.get("cost").isNull()) {
            dto.setCost(new BigDecimal(data.get("cost").asText()));
        }

        return dto;
    }

    private String getTextOrNull(JsonNode node, String field) {
        if (node.has(field) && !node.get(field).isNull()) {
            return node.get(field).asText();
        }
        return null;
    }
}
