package com.wimbledon.backend.entities;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Una limpieza de habitación: se abre cuando la habitación pasa a EN_PROCESO y se cierra
 * cuando pasa a LISTA. La demora es fin - inicio.
 */
@Entity
@Table(name = "limpieza_registros", indexes = {
        @Index(name = "idx_limpieza_habitacion", columnList = "habitacion_numero"),
        @Index(name = "idx_limpieza_fin", columnList = "fin")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RegistroLimpieza {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "habitacion_numero", nullable = false, length = 50)
    private String habitacionNumero;

    @Column(length = 255)
    private String personal;

    @Column(nullable = false)
    private LocalDateTime inicio;

    /** null mientras la limpieza sigue en curso. */
    private LocalDateTime fin;

    @Column(name = "duracion_segundos")
    private Long duracionSegundos;

    @Column(length = 500)
    private String observaciones;
}
