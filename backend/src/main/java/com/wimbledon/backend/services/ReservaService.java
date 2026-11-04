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
import java.math.BigDecimal;
import java.math.RoundingMode;
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
    private final ClienteService clienteService;

    public ReservaService(ReservaRepository reservaRepository, HabitacionRepository habitacionRepository,
                          ClienteService clienteService) {
        this.reservaRepository = reservaRepository;
        this.habitacionRepository = habitacionRepository;
        this.clienteService = clienteService;
    }

    // Guarda (o actualiza) al cliente de la reserva en la tabla "clientes"
    private void registrarCliente(Reserva reserva) {
        String documento = reserva.getDocumentoHuesped();
        String nombre = reserva.getNombreHuesped();
        if (documento == null || documento.isBlank() || nombre == null || nombre.isBlank()) return;
        clienteService.registrarOActualizar(documento, nombre, reserva.getTelefonoWhatsApp());
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

        registrarCliente(reserva);
        Reserva guardada = reservaRepository.save(reserva);
        sincronizarHabitacion(guardada);
        return guardada;
    }

    @Transactional
    public Reserva actualizarReserva(Long id, Reserva datos) {
        Reserva res = reservaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reserva no encontrada con ID: " + id));
        LocalDateTime ahora = ReglasReserva.ahora();

        // Cancelar por esta vía sigue la misma regla de las 3 horas que el PATCH /estado
        boolean cancelando = datos.getEstado() == EstadoReserva.CANCELADA && res.getEstado() != EstadoReserva.CANCELADA;
        if (cancelando) {
            String motivo = ReglasReserva.motivoNoCancelable(res, ahora);
            if (motivo != null) throw new TransicionInvalidaException(motivo);
        }

        // Cualquier cambio de datos (no de estado) exige que la reserva siga siendo editable
        if (cambiaDatos(datos)) {
            String motivo = ReglasReserva.motivoNoEditable(res, ahora);
            if (motivo != null) throw new TransicionInvalidaException(motivo);
        }

        if (datos.getNombreHuesped() != null) res.setNombreHuesped(datos.getNombreHuesped());
        if (datos.getDocumentoHuesped() != null) res.setDocumentoHuesped(datos.getDocumentoHuesped());
        if (datos.getEmailHuesped() != null) res.setEmailHuesped(datos.getEmailHuesped());
        if (datos.getTelefonoWhatsApp() != null) res.setTelefonoWhatsApp(datos.getTelefonoWhatsApp());
        if (datos.getFechaCheckIn() != null) res.setFechaCheckIn(datos.getFechaCheckIn());
        if (datos.getFechaCheckOut() != null) res.setFechaCheckOut(datos.getFechaCheckOut());
        if (datos.getHoraEntradaProgramada() != null) res.setHoraEntradaProgramada(datos.getHoraEntradaProgramada());
        if (datos.getHoraSalidaProgramada() != null) res.setHoraSalidaProgramada(datos.getHoraSalidaProgramada());
        if (datos.getBloqueSeleccionado() != null) res.setBloqueSeleccionado(datos.getBloqueSeleccionado());
        if (datos.getEstado() != null) {
            TransicionEstados.validar(res.getEstado(), datos.getEstado());
            res.setEstado(datos.getEstado());
        }
        if (datos.getTotalPago() != null) res.setTotalPago(datos.getTotalPago());
        if (datos.getNotasAdicionales() != null) res.setNotasAdicionales(datos.getNotasAdicionales());

        if (datos.getHabitacion() != null && datos.getHabitacion().getId() != null) {
            Habitacion hab = habitacionRepository.findById(datos.getHabitacion().getId())
                    .orElseThrow(() -> new RuntimeException("Habitación no encontrada"));
            res.setHabitacion(hab);
        }

        // Tampoco se puede mover una reserva al pasado
        if (cambiaDatos(datos) && !cancelando) {
            LocalDateTime nuevoInicio = ReglasReserva.inicio(res);
            if (nuevoInicio != null && !nuevoInicio.isAfter(ahora)) {
                throw new TransicionInvalidaException("La nueva fecha y hora de entrada ya pasó; elige un horario futuro.");
            }
        }

        validarSinSolapamiento(res);
        Reserva guardada = reservaRepository.save(res);
        sincronizarHabitacion(guardada);
        return guardada;
    }

    /** True si el PUT trae algo más que un cambio de estado (huésped, fechas, horario, habitación...). */
    private boolean cambiaDatos(Reserva d) {
        return d.getNombreHuesped() != null || d.getDocumentoHuesped() != null || d.getEmailHuesped() != null
                || d.getTelefonoWhatsApp() != null || d.getFechaCheckIn() != null || d.getFechaCheckOut() != null
                || d.getHoraEntradaProgramada() != null || d.getHoraSalidaProgramada() != null
                || d.getBloqueSeleccionado() != null || d.getTotalPago() != null
                || (d.getHabitacion() != null && d.getHabitacion().getId() != null);
    }

    @Transactional
    public Reserva cambiarEstado(Long id, EstadoReserva nuevoEstado) {
        Reserva res = reservaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reserva no encontrada con ID: " + id));
        TransicionEstados.validar(res.getEstado(), nuevoEstado);
        if (nuevoEstado == EstadoReserva.CANCELADA && res.getEstado() != EstadoReserva.CANCELADA) {
            String motivo = ReglasReserva.motivoNoCancelable(res, ReglasReserva.ahora());
            if (motivo != null) throw new TransicionInvalidaException(motivo);
        }
        boolean cambio = res.getEstado() != nuevoEstado;
        if (cambio) {
            validarHabitacion(res, nuevoEstado); // si la habitación no admite el cambio, no se toca nada
        }
        res.setEstado(nuevoEstado);
        Reserva guardada = reservaRepository.save(res);
        if (cambio) {
            sincronizarHabitacion(guardada);
        }
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

    /**
     * Cada minuto limpia lo que se quedó abierto:
     * - CONFIRMADA (pagada) que no llegó: al terminar su bloque pasa a FINALIZADA con nota; no se devuelve ni se cobra nada.
     * - CHECKIN que nadie cerró: a los 30 min de su hora de salida se finaliza (si no, recepción puede extenderla).
     * Asigna el estado directamente, como cancelarPendientesVencidas: son cierres del sistema, no cambios manuales.
     */
    @Scheduled(fixedRate = 60_000)
    @Transactional
    public void cerrarReservasVencidas() {
        LocalDateTime ahora = ReglasReserva.ahora();

        for (Reserva r : reservaRepository.findByEstado(EstadoReserva.CONFIRMADA)) {
            if (!ReglasReserva.noSePresento(r, ahora)) continue;
            r.setEstado(EstadoReserva.FINALIZADA);
            agregarNota(r, "[Auto] No se presentó (reserva pagada, bloque vencido).");
            reservaRepository.save(r);
            liberarHabitacion(r); // nunca se ocupó: no necesita limpieza
        }

        for (Reserva r : reservaRepository.findByEstado(EstadoReserva.CHECKIN)) {
            if (!ReglasReserva.checkinVencida(r, ahora)) continue;
            r.setEstado(EstadoReserva.FINALIZADA);
            agregarNota(r, "[Auto] Check-out cerrado por el sistema: pasaron "
                    + ReglasReserva.MINUTOS_TOLERANCIA_SALIDA + " min de la hora de salida.");
            reservaRepository.save(r);
            sincronizarHabitacion(r); // FINALIZADA → limpieza pendiente
        }
    }

    /**
     * Extiende una reserva en CHECKIN. Cobra la parte proporcional de la tarifa de la habitación
     * (precioBloque / 6 h por hora) salvo que recepción indique otro monto.
     */
    @Transactional
    public Reserva extenderReserva(Long id, int horas, BigDecimal montoManual) {
        if (horas < 1 || horas > 12) throw new RuntimeException("La extensión debe ser de 1 a 12 horas.");
        Reserva res = reservaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reserva no encontrada con ID: " + id));
        if (res.getEstado() != EstadoReserva.CHECKIN) {
            throw new TransicionInvalidaException("Solo se puede extender una reserva con el huésped dentro (CHECKIN); esta está " + res.getEstado() + ".");
        }

        LocalDateTime finActual = ReglasReserva.fin(res);
        LocalDateTime nuevoFin = finActual.plusHours(horas);

        // La habitación no puede tener otra reserva que empiece antes del nuevo fin
        for (Reserva otra : reservaRepository.findByHabitacionAndEstados(res.getHabitacion().getId(),
                List.of(EstadoReserva.PENDIENTE, EstadoReserva.CONFIRMADA))) {
            LocalDateTime ini = ReglasReserva.inicio(otra);
            if (ini != null && ini.isBefore(nuevoFin) && ReglasReserva.fin(otra).isAfter(finActual)) {
                throw new TransicionInvalidaException("No se puede extender: la habitación tiene otra reserva desde las " + ini.toLocalTime() + ".");
            }
        }

        BigDecimal monto = montoManual;
        if (monto == null) {
            BigDecimal tarifa = res.getHabitacion().getPrecioBloque() != null ? res.getHabitacion().getPrecioBloque() : BigDecimal.ZERO;
            monto = tarifa.multiply(BigDecimal.valueOf(horas)).divide(BigDecimal.valueOf(6), 2, RoundingMode.HALF_UP);
        }
        if (monto.signum() < 0) throw new RuntimeException("El monto de la extensión no puede ser negativo.");

        res.setHoraSalidaProgramada(nuevoFin.toLocalTime());
        res.setFechaCheckOut(nuevoFin.toLocalDate());
        res.setTotalPago((res.getTotalPago() != null ? res.getTotalPago() : BigDecimal.ZERO).add(monto));
        agregarNota(res, "Extensión +" + horas + " h (S/ " + monto.toPlainString() + ").");
        return reservaRepository.save(res);
    }

    private void agregarNota(Reserva r, String texto) {
        String previa = r.getNotasAdicionales();
        r.setNotasAdicionales(previa == null || previa.isBlank() ? texto : previa + " | " + texto);
    }

    /** Libera la habitación si ya no queda otra reserva vigente que la use. */
    private void liberarHabitacion(Reserva res) {
        Habitacion hab = res.getHabitacion();
        if (hab == null) return;
        boolean otraVigente = reservaRepository.findByHabitacionAndEstados(hab.getId(), ESTADOS_VIGENTES)
                .stream().anyMatch(r -> !r.getId().equals(res.getId()));
        EstadoHabitacion actual = hab.getEstado();
        if (!otraVigente && (actual == EstadoHabitacion.RESERVADA || actual == EstadoHabitacion.OCUPADA)) {
            hab.setEstado(EstadoHabitacion.DISPONIBLE);
            habitacionRepository.save(hab);
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
                liberarHabitacion(res);
                return;
            }
        }
        habitacionRepository.save(hab);
    }

    /** Check-in ocupa la habitación y finalizar la deja en limpieza: se valida antes de guardar la reserva. */
    private void validarHabitacion(Reserva res, EstadoReserva nuevoEstado) {
        Habitacion hab = res.getHabitacion();
        if (hab == null) return;
        if (nuevoEstado == EstadoReserva.CHECKIN) {
            TransicionEstados.validar(hab.getEstado(), EstadoHabitacion.OCUPADA);
        } else if (nuevoEstado == EstadoReserva.FINALIZADA) {
            TransicionEstados.validar(hab.getEstado(), EstadoHabitacion.LIMPIEZA_PENDIENTE);
        }
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

        registrarCliente(nuevaReserva);
        Reserva guardada = reservaRepository.save(nuevaReserva);
        sincronizarHabitacion(guardada);
        return guardada;
    }
}