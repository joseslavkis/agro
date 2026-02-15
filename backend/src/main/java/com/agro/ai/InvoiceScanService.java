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
import javax.imageio.ImageReader;
import javax.imageio.metadata.IIOMetadata;
import javax.imageio.stream.ImageInputStream;
import java.awt.geom.AffineTransform;
import java.awt.image.AffineTransformOp;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.math.BigDecimal;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import org.w3c.dom.Node;
import org.w3c.dom.NamedNodeMap;

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

            // Fix EXIF orientation (mobile phones rotate via metadata, not pixels)
            image = fixExifOrientation(imageBytes, image);

            return tesseract.doOCR(image);
        } catch (TesseractException e) {
            throw new RuntimeException("Error en OCR: " + e.getMessage(), e);
        }
    }

    private BufferedImage fixExifOrientation(byte[] imageBytes, BufferedImage image) {
        try {
            ImageInputStream iis = ImageIO.createImageInputStream(new ByteArrayInputStream(imageBytes));
            Iterator<ImageReader> readers = ImageIO.getImageReaders(iis);
            if (!readers.hasNext())
                return image;

            ImageReader reader = readers.next();
            reader.setInput(iis);
            IIOMetadata metadata = reader.getImageMetadata(0);
            if (metadata == null)
                return image;

            // Look for orientation in EXIF metadata
            int orientation = getExifOrientation(metadata);
            reader.dispose();
            iis.close();

            if (orientation <= 1)
                return image;

            AffineTransform transform = new AffineTransform();
            int w = image.getWidth();
            int h = image.getHeight();

            switch (orientation) {
                case 2: // Flip horizontal
                    transform.scale(-1.0, 1.0);
                    transform.translate(-w, 0);
                    break;
                case 3: // Rotate 180
                    transform.translate(w, h);
                    transform.rotate(Math.PI);
                    break;
                case 4: // Flip vertical
                    transform.scale(1.0, -1.0);
                    transform.translate(0, -h);
                    break;
                case 5: // Transpose
                    transform.rotate(Math.PI / 2);
                    transform.scale(1.0, -1.0);
                    break;
                case 6: // Rotate 90 CW
                    transform.translate(h, 0);
                    transform.rotate(Math.PI / 2);
                    break;
                case 7: // Transverse
                    transform.scale(-1.0, 1.0);
                    transform.translate(-h, 0);
                    transform.translate(0, w);
                    transform.rotate(3 * Math.PI / 2);
                    break;
                case 8: // Rotate 90 CCW
                    transform.translate(0, w);
                    transform.rotate(3 * Math.PI / 2);
                    break;
                default:
                    return image;
            }

            boolean swap = orientation >= 5;
            int newW = swap ? h : w;
            int newH = swap ? w : h;

            BufferedImage rotated = new BufferedImage(newW, newH,
                    image.getType() != 0 ? image.getType() : BufferedImage.TYPE_INT_RGB);
            AffineTransformOp op = new AffineTransformOp(transform, AffineTransformOp.TYPE_BILINEAR);
            op.filter(image, rotated);
            return rotated;
        } catch (Exception e) {
            System.err.println("Could not fix EXIF orientation: " + e.getMessage());
            return image; // Return original if EXIF handling fails
        }
    }

    private int getExifOrientation(IIOMetadata metadata) {
        try {
            String[] formatNames = metadata.getMetadataFormatNames();
            for (String formatName : formatNames) {
                Node root = metadata.getAsTree(formatName);
                int orientation = findOrientationInNode(root);
                if (orientation > 0)
                    return orientation;
            }
        } catch (Exception e) {
            // Ignore
        }
        return 1;
    }

    private int findOrientationInNode(Node node) {
        // Check if this node contains orientation info
        NamedNodeMap attrs = node.getAttributes();
        if (attrs != null) {
            Node tagNumber = attrs.getNamedItem("number");
            if (tagNumber != null && "274".equals(tagNumber.getNodeValue())) {
                // Tag 274 = Orientation in EXIF
                Node value = attrs.getNamedItem("value");
                if (value != null) {
                    try {
                        return Integer.parseInt(value.getNodeValue());
                    } catch (NumberFormatException e) {
                        // ignore
                    }
                }
            }
        }

        // Recurse into children
        Node child = node.getFirstChild();
        while (child != null) {
            int result = findOrientationInNode(child);
            if (result > 0)
                return result;
            child = child.getNextSibling();
        }
        return 0;
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
