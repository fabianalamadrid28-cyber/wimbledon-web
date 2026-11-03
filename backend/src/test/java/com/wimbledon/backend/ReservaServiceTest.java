package com.wimbledon.backend;

import com.wimbledon.backend.entities.Habitacion;
import com.wimbledon.backend.entities.Reserva;
import com.wimbledon.backend.enums.EstadoHabitacion;
import com.wimbledon.backend.enums.EstadoReserva;
import com.wimbledon.backend.repositories.HabitacionRepository;
import com.wimbledon.backend.repositories.ReservaRepository;
import com.wimbledon.backend.services.ClienteService;
import com.wimbledon.backend.services.ReservaService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class ReservaServiceTest {

    private ReservaRepository reservaRepo;
    private HabitacionRepository habitacionRepo;
    private ClienteService clienteService;
    private ReservaService service;
    private Habitacion hab;

    @BeforeEach
    void setUp() {
        reservaRepo = mock(ReservaRepository.class);
        habitacionRepo = mock(HabitacionRepository.class);
        clienteService = mock(ClienteService.class);
        service = new ReservaService(reservaRepo, habitacionRepo, clienteService);

        hab = new Habitacion();
        hab.setId(1L);
        hab.setEstado(EstadoHabitacion.DISPONIBLE);
        when(habitacionRepo.findById(1L)).thenReturn(Optional.of(hab));
        when(reservaRepo.save(any(Reserva.class))).thenAnswer(i -> i.getArgument(0));
    }

    private Reserva reserva(Long id, EstadoReserva estado, int diaIn, int diaOut) {
        Reserva r = new Reserva();
        r.setId(id);
        r.setHabitacion(hab);
        r.setEstado(estado);
        // Fechas relativas a hoy (en el futuro) para que las reglas de "reserva ya pasada" no las caduquen
        LocalDate base = LocalDate.now(com.wimbledon.backend.services.ReglasReserva.ZONA).plusDays(30);
        r.setFechaCheckIn(base.plusDays(diaIn));
        r.setFechaCheckOut(base.plusDays(diaOut));
        return r;
    }

    @Test
    void crearReservaQuedaPendienteYReservaLaHabitacion() {
        Reserva creada = service.crearReserva(reserva(null, null, 1, 3));

        assertEquals(EstadoReserva.PENDIENTE, creada.getEstado());
        assertEquals(EstadoHabitacion.RESERVADA, hab.getEstado());
    }

    @Test
    void rechazaReservaQueSeSolapaConOtraVigente() {
        when(reservaRepo.findByHabitacionAndEstados(eq(1L), any()))
                .thenReturn(List.of(reserva(10L, EstadoReserva.CONFIRMADA, 2, 5)));

        assertThrows(RuntimeException.class, () -> service.crearReserva(reserva(null, null, 4, 6)));
    }

    @Test
    void permiteReservaSinSolapamiento() {
        when(reservaRepo.findByHabitacionAndEstados(eq(1L), any()))
                .thenReturn(List.of(reserva(10L, EstadoReserva.CONFIRMADA, 2, 5)));

        assertDoesNotThrow(() -> service.crearReserva(reserva(null, null, 6, 8)));
    }

    @Test
    void checkInOcupaYFinalizarPasaALimpieza() {
        Reserva r = reserva(1L, EstadoReserva.CONFIRMADA, 1, 3);
        when(reservaRepo.findById(1L)).thenReturn(Optional.of(r));

        service.cambiarEstado(1L, EstadoReserva.CHECKIN);
        assertEquals(EstadoHabitacion.OCUPADA, hab.getEstado());

        service.cambiarEstado(1L, EstadoReserva.FINALIZADA);
        assertEquals(EstadoHabitacion.LIMPIEZA_PENDIENTE, hab.getEstado());
    }

    @Test
    void cancelarLiberaLaHabitacion() {
        hab.setEstado(EstadoHabitacion.RESERVADA);
        Reserva r = reserva(1L, EstadoReserva.PENDIENTE, 1, 3);
        when(reservaRepo.findById(1L)).thenReturn(Optional.of(r));
        when(reservaRepo.findByHabitacionAndEstados(eq(1L), any())).thenReturn(List.of(r));

        service.cambiarEstado(1L, EstadoReserva.CANCELADA);

        assertEquals(EstadoHabitacion.DISPONIBLE, hab.getEstado());
    }

    @Test
    void pendientesVencidasSeCancelanYLiberanLaHabitacion() {
        hab.setEstado(EstadoHabitacion.RESERVADA);
        Reserva r = reserva(1L, EstadoReserva.PENDIENTE, 1, 3);
        when(reservaRepo.findByEstadoAndCreadaEnBefore(eq(EstadoReserva.PENDIENTE), any(LocalDateTime.class)))
                .thenReturn(List.of(r));
        when(reservaRepo.findByHabitacionAndEstados(eq(1L), any())).thenReturn(List.of(r));

        service.cancelarPendientesVencidas();

        assertEquals(EstadoReserva.CANCELADA, r.getEstado());
        assertEquals(EstadoHabitacion.DISPONIBLE, hab.getEstado());
    }

    // ---- Cierre automático y extensión ----

    private Reserva enCurso(Long id, EstadoReserva estado, java.time.LocalDateTime entrada, int horas) {
        Reserva r = new Reserva();
        r.setId(id);
        r.setHabitacion(hab);
        r.setEstado(estado);
        r.setFechaCheckIn(entrada.toLocalDate());
        r.setHoraEntradaProgramada(entrada.toLocalTime());
        java.time.LocalDateTime salida = entrada.plusHours(horas);
        r.setFechaCheckOut(salida.toLocalDate());
        r.setHoraSalidaProgramada(salida.toLocalTime());
        r.setTotalPago(new java.math.BigDecimal("120.00"));
        return r;
    }

    @Test
    void confirmadaQueNoLlegoSeFinalizaAlTerminarSuBloqueYLiberaLaHabitacion() {
        hab.setEstado(EstadoHabitacion.RESERVADA);
        Reserva r = enCurso(1L, EstadoReserva.CONFIRMADA, com.wimbledon.backend.services.ReglasReserva.ahora().minusHours(8), 6);
        when(reservaRepo.findByEstado(EstadoReserva.CONFIRMADA)).thenReturn(List.of(r));
        when(reservaRepo.findByEstado(EstadoReserva.CHECKIN)).thenReturn(List.of());
        when(reservaRepo.findByHabitacionAndEstados(eq(1L), any())).thenReturn(List.of(r));

        service.cerrarReservasVencidas();

        assertEquals(EstadoReserva.FINALIZADA, r.getEstado());
        assertTrue(r.getNotasAdicionales().contains("No se presentó"));
        assertEquals(EstadoHabitacion.DISPONIBLE, hab.getEstado()); // nunca se ocupó: sin limpieza
    }

    @Test
    void confirmadaDentroDeSuBloqueNoSeToca() {
        Reserva r = enCurso(1L, EstadoReserva.CONFIRMADA, com.wimbledon.backend.services.ReglasReserva.ahora().minusHours(1), 6);
        when(reservaRepo.findByEstado(EstadoReserva.CONFIRMADA)).thenReturn(List.of(r));
        when(reservaRepo.findByEstado(EstadoReserva.CHECKIN)).thenReturn(List.of());

        service.cerrarReservasVencidas();

        assertEquals(EstadoReserva.CONFIRMADA, r.getEstado());
    }

    @Test
    void checkinSeCierraSoloPasadaLaToleranciaYPideLimpieza() {
        hab.setEstado(EstadoHabitacion.OCUPADA);
        var ahora = com.wimbledon.backend.services.ReglasReserva.ahora();
        Reserva dentro = enCurso(1L, EstadoReserva.CHECKIN, ahora.minusHours(6).minusMinutes(10), 6);  // salió hace 10 min
        Reserva olvidada = enCurso(2L, EstadoReserva.CHECKIN, ahora.minusHours(6).minusMinutes(45), 6); // salió hace 45 min
        when(reservaRepo.findByEstado(EstadoReserva.CONFIRMADA)).thenReturn(List.of());
        when(reservaRepo.findByEstado(EstadoReserva.CHECKIN)).thenReturn(List.of(dentro, olvidada));

        service.cerrarReservasVencidas();

        assertEquals(EstadoReserva.CHECKIN, dentro.getEstado());
        assertEquals(EstadoReserva.FINALIZADA, olvidada.getEstado());
        assertEquals(EstadoHabitacion.LIMPIEZA_PENDIENTE, hab.getEstado());
    }

    @Test
    void extenderMueveLaSalidaYSumaElCobroProporcional() {
        hab.setPrecioBloque(new java.math.BigDecimal("120.00"));
        var ahora = com.wimbledon.backend.services.ReglasReserva.ahora();
        Reserva r = enCurso(1L, EstadoReserva.CHECKIN, ahora.minusHours(5), 6);
        var salidaAntes = com.wimbledon.backend.services.ReglasReserva.fin(r);
        when(reservaRepo.findById(1L)).thenReturn(Optional.of(r));
        when(reservaRepo.findByHabitacionAndEstados(eq(1L), any())).thenReturn(List.of());

        Reserva ext = service.extenderReserva(1L, 2, null);

        assertEquals(salidaAntes.plusHours(2), com.wimbledon.backend.services.ReglasReserva.fin(ext));
        assertEquals(0, new java.math.BigDecimal("160.00").compareTo(ext.getTotalPago())); // 120 + 2 h × 20
    }

    @Test
    void extenderSeRechazaSiLaHabitacionTieneOtraReservaDespues() {
        var ahora = com.wimbledon.backend.services.ReglasReserva.ahora();
        Reserva r = enCurso(1L, EstadoReserva.CHECKIN, ahora.minusHours(5), 6);
        Reserva siguiente = enCurso(2L, EstadoReserva.CONFIRMADA, com.wimbledon.backend.services.ReglasReserva.fin(r).plusMinutes(30), 6);
        when(reservaRepo.findById(1L)).thenReturn(Optional.of(r));
        when(reservaRepo.findByHabitacionAndEstados(eq(1L), any())).thenReturn(List.of(siguiente));

        assertThrows(com.wimbledon.backend.services.TransicionInvalidaException.class, () -> service.extenderReserva(1L, 2, null));
    }

    @Test
    void soloSeExtiendeUnaReservaEnCheckin() {
        Reserva r = enCurso(1L, EstadoReserva.CONFIRMADA, com.wimbledon.backend.services.ReglasReserva.ahora().plusHours(1), 6);
        when(reservaRepo.findById(1L)).thenReturn(Optional.of(r));

        assertThrows(com.wimbledon.backend.services.TransicionInvalidaException.class, () -> service.extenderReserva(1L, 1, null));
    }

    @Test
    void noSePuedeEditarUnaReservaQueYaEmpezo() {
        Reserva r = enCurso(1L, EstadoReserva.CONFIRMADA, com.wimbledon.backend.services.ReglasReserva.ahora().minusMinutes(5), 6);
        when(reservaRepo.findById(1L)).thenReturn(Optional.of(r));
        Reserva datos = new Reserva();
        datos.setNombreHuesped("Otro nombre");

        assertThrows(com.wimbledon.backend.services.TransicionInvalidaException.class, () -> service.actualizarReserva(1L, datos));
    }

    @Test
    void noSePuedeCancelarUnaConfirmadaAMenosDe3Horas() {
        Reserva r = enCurso(1L, EstadoReserva.CONFIRMADA, com.wimbledon.backend.services.ReglasReserva.ahora().plusHours(2), 6);
        when(reservaRepo.findById(1L)).thenReturn(Optional.of(r));

        assertThrows(com.wimbledon.backend.services.TransicionInvalidaException.class, () -> service.cambiarEstado(1L, EstadoReserva.CANCELADA));
    }
}
