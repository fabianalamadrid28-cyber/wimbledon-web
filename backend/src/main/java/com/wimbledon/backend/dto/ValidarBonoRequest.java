package com.wimbledon.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ValidarBonoRequest {
    private String codigo;
    private String documento;
    private BigDecimal montoTotal;
}
