package com.wimbledon.backend.entities;

import com.wimbledon.backend.enums.EstadoHabitacion;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "habitaciones")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Habitacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String numero;

    private String tipo; // "Simple", "Doble", "Suite"

    @Column(nullable = false)
    private String nombreTema; // Ejemplo: "Suite Presidencial", "Tropical Dreams"

    @Column(columnDefinition = "TEXT")
    private String descripcion;

    @Column(nullable = false)
    private BigDecimal precioBloque; // Tarifa por bloque o noche (ej: 120.00, 160.00, 250.00)

    private Integer capacidad; // 1, 2, 4 personas

    private Integer piso; // 1, 2, 3

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EstadoHabitacion estado;

    // Características específicas del Hotel Wimbledon
    private boolean tieneJacuzzi;
    private boolean tieneSauna;
    private boolean tienePoleDance;
    private boolean tieneSillonTantrico;
    private boolean tieneCocheraDirecta;
    
    private String urlImagen;
}
