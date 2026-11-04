package com.wimbledon.backend.services;

import com.wimbledon.backend.entities.Reserva;
import com.wimbledon.backend.enums.EstadoReserva;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;

/**
 * Única fuente de verdad de las reglas de tiempo de una reserva (hora de Lima).
 *
 * - Editar: solo PENDIENTE/CONFIRMADA y solo antes de la hora de entrada.
 * - Cancelar: PENDIENTE hasta la hora de entrada; CONFIRMADA (ya pagada) hasta 3 h antes.
 * - Excedida: CHECKIN que ya pasó su hora de salida (recepción debe cerrarla o extenderla).
 * - Cierre automático: CHECKIN a los MINUTOS_TOLERANCIA_SALIDA de la salida; CONFIRMADA que nunca
 *   llegó, al terminar el bloque que pagó.
 */
public final class ReglasReserva {

    public static final ZoneId ZONA = ZoneId.of("America/Lima");
    public static final int HORAS_ANTES_PARA_CANCELAR = 3;
    public static final int MINUTOS_TOLERANCIA_SALIDA = 30;

    private ReglasReserva() {
    }

    public static LocalDateTime ahora() {
        return LocalDateTime.now(ZONA);
    }

    /** Momento de entrada. Sin hora programada se toma el final del día, para no bloquear la reserva antes de tiempo. */
    public static LocalDateTime inicio(Reserva r) {
        LocalDate dia = r.getFechaCheckIn() != null ? r.getFechaCheckIn() : r.getFechaReserva();
        if (dia == null) return null;
        LocalTime hora = r.getHoraEntradaProgramada() != null ? r.getHoraEntradaProgramada() : LocalTime.of(23, 59);
        return LocalDateTime.of(dia, hora);
    }

    /** Momento de salida. Si la hora de salida es menor o igual a la de entrada, el bloque cruza la medianoche. */
    public static LocalDateTime fin(Reserva r) {
        LocalDateTime inicio = inicio(r);
        if (inicio == null) return null;
        LocalDate dia = r.getFechaCheckOut() != null ? r.getFechaCheckOut() : inicio.toLocalDate();
        LocalTime hora = r.getHoraSalidaProgramada() != null ? r.getHoraSalidaProgramada() : LocalTime.of(23, 59);
        LocalDateTime fin = LocalDateTime.of(dia, hora);
        while (!fin.isAfter(inicio)) fin = fin.plusDays(1);
        return fin;
    }

    /** Motivo por el que no se puede editar, o null si se puede. */
    public static String motivoNoEditable(Reserva r, LocalDateTime ahora) {
        if (r.getEstado() != EstadoReserva.PENDIENTE && r.getEstado() != EstadoReserva.CONFIRMADA) {
            return "Solo se pueden editar reservas PENDIENTE o CONFIRMADA (esta está " + r.getEstado() + ").";
        }
        LocalDateTime inicio = inicio(r);
        if (inicio != null && !inicio.isAfter(ahora)) {
            return "La hora de entrada de esta reserva ya pasó; no se puede editar.";
        }
        return null;
    }

    /** Motivo por el que no se puede cancelar, o null si se puede. */
    public static String motivoNoCancelable(Reserva r, LocalDateTime ahora) {
        EstadoReserva e = r.getEstado();
        if (e != EstadoReserva.PENDIENTE && e != EstadoReserva.CONFIRMADA) {
            return "Solo se pueden cancelar reservas PENDIENTE o CONFIRMADA (esta está " + e + ").";
        }
        LocalDateTime inicio = inicio(r);
        if (inicio == null) return null;
        if (e == EstadoReserva.PENDIENTE) {
            return inicio.isAfter(ahora) ? null : "La hora de entrada ya pasó; no se puede cancelar.";
        }
        if (ahora.isAfter(inicio.minusHours(HORAS_ANTES_PARA_CANCELAR))) {
            return "Solo se puede cancelar hasta " + HORAS_ANTES_PARA_CANCELAR + " horas antes del check-in.";
        }
        return null;
    }

    /** CHECKIN que ya pasó su hora de salida programada. */
    public static boolean excedida(Reserva r, LocalDateTime ahora) {
        if (r.getEstado() != EstadoReserva.CHECKIN) return false;
        LocalDateTime fin = fin(r);
        return fin != null && ahora.isAfter(fin);
    }

    /** CHECKIN olvidada: pasó la salida más la tolerancia. */
    public static boolean checkinVencida(Reserva r, LocalDateTime ahora) {
        if (r.getEstado() != EstadoReserva.CHECKIN) return false;
        LocalDateTime fin = fin(r);
        return fin != null && ahora.isAfter(fin.plus(Duration.ofMinutes(MINUTOS_TOLERANCIA_SALIDA)));
    }

    /** CONFIRMADA (pagada) cuyo bloque terminó sin que el huésped hiciera check-in. */
    public static boolean noSePresento(Reserva r, LocalDateTime ahora) {
        if (r.getEstado() != EstadoReserva.CONFIRMADA) return false;
        LocalDateTime fin = fin(r);
        return fin != null && ahora.isAfter(fin);
    }
}
