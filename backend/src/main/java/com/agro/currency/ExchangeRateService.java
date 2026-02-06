package com.agro.currency;

import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.RestClientException;

import java.math.BigDecimal;

@Service
public class ExchangeRateService {

    private final RestTemplate restTemplate;
    private static final String DOLAR_API_URL = "https://dolarapi.com/v1/dolares/oficial";

    public ExchangeRateService() {
        this.restTemplate = new RestTemplate();
    }

    /**
     * Get the current official ARS to USD exchange rate from dolarapi.com
     * Uses the "venta" (sell) price which is more conservative for calculations
     * Result is cached for 1 hour to avoid excessive API calls
     *
     * @return Exchange rate (ARS per 1 USD)
     * @throws ExchangeRateException if API call fails
     */
    @Cacheable(value = "exchangeRates", unless = "#result == null")
    public BigDecimal getCurrentExchangeRate() throws ExchangeRateException {
        try {
            DolarApiResponse response = restTemplate.getForObject(DOLAR_API_URL, DolarApiResponse.class);

            if (response == null || response.getVenta() == null) {
                throw new ExchangeRateException("Invalid response from dolarapi.com");
            }

            return response.getVenta();
        } catch (RestClientException e) {
            throw new ExchangeRateException("Failed to fetch exchange rate from dolarapi.com: " + e.getMessage(), e);
        }
    }

    // Inner class for API response mapping
    public static class DolarApiResponse {
        private BigDecimal compra;
        private BigDecimal venta;
        private String fechaActualizacion;

        public BigDecimal getCompra() {
            return compra;
        }

        public void setCompra(BigDecimal compra) {
            this.compra = compra;
        }

        public BigDecimal getVenta() {
            return venta;
        }

        public void setVenta(BigDecimal venta) {
            this.venta = venta;
        }

        public String getFechaActualizacion() {
            return fechaActualizacion;
        }

        public void setFechaActualizacion(String fechaActualizacion) {
            this.fechaActualizacion = fechaActualizacion;
        }
    }
}
