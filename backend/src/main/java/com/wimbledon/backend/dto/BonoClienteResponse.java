package com.wimbledon.backend.dto;

import com.wimbledon.backend.entities.Bono;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BonoClienteResponse {
    private String documento;
    private String nombreCliente;
    private String nivel; // "BRONCE", "PLATA", "ORO", "BLACK_VIP"
    private int estanciasAcumuladas;
    private int puntosFidelidad;
    private String beneficioNivel;
    private List<Bono> bonosDisponibles;
    private String mensaje;
}
