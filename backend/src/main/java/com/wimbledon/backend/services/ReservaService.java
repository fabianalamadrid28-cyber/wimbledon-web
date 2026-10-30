package com.wimbledon.backend.services;

import com.wimbledon.backend.entities.Habitacion;
import com.wimbledon.backend.entities.Reserva;
import com.wimbledon.backend.enums.EstadoHabitacion;
import com.wimbledon.backend.enums.EstadoReserva;
import com.wimbledon.backend.repositories.HabitacionRepository;
import com.wimbledon.backend.repositories.ReservaRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class ReservaService {

    private static final int MINUTOS_PARA_CONFIRMAR = 15;
    private static final List<EstadoReserva> ESTADOS_VIGENTES =
            List.of(EstadoReserva.PENDIENTE, EstadoReserva.CONFIRMADA, EstadoReserva.CHECKIN);

    private final ReservaRepository reservaRepository;
    private final HabitacionRepository habitacionRepository;

    public ReservaService(ReservaRepository reservaRepository, HabitacionRepository habitacionRepository) {
        this.reservaRepository = reservaRepository;
        this.habitacionRepository = habitacionRepository;
    }

    public List<Reserva> listarTodas() {
        return reservaRepository.findAll();
    }

    public Optional<Reserva> obtenerPorId(Long id) {
        return reservaRepository.findById(id);
    }

    public Optional<Reserva> obtenerPorQr(String qr) {
        return reservaRepository.findByTokenAccesoQr(qr);
    }

    @Transactional
    public Reserva crearReserva(Reserva reserva) {
        if (reserva.getHabitacion() != null && reserva.getHabitacion().getId() != null) {
            Habitacion hab = habitacionRepository.findById(reserva.getHabitacion().getId())
                    .orElseThrow(() -> new RuntimeException("Habitación no encontrada"));
            reserva.setHabitacion(hab);
        }

        if (reserva.getTokenAccesoQr() == null || reserva.getTokenAccesoQr().isBlank()) {
            reserva.setTokenAccesoQr(UUID.randomUUID().toString());
        }

        if (reserva.getEstado() == null) {
            reserva.setEstado(EstadoReserva.PENDIENTE);
        }

        validarSinSolapamiento(reserva);

        if (reserva.getCodigo() == null || reserva.getCodigo().isBlank()) {
            reserva.setCodigo("#R-" + (1000 + (int)(Math.random() * 9000)));
        }

        if (reserva.getFechaReserva() == null) {
            reserva.setFechaReserva(LocalDate.now());
        }

        Reserva guardada = reservaRepository.save(reserva);
        sincronizarHabitacion(guardada);
        return guardada;
    }

    @Transactional
    public Reserva actualizarReserva(Long id, Reserva datos) {
        Reserva res = reservaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reserva no encontrada con ID: " + id));

        if (datos.getNombreHuesped() != null) res.setNombreHuesped(datos.getNombreHuesped());
        if (datos.getDocumentoHuesped() != null) res.setDocumentoHuesped(datos.getDocumentoHuesped());
        if (datos.getEmailHuesped() != null) res.setEmailHuesped(datos.getEmailHuesped());
        if (datos.getTelefonoWhatsApp() != null) res.setTelefonoWhatsApp(datos.getTelefonoWhatsApp());
        if (datos.getFechaCheckIn() != null) res.setFechaCheckIn(datos.getFechaCheckIn());
        if (datos.getFechaCheckOut() != null) res.setFechaCheckOut(datos.getFechaCheckOut());
        if (datos.getEstado() != null) res.setEstado(datos.getEstado());
        if (datos.getTotalPago() != null) res.setTotalPago(datos.getTotalPago());
        if (datos.getNotasAdicionales() != null) res.setNotasAdicionales(datos.getNotasAdicionales());

        if (datos.getHabitacion() != null && datos.getHabitacion().getId() != null) {
            Habitacion hab = habitacionRepository.findById(datos.getHabitacion().getId())
                    .orElseThrow(() -> new RuntimeException("Habitación no encontrada"));
            res.setHabitacion(hab);
        }

        validarSinSolapamiento(res);
        Reserva guardada = reservaRepository.save(res);
        sincronizarHabitacion(guardada);
        return guardada;
    }

    @Transactional
    public Reserva cambiarEstado(Long id, EstadoReserva nuevoEstado) {
        Reserva res = reservaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reserva no encontrada con ID: " + id));
        res.setEstado(nuevoEstado);
        Reserva guardada = reservaRepository.save(res);
        sincronizarHabitacion(guardada);
        return guardada;
    }

    /** Cada 30 s: las reservas PENDIENTE sin confirmar en 15 min se cancelan y liberan la habitación. */
    @Scheduled(fixedRate = 30_000)
    @Transactional
    public void cancelarPendientesVencidas() {
        LocalDateTime limite = LocalDateTime.now().minusMinutes(MINUTOS_PARA_CONFIRMAR);
        for (Reserva r : reservaRepository.findByEstadoAndCreadaEnBefore(EstadoReserva.PENDIENTE, limite)) {
            r.setEstado(EstadoReserva.CANCELADA);
            reservaRepository.save(r);
            sincronizarHabitacion(r);
        }
    }

    // Una habitación no puede tener dos reservas vigentes cuyas fechas (u horas, si es el mismo día) se crucen
    private void validarSinSolapamiento(Reserva nueva) {
        if (nueva.getHabitacion() == null || nueva.getFechaCheckIn() == null || nueva.getFechaCheckOut() == null) return;
        if (nueva.getEstado() == EstadoReserva.CANCELADA || nueva.getEstado() == EstadoReserva.FINALIZADA) return;

        for (Reserva r : reservaRepository.findByHabitacionAndEstados(nueva.getHabitacion().getId(), ESTADOS_VIGENTES)) {
            if (r.getId() != null && r.getId().equals(nueva.getId())) continue;
            if (r.getFechaCheckIn() == null || r.getFechaCheckOut() == null) continue;

            boolean fechasSeCruzan = !nueva.getFechaCheckIn().isAfter(r.getFechaCheckOut())
                    && !nueva.getFechaCheckOut().isBefore(r.getFechaCheckIn());
            if (!fechasSeCruzan) continue;

            boolean mismoDia = nueva.getFechaCheckIn().equals(nueva.getFechaCheckOut())
                    && r.getFechaCheckIn().equals(r.getFechaCheckOut())
                    && nueva.getFechaCheckIn().equals(r.getFechaCheckIn());
            boolean conHoras = nueva.getHoraEntradaProgramada() != null && nueva.getHoraSalidaProgramada() != null
                    && r.getHoraEntradaProgramada() != null && r.getHoraSalidaProgramada() != null;
            if (mismoDia && conHoras && !(nueva.getHoraEntradaProgramada().isBefore(r.getHoraSalidaProgramada())
                    && nueva.getHoraSalidaProgramada().isAfter(r.getHoraEntradaProgramada()))) {
                continue;
            }
            throw new RuntimeException("La habitación ya está reservada en las fechas seleccionadas.");
        }
    }

    // Mantiene el estado de la habitación coherente con el de la reserva
    private void sincronizarHabitacion(Reserva res) {
        Habitacion hab = res.getHabitacion();
        if (hab == null) return;
        EstadoHabitacion actual = hab.getEstado();

        switch (res.getEstado()) {
            case PENDIENTE, CONFIRMADA -> {
                if (actual == EstadoHabitacion.DISPONIBLE || actual == EstadoHabitacion.LISTA) {
                    hab.setEstado(EstadoHabitacion.RESERVADA);
                }
            }
            case CHECKIN -> hab.setEstado(EstadoHabitacion.OCUPADA);
            case FINALIZADA -> hab.setEstado(EstadoHabitacion.LIMPIEZA_PENDIENTE);
            case CANCELADA -> {
                boolean otraVigente = reservaRepository.findByHabitacionAndEstados(hab.getId(), ESTADOS_VIGENTES)
                        .stream().anyMatch(r -> !r.getId().equals(res.getId()));
                if (!otraVigente && (actual == EstadoHabitacion.RESERVADA || actual == EstadoHabitacion.OCUPADA)) {
                    hab.setEstado(EstadoHabitacion.DISPONIBLE);
                }
            }
        }
        habitacionRepository.save(hab);
    }

    @Transactional
    public void eliminarReserva(Long id) {
        reservaRepository.deleteById(id);
    }

    @Transactional
    public Reserva registrarReservaExpress(Reserva nuevaReserva) {
        Habitacion hab = habitacionRepository.findById(nuevaReserva.getHabitacion().getId())
                .orElseThrow(() -> new RuntimeException("Error: La habitación seleccionada no existe."));

        LocalTime entrada = nuevaReserva.getHoraEntradaProgramada();
        if (entrada == null) entrada = LocalTime.now();
        LocalTime salida;
        
        if (nuevaReserva.getBloqueSeleccionado() != null && nuevaReserva.getBloqueSeleccionado().equalsIgnoreCase("6 HORAS")) {
            salida = entrada.plusHours(6);
        } else if (nuevaReserva.getBloqueSeleccionado() != null && nuevaReserva.getBloqueSeleccionado().equalsIgnoreCase("7 HORAS")) {
            salida = entrada.plusHours(7);
        } else {
            salida = LocalTime.of(11, 0);
        }
        nuevaReserva.setHoraSalidaProgramada(salida);

        if (nuevaReserva.getFechaReserva() == null) {
            nuevaReserva.setFechaReserva(LocalDate.now());
        }

        List<Reserva> reservasExistentes = reservaRepository
                .findReservasActivasPorHabitacionYFecha(hab.getId(), nuevaReserva.getFechaReserva());

        for (Reserva r : reservasExistentes) {
            if (r.getHoraSalidaProgramada() != null && r.getHoraEntradaProgramada() != null) {
                boolean seCruza = (entrada.isBefore(r.getHoraSalidaProgramada()) && salida.isAfter(r.getHoraEntradaProgramada()));
                if (seCruza) {
                    throw new RuntimeException("Lo sentimos, esta suite ya está reservada en el rango horario seleccionado.");
                }
            }
        }

        nuevaReserva.setTokenAccesoQr(UUID.randomUUID().toString());
        nuevaReserva.setEstado(EstadoReserva.CONFIRMADA);
        nuevaReserva.setHabitacion(hab);
        if (nuevaReserva.getCodigo() == null) {
            nuevaReserva.setCodigo("#R-" + (1000 + (int)(Math.random() * 9000)));
        }

        Reserva guardada = reservaRepository.save(nuevaReserva);
        sincronizarHabitacion(guardada);
        return guardada;
    }
}
