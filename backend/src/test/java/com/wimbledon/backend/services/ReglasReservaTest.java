package com.wimbledon.backend.services;

import com.wimbledon.backend.entities.Reserva;
import com.wimbledon.backend.enums.EstadoReserva;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

import static org.junit.jupiter.api.Assertions.*;

class ReglasReservaTest {

    private static final LocalDateTime AHORA = LocalDateTime.of(2026, 11, 3, 15, 0);

    private Reserva reserva(EstadoReserva estado, LocalDateTime entrada, int horas) {
        Reserva r = new Reserva();
        r.setEstado(estado);
        r.setFechaCheckIn(entrada.toLocalDate());
        r.setHoraEntradaProgramada(entrada.toLocalTime());
        LocalDateTime salida = entrada.plusHours(horas);
        r.setFechaCheckOut(salida.toLocalDate());
        r.setHoraSalidaProgramada(salida.toLocalTime());
        return r;
    }

    @Test
    void editable_solo_si_pendiente_o_confirmada_y_futura() {
        assertNull(ReglasReserva.motivoNoEditable(reserva(EstadoReserva.CONFIRMADA, AHORA.plusHours(1), 6), AHORA));
        assertNull(ReglasReserva.motivoNoEditable(reserva(EstadoReserva.PENDIENTE, AHORA.plusDays(2), 6), AHORA));
        assertNotNull(ReglasReserva.motivoNoEditable(reserva(EstadoReserva.CONFIRMADA, AHORA.minusMinutes(1), 6), AHORA));
        assertNotNull(ReglasReserva.motivoNoEditable(reserva(EstadoReserva.CHECKIN, AHORA.plusHours(1), 6), AHORA));
        assertNotNull(ReglasReserva.motivoNoEditable(reserva(EstadoReserva.FINALIZADA, AHORA.plusHours(1), 6), AHORA));
        assertNotNull(ReglasReserva.motivoNoEditable(reserva(EstadoReserva.CANCELADA, AHORA.plusHours(1), 6), AHORA));
    }

    @Test
    void confirmada_se_cancela_hasta_3_horas_antes() {
        assertNull(ReglasReserva.motivoNoCancelable(reserva(EstadoReserva.CONFIRMADA, AHORA.plusHours(3), 6), AHORA));
        assertNotNull(ReglasReserva.motivoNoCancelable(reserva(EstadoReserva.CONFIRMADA, AHORA.plusHours(2).plusMinutes(59), 6), AHORA));
        assertNotNull(ReglasReserva.motivoNoCancelable(reserva(EstadoReserva.CONFIRMADA, AHORA.minusHours(1), 6), AHORA));
    }

    @Test
    void pendiente_se_cancela_mientras_no_haya_empezado() {
        assertNull(ReglasReserva.motivoNoCancelable(reserva(EstadoReserva.PENDIENTE, AHORA.plusMinutes(10), 6), AHORA));
        assertNotNull(ReglasReserva.motivoNoCancelable(reserva(EstadoReserva.PENDIENTE, AHORA.minusMinutes(10), 6), AHORA));
    }

    @Test
    void checkin_en_curso_no_es_cancelable_ni_editable() {
        Reserva r = reserva(EstadoReserva.CHECKIN, AHORA.minusHours(1), 6);
        assertNotNull(ReglasReserva.motivoNoCancelable(r, AHORA));
        assertNotNull(ReglasReserva.motivoNoEditable(r, AHORA));
    }

    @Test
    void checkin_excedida_y_vencida_con_tolerancia_de_30_min() {
        Reserva r = reserva(EstadoReserva.CHECKIN, AHORA.minusHours(6), 6); // sale justo ahora
        assertFalse(ReglasReserva.excedida(r, AHORA));
        assertTrue(ReglasReserva.excedida(r, AHORA.plusMinutes(1)));
        assertFalse(ReglasReserva.checkinVencida(r, AHORA.plusMinutes(30)));
        assertTrue(ReglasReserva.checkinVencida(r, AHORA.plusMinutes(31)));
    }

    @Test
    void confirmada_que_no_llego_se_cierra_al_terminar_su_bloque() {
        Reserva r = reserva(EstadoReserva.CONFIRMADA, AHORA.minusHours(6), 6);
        assertFalse(ReglasReserva.noSePresento(r, AHORA));
        assertTrue(ReglasReserva.noSePresento(r, AHORA.plusMinutes(1)));
        assertFalse(ReglasReserva.noSePresento(reserva(EstadoReserva.CHECKIN, AHORA.minusHours(9), 6), AHORA));
    }

    @Test
    void bloque_que_cruza_la_medianoche() {
        Reserva r = new Reserva();
        r.setEstado(EstadoReserva.CHECKIN);
        r.setFechaCheckIn(LocalDate.of(2026, 11, 3));
        r.setFechaCheckOut(LocalDate.of(2026, 11, 3)); // mismo día en BD, pero sale de madrugada
        r.setHoraEntradaProgramada(LocalTime.of(22, 0));
        r.setHoraSalidaProgramada(LocalTime.of(4, 0));
        assertEquals(LocalDateTime.of(2026, 11, 4, 4, 0), ReglasReserva.fin(r));
        assertFalse(ReglasReserva.excedida(r, LocalDateTime.of(2026, 11, 4, 3, 59)));
        assertTrue(ReglasReserva.excedida(r, LocalDateTime.of(2026, 11, 4, 4, 1)));
    }

    @Test
    void sin_hora_programada_la_reserva_es_editable_todo_el_dia() {
        Reserva r = new Reserva();
        r.setEstado(EstadoReserva.CONFIRMADA);
        r.setFechaCheckIn(AHORA.toLocalDate());
        assertNull(ReglasReserva.motivoNoEditable(r, AHORA));
        r.setFechaCheckIn(AHORA.toLocalDate().minusDays(1));
        assertNotNull(ReglasReserva.motivoNoEditable(r, AHORA));
    }
}
