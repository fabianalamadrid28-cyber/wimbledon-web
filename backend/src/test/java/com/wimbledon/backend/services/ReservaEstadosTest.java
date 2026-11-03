package com.wimbledon.backend.services;

import com.wimbledon.backend.entities.Habitacion;
import com.wimbledon.backend.entities.Reserva;
import com.wimbledon.backend.enums.EstadoHabitacion;
import com.wimbledon.backend.enums.EstadoReserva;
import com.wimbledon.backend.repositories.HabitacionRepository;
import com.wimbledon.backend.repositories.ReservaRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class ReservaEstadosTest {

    private ReservaRepository reservas;
    private HabitacionRepository habitaciones;
    private ReservaService servicio;
    private Habitacion hab;
    private Reserva res;

    @BeforeEach
    void preparar() {
        reservas = mock(ReservaRepository.class);
        habitaciones = mock(HabitacionRepository.class);
        servicio = new ReservaService(reservas, habitaciones);
        hab = new Habitacion();
        hab.setEstado(EstadoHabitacion.LISTA);
        res = new Reserva();
        res.setHabitacion(hab);
        res.setEstado(EstadoReserva.CONFIRMADA);
        when(reservas.findById(1L)).thenReturn(Optional.of(res));
        when(reservas.save(any(Reserva.class))).thenAnswer(i -> i.getArgument(0));
    }

    @Test
    void checkInOcupaLaHabitacion() {
        servicio.cambiarEstado(1L, EstadoReserva.CHECKIN);
        assertEquals(EstadoReserva.CHECKIN, res.getEstado());
        assertEquals(EstadoHabitacion.OCUPADA, hab.getEstado());
        verify(habitaciones).save(hab);
    }

    @Test
    void finalizarDejaLaHabitacionPendienteDeLimpieza() {
        res.setEstado(EstadoReserva.CHECKIN);
        hab.setEstado(EstadoHabitacion.OCUPADA);
        servicio.cambiarEstado(1L, EstadoReserva.FINALIZADA);
        assertEquals(EstadoHabitacion.LIMPIEZA_PENDIENTE, hab.getEstado());
    }

    @Test
    void checkInEnHabitacionSinLimpiarSeRechazaYNoCambiaNada() {
        hab.setEstado(EstadoHabitacion.LIMPIEZA_PENDIENTE);
        assertThrows(TransicionInvalidaException.class, () -> servicio.cambiarEstado(1L, EstadoReserva.CHECKIN));
        assertEquals(EstadoReserva.CONFIRMADA, res.getEstado());
        assertEquals(EstadoHabitacion.LIMPIEZA_PENDIENTE, hab.getEstado());
        verify(reservas, never()).save(any());
    }

    @Test
    void saltarDePendienteACheckInSeRechaza() {
        res.setEstado(EstadoReserva.PENDIENTE);
        assertThrows(TransicionInvalidaException.class, () -> servicio.cambiarEstado(1L, EstadoReserva.CHECKIN));
    }

    @Test
    void repetirCheckInNoVuelveATocarLaHabitacion() {
        res.setEstado(EstadoReserva.CHECKIN);
        hab.setEstado(EstadoHabitacion.OCUPADA);
        servicio.cambiarEstado(1L, EstadoReserva.CHECKIN);
        verify(habitaciones, never()).save(any());
    }
}
