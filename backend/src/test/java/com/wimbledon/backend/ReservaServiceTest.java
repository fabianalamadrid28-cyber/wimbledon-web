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
        r.setFechaCheckIn(LocalDate.of(2026, 11, diaIn));
        r.setFechaCheckOut(LocalDate.of(2026, 11, diaOut));
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
}
