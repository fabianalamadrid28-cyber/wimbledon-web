package com.wimbledon.backend.repositories;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.wimbledon.backend.entities.Reserva;
import com.wimbledon.backend.enums.EstadoReserva;

@Repository
public interface ReservaRepository extends JpaRepository<Reserva, Long> {
    
    // Busca una reserva específica mediante su token UUID v4 (Para el Check-In Digital por QR)
    Optional<Reserva> findByTokenAccesoQr(String tokenAccesoQr);

    // Consulta para evitar que dos clientes reserven la misma habitación en bloques horarios cruzados el mismo día
    @Query("SELECT r FROM Reserva r WHERE r.habitacion.id = :habitacionId " +
           "AND r.fechaReserva = :fecha " +
           "AND r.estado <> 'CANCELADA'")
    List<Reserva> findReservasActivasPorHabitacionYFecha(
            @Param("habitacionId") Long habitacionId, 
            @Param("fecha") LocalDate fecha
    );

    // Reservas vigentes (que ocupan la habitación) de una habitación
    @Query("SELECT r FROM Reserva r WHERE r.habitacion.id = :habitacionId AND r.estado IN :estados")
    List<Reserva> findByHabitacionAndEstados(
            @Param("habitacionId") Long habitacionId,
            @Param("estados") List<EstadoReserva> estados
    );

    List<Reserva> findByEstado(EstadoReserva estado);

    // Un mismo comprobante (Yape/Plin/transferencia) no puede pagar dos reservas vigentes
    boolean existsByMetodoPagoAndNumeroOperacionAndEstadoNot(String metodoPago, String numeroOperacion, EstadoReserva estado);

    // Reservas PENDIENTE creadas antes del límite (no confirmadas a tiempo)
    List<Reserva> findByEstadoAndCreadaEnBefore(EstadoReserva estado, LocalDateTime limite);
}
