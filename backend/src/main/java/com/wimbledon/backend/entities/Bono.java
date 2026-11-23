package com.wimbledon.backend.entities;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Bono {
    private String codigo;
    private String titulo;
    private String descripcion;
    private BigDecimal montoDescuento;
    private String nivelRequerido; // "TODOS", "BRONCE", "PLATA", "ORO", "BLACK_VIP"
    private int puntosRequeridos;
    private String vigencia;
    private boolean activo;
}
