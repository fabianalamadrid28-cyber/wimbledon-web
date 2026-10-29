package com.wimbledon.backend.services;

import com.wimbledon.backend.entities.Habitacion;
import com.wimbledon.backend.entities.Reserva;
import com.wimbledon.backend.enums.EstadoReserva;
import com.wimbledon.backend.repositories.HabitacionRepository;
import com.wimbledon.backend.repositories.ReservaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class ReservaService {

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
            reserva.setEstado(EstadoReserva.CONFIRMADA);
        }

        if (reserva.getCodigo() == null || reserva.getCodigo().isBlank()) {
            reserva.setCodigo("#R-" + (1000 + (int)(Math.random() * 9000)));
        }

        if (reserva.getFechaReserva() == null) {
            reserva.setFechaReserva(LocalDate.now());
        }

        return reservaRepository.save(reserva);
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

        return reservaRepository.save(res);
    }

    @Transactional
    public Reserva cambiarEstado(Long id, EstadoReserva nuevoEstado) {
        Reserva res = reservaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reserva no encontrada con ID: " + id));
        res.setEstado(nuevoEstado);
        return reservaRepository.save(res);
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

        return reservaRepository.save(nuevaReserva);
    }
}
