package com.wimbledon.backend.services;

import com.wimbledon.backend.enums.EstadoHabitacion;
import com.wimbledon.backend.enums.EstadoReserva;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class TransicionEstadosTest {

    @Test
    void cicloCompletoDeLaHabitacionEsValido() {
        EstadoHabitacion[] ciclo = {EstadoHabitacion.LISTA, EstadoHabitacion.OCUPADA, EstadoHabitacion.LIMPIEZA_PENDIENTE,
                EstadoHabitacion.EN_PROCESO, EstadoHabitacion.LISTA};
        for (int i = 0; i < ciclo.length - 1; i++) {
            assertTrue(TransicionEstados.permitida(ciclo[i], ciclo[i + 1]), ciclo[i] + " → " + ciclo[i + 1]);
        }
    }

    @Test
    void limpiezaPendienteNoPuedeSaltarAOcupada() {
        assertFalse(TransicionEstados.permitida(EstadoHabitacion.LIMPIEZA_PENDIENTE, EstadoHabitacion.OCUPADA));
        assertThrows(TransicionInvalidaException.class,
                () -> TransicionEstados.validar(EstadoHabitacion.LIMPIEZA_PENDIENTE, EstadoHabitacion.OCUPADA));
    }

    @Test
    void ocupadaNoPasaADisponibleSinLimpieza() {
        assertFalse(TransicionEstados.permitida(EstadoHabitacion.OCUPADA, EstadoHabitacion.DISPONIBLE));
    }

    @Test
    void mantenimientoSePideDesdeCualquierEstado() {
        for (EstadoHabitacion e : EstadoHabitacion.values()) {
            if (e != EstadoHabitacion.MANTENIMIENTO) {
                assertTrue(TransicionEstados.permitida(e, EstadoHabitacion.MANTENIMIENTO), e + " → MANTENIMIENTO");
            }
        }
    }

    @Test
    void repetirElMismoEstadoEsNoOp() {
        for (EstadoHabitacion e : EstadoHabitacion.values()) assertTrue(TransicionEstados.permitida(e, e));
        for (EstadoReserva e : EstadoReserva.values()) assertTrue(TransicionEstados.permitida(e, e));
    }

    @Test
    void reservaSigueSuFlujo() {
        assertTrue(TransicionEstados.permitida(EstadoReserva.PENDIENTE, EstadoReserva.CONFIRMADA));
        assertTrue(TransicionEstados.permitida(EstadoReserva.CONFIRMADA, EstadoReserva.CHECKIN));
        assertTrue(TransicionEstados.permitida(EstadoReserva.CHECKIN, EstadoReserva.FINALIZADA));
        assertFalse(TransicionEstados.permitida(EstadoReserva.PENDIENTE, EstadoReserva.CHECKIN));
        assertFalse(TransicionEstados.permitida(EstadoReserva.CHECKIN, EstadoReserva.CANCELADA));
    }

    @Test
    void finalizadaYCanceladaSonTerminales() {
        for (EstadoReserva e : EstadoReserva.values()) {
            if (e != EstadoReserva.FINALIZADA) assertFalse(TransicionEstados.permitida(EstadoReserva.FINALIZADA, e), "FINALIZADA → " + e);
            if (e != EstadoReserva.CANCELADA) assertFalse(TransicionEstados.permitida(EstadoReserva.CANCELADA, e), "CANCELADA → " + e);
        }
    }

    @Test
    void estadoNuloSeRechaza() {
        assertThrows(TransicionInvalidaException.class, () -> TransicionEstados.validar(EstadoHabitacion.LISTA, null));
        assertThrows(TransicionInvalidaException.class, () -> TransicionEstados.validar(EstadoReserva.PENDIENTE, null));
    }
}
