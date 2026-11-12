package com.wimbledon.backend.services;

import com.wimbledon.backend.dto.SoporteReporteRequest;
import com.wimbledon.backend.dto.SoporteReporteResponse;
import com.wimbledon.backend.entities.ReporteSoporte;
import com.wimbledon.backend.enums.EstadoReserva;
import com.wimbledon.backend.enums.EstadoSoporte;
import com.wimbledon.backend.enums.OrigenSoporte;
import com.wimbledon.backend.enums.PrioridadSoporte;
import com.wimbledon.backend.repositories.ReporteSoporteRepository;
import com.wimbledon.backend.repositories.ReservaRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Locale;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SoporteService {

    // Un huésped puede reportar si su reserva está pagada (CONFIRMADA) o ya ingresó (CHECKIN)
    private static final List<EstadoReserva> ESTADOS_HUESPED =
            List.of(EstadoReserva.CONFIRMADA, EstadoReserva.CHECKIN);

    private final ReporteSoporteRepository repository;
    private final ReservaRepository reservaRepository;

    public List<SoporteReporteResponse> listar() {
        return repository.findAllByOrderByCreadoEnDesc()
                .stream()
                .map(SoporteReporteResponse::from)
                .toList();
    }

    /** Incidencias generadas por clientes que administración todavía no revisa. */
    public List<SoporteReporteResponse> listarEscaladas() {
        return repository.findByEscaladoAdminTrueAndRevisadoAdminFalseOrderByCreadoEnDesc()
                .stream()
                .map(SoporteReporteResponse::from)
                .toList();
    }

    @Transactional
    public SoporteReporteResponse marcarRevisado(Long id) {
        ReporteSoporte entity = repository.findById(id)
                .orElseThrow(() -> new ReporteNoEncontradoException(id));
        entity.setRevisadoAdmin(true);
        return SoporteReporteResponse.from(entity);
    }

    @Transactional
    public SoporteReporteResponse crear(SoporteReporteRequest request, boolean esPersonal) {
        if (request == null) {
            throw new IllegalArgumentException("Faltan los datos del reporte.");
        }
        String habitacion = requerido(request.habitacion(), 50, "habitacion");
        String categoria = requerido(request.categoria(), 80, "categoria");
        String descripcion = requerido(request.descripcion(), 2000, "descripcion");
        String nombreContacto = limpiarONulo(request.nombreContacto(), 255);
        String contacto = limpiarONulo(request.contacto(), 255);
        String origen = requerido(request.origen(), 20, "origen");
        String prioridad = requerido(request.prioridad(), 10, "prioridad");

        OrigenSoporte origenReporte = parseEnum(OrigenSoporte.class, origen, "origen");

        // Sin sesión de empleado solo reporta un huésped registrado: su documento debe coincidir
        // con una reserva vigente de esa habitación. El origen LIMPIEZA es exclusivo del personal.
        if (!esPersonal) {
            if (origenReporte != OrigenSoporte.CLIENTE) {
                throw new NoAutorizadoException("Inicia sesión como personal para registrar este reporte.");
            }
            String documento = requerido(request.documento(), 20, "documento").toUpperCase(Locale.ROOT);
            if (!reservaRepository.existsHuespedEnHabitacion(habitacion, documento, ESTADOS_HUESPED)) {
                throw new NoAutorizadoException("No encontramos una reserva vigente en la habitación " + habitacion
                        + " con ese documento. Solo los huéspedes registrados pueden reportar a soporte.");
            }
        }

        ReporteSoporte entity = ReporteSoporte.builder()
                .origen(origenReporte)
                .habitacion(habitacion)
                .nombreContacto(nombreContacto)
                .contacto(contacto)
                .categoria(categoria)
                .prioridad(parseEnum(PrioridadSoporte.class, prioridad, "prioridad"))
                .descripcion(descripcion)
                .estado(EstadoSoporte.PENDIENTE)
                .escaladoAdmin(origenReporte == OrigenSoporte.CLIENTE) // lo reportado por clientes llega a administración
                .build();
        return SoporteReporteResponse.from(repository.save(entity));
    }

    @Transactional
    public SoporteReporteResponse actualizarEstado(Long id, String estado) {
        ReporteSoporte entity = repository.findById(id)
                .orElseThrow(() -> new ReporteNoEncontradoException(id));
        EstadoSoporte nuevoEstado = parseEnum(EstadoSoporte.class, estado, "estado");
        if (nuevoEstado == EstadoSoporte.PENDIENTE) {
            throw new IllegalArgumentException("Un reporte no puede volver a PENDIENTE.");
        }
        if (entity.getEstado() == EstadoSoporte.RESUELTO) {
            throw new IllegalArgumentException("El reporte ya fue resuelto.");
        }
        entity.setEstado(nuevoEstado);
        return SoporteReporteResponse.from(entity);
    }

    private String requerido(String valor, int max, String field) {
        if (valor == null || valor.trim().isEmpty()) {
            throw new IllegalArgumentException("Falta el campo " + field + ".");
        }
        return limpiar(valor, max);
    }

    private String limpiar(String valor, int max) {
        if (valor == null) {
            return null;
        }
        String limpio = valor.trim();
        if (limpio.length() > max) {
            throw new IllegalArgumentException("El valor supera el limite de " + max + " caracteres.");
        }
        return limpio;
    }

    private String limpiarONulo(String valor, int max) {
        String limpio = limpiar(valor, max);
        return limpio == null || limpio.isEmpty() ? null : limpio;
    }

    private <T extends Enum<T>> T parseEnum(Class<T> type, String value, String field) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException("Falta el campo " + field + ".");
        }
        try {
            return Enum.valueOf(type, value.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException ex) {
            throw new IllegalArgumentException("Valor invalido para " + field + ": " + value + ".");
        }
    }

    /** Quien reporta no es personal con sesión ni un huésped con reserva vigente en esa habitación. */
    public static class NoAutorizadoException extends RuntimeException {
        public NoAutorizadoException(String mensaje) {
            super(mensaje);
        }
    }

    public static class ReporteNoEncontradoException extends RuntimeException {
        public ReporteNoEncontradoException(Long id) {
            super("No existe un reporte de soporte con id " + id + ".");
        }
    }
}
