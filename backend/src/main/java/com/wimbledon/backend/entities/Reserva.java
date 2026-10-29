package com.wimbledon.backend.entities;

import com.wimbledon.backend.enums.EstadoReserva;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "reservas")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Reserva {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String codigo; // Ej: "#001" o "#R-1025"

    // Relación: Muchas reservas pueden pertenecer a una misma habitación
    @ManyToOne
    @JoinColumn(name = "habitacion_id", nullable = false)
    private Habitacion habitacion;

    // Datos del huésped express o registrado
    @Column(nullable = false)
    private String documentoHuesped; // DNI o CE

    @Column(nullable = false)
    private String nombreHuesped;

    private String emailHuesped;

    @Column(nullable = false)
    private String telefonoWhatsApp;

    // Control de fechas y bloques horarios
    @Column(nullable = false)
    private LocalDate fechaReserva;

    private LocalDate fechaCheckIn;

    private LocalDate fechaCheckOut;

    private LocalTime horaEntradaProgramada;

    private LocalTime horaSalidaProgramada;

    private String bloqueSeleccionado; // Ejemplo: "6 HORAS", "7 HORAS", "PERNOCTE", "NOCHE COMPLETA"

    @Column(nullable = false)
    private BigDecimal totalPago;

    // Token criptográfico opaco UUID v4 para el Check-In Digital
    @Column(nullable = false, unique = true)
    private String tokenAccesoQr; 

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EstadoReserva estado; // PENDIENTE, CONFIRMADA, CHECKIN, FINALIZADA, CANCELADA

    private String notasAdicionales;
}
