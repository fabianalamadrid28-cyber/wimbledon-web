package com.wimbledon.backend.entities;

import com.wimbledon.backend.enums.EstadoSoporte;
import com.wimbledon.backend.enums.OrigenSoporte;
import com.wimbledon.backend.enums.PrioridadSoporte;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "soporte_reportes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReporteSoporte {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private OrigenSoporte origen;

    @Column(nullable = false, length = 50)
    private String habitacion;

    @Column(name = "nombre_contacto", length = 255)
    private String nombreContacto;

    @Column(length = 255)
    private String contacto;

    @Column(nullable = false, length = 80)
    private String categoria;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private PrioridadSoporte prioridad;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String descripcion;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private EstadoSoporte estado;

    /** true cuando el reporte lo generó un cliente: administración debe enterarse. */
    @Column(name = "escalado_admin", nullable = false, columnDefinition = "BOOLEAN DEFAULT FALSE")
    private boolean escaladoAdmin;

    /** true cuando un administrador ya vio la incidencia escalada. */
    @Column(name = "revisado_admin", nullable = false, columnDefinition = "BOOLEAN DEFAULT FALSE")
    private boolean revisadoAdmin;

    @CreationTimestamp
    @Column(name = "creado_en", nullable = false, updatable = false)
    private LocalDateTime creadoEn;
}
