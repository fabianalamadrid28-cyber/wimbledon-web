package com.wimbledon.backend.services;

import com.wimbledon.backend.enums.EstadoHabitacion;
import com.wimbledon.backend.enums.EstadoReserva;

import java.util.EnumMap;
import java.util.EnumSet;
import java.util.Map;
import java.util.Set;

/**
 * Única fuente de verdad de los cambios de estado permitidos.
 *
 * Habitación: LIMPIEZA_PENDIENTE → EN_PROCESO → LISTA → (RESERVADA) → OCUPADA → LIMPIEZA_PENDIENTE (check-out).
 *             Mantenimiento se puede pedir desde cualquier estado y se sale hacia DISPONIBLE o LIMPIEZA_PENDIENTE.
 * Reserva:    PENDIENTE → CONFIRMADA → CHECKIN → FINALIZADA; PENDIENTE/CONFIRMADA → CANCELADA.
 * Repetir el estado actual es un no-op permitido (dos paneles pueden pulsar a la vez).
 */
public final class TransicionEstados {

    private static final Map<EstadoHabitacion, Set<EstadoHabitacion>> HABITACION = new EnumMap<>(EstadoHabitacion.class);
    private static final Map<EstadoReserva, Set<EstadoReserva>> RESERVA = new EnumMap<>(EstadoReserva.class);

    static {
        HABITACION.put(EstadoHabitacion.DISPONIBLE, EnumSet.of(EstadoHabitacion.RESERVADA, EstadoHabitacion.OCUPADA, EstadoHabitacion.LIMPIEZA_PENDIENTE, EstadoHabitacion.MANTENIMIENTO));
        HABITACION.put(EstadoHabitacion.RESERVADA, EnumSet.of(EstadoHabitacion.OCUPADA, EstadoHabitacion.DISPONIBLE, EstadoHabitacion.MANTENIMIENTO));
        HABITACION.put(EstadoHabitacion.LISTA, EnumSet.of(EstadoHabitacion.RESERVADA, EstadoHabitacion.OCUPADA, EstadoHabitacion.DISPONIBLE, EstadoHabitacion.MANTENIMIENTO));
        HABITACION.put(EstadoHabitacion.OCUPADA, EnumSet.of(EstadoHabitacion.LIMPIEZA_PENDIENTE, EstadoHabitacion.MANTENIMIENTO));
        HABITACION.put(EstadoHabitacion.LIMPIEZA_PENDIENTE, EnumSet.of(EstadoHabitacion.EN_PROCESO, EstadoHabitacion.MANTENIMIENTO));
        HABITACION.put(EstadoHabitacion.EN_PROCESO, EnumSet.of(EstadoHabitacion.LISTA, EstadoHabitacion.LIMPIEZA_PENDIENTE, EstadoHabitacion.MANTENIMIENTO));
        HABITACION.put(EstadoHabitacion.MANTENIMIENTO, EnumSet.of(EstadoHabitacion.DISPONIBLE, EstadoHabitacion.LIMPIEZA_PENDIENTE));

        RESERVA.put(EstadoReserva.PENDIENTE, EnumSet.of(EstadoReserva.CONFIRMADA, EstadoReserva.CANCELADA));
        RESERVA.put(EstadoReserva.CONFIRMADA, EnumSet.of(EstadoReserva.CHECKIN, EstadoReserva.CANCELADA));
        RESERVA.put(EstadoReserva.CHECKIN, EnumSet.of(EstadoReserva.FINALIZADA));
        RESERVA.put(EstadoReserva.FINALIZADA, EnumSet.noneOf(EstadoReserva.class));
        RESERVA.put(EstadoReserva.CANCELADA, EnumSet.noneOf(EstadoReserva.class));
    }

    private TransicionEstados() {
    }

    public static boolean permitida(EstadoHabitacion de, EstadoHabitacion a) {
        return de == null || de == a || HABITACION.getOrDefault(de, Set.of()).contains(a);
    }

    public static boolean permitida(EstadoReserva de, EstadoReserva a) {
        return de == null || de == a || RESERVA.getOrDefault(de, Set.of()).contains(a);
    }

    public static void validar(EstadoHabitacion de, EstadoHabitacion a) {
        if (a == null) throw new TransicionInvalidaException("Estado de habitación no indicado.");
        if (!permitida(de, a)) {
            throw new TransicionInvalidaException("Cambio no permitido en la habitación: " + de + " → " + a
                    + ". Permitidos desde " + de + ": " + HABITACION.get(de));
        }
    }

    public static void validar(EstadoReserva de, EstadoReserva a) {
        if (a == null) throw new TransicionInvalidaException("Estado de reserva no indicado.");
        if (!permitida(de, a)) {
            throw new TransicionInvalidaException("Cambio no permitido en la reserva: " + de + " → " + a
                    + ". Permitidos desde " + de + ": " + RESERVA.get(de));
        }
    }
}
