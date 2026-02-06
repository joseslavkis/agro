package com.agro.currency;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/v1/currency")
public class CurrencyController {

    @Autowired
    private ExchangeRateService exchangeRateService;

    @GetMapping("/exchange-rate")
    public ResponseEntity<ExchangeRateResponse> getExchangeRate() {
        try {
            BigDecimal rate = exchangeRateService.getCurrentExchangeRate();
            ExchangeRateResponse response = new ExchangeRateResponse(
                    rate,
                    "ARS",
                    "USD",
                    LocalDateTime.now());
            return ResponseEntity.ok(response);
        } catch (ExchangeRateException e) {
            return ResponseEntity.status(503).build(); // Service Unavailable
        }
    }

    // Response DTO
    public static class ExchangeRateResponse {
        private BigDecimal rate;
        private String currency;
        private String baseCurrency;
        private LocalDateTime timestamp;

        public ExchangeRateResponse(BigDecimal rate, String currency, String baseCurrency, LocalDateTime timestamp) {
            this.rate = rate;
            this.currency = currency;
            this.baseCurrency = baseCurrency;
            this.timestamp = timestamp;
        }

        public BigDecimal getRate() {
            return rate;
        }

        public String getCurrency() {
            return currency;
        }

        public String getBaseCurrency() {
            return baseCurrency;
        }

        public LocalDateTime getTimestamp() {
            return timestamp;
        }
    }
}
