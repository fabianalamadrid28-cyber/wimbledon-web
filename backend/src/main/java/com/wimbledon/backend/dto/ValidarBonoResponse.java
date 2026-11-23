package com.wimbledon.backend.dto;

import com.wimbledon.backend.entities.Bono;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ValidarBonoResponse {
    private boolean valido;
    private String mensaje;
    private BigDecimal montoDescuento;
    private BigDecimal nuevoTotal;
    private Bono bono;
}
