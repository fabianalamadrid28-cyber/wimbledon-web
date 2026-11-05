package com.wimbledon.backend.services;

import com.wimbledon.backend.dto.SoporteReporteRequest;
import com.wimbledon.backend.dto.SoporteReporteResponse;
import com.wimbledon.backend.entities.ReporteSoporte;
import com.wimbledon.backend.enums.EstadoSoporte;
import com.wimbledon.backend.enums.OrigenSoporte;
import com.wimbledon.backend.enums.PrioridadSoporte;
import com.wimbledon.backend.repositories.ReporteSoporteRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Locale;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SoporteService {

    private final ReporteSoporteRepository repository;

    public List<SoporteReporteResponse> listar() {
        return repository.findAllByOrderByCreadoEnDesc()
                .stream()
                .map(SoporteReporteResponse::from)
                .toList();
    }

    @Transactional
    public SoporteReporteResponse crear(SoporteReporteRequest request) {
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

        ReporteSoporte entity = ReporteSoporte.builder()
                .origen(parseEnum(OrigenSoporte.class, origen, "origen"))
                .habitacion(habitacion)
                .nombreContacto(nombreContacto)
                .contacto(contacto)
                .categoria(categoria)
                .prioridad(parseEnum(PrioridadSoporte.class, prioridad, "prioridad"))
                .descripcion(descripcion)
                .estado(EstadoSoporte.PENDIENTE)
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

    public static class ReporteNoEncontradoException extends RuntimeException {
        public ReporteNoEncontradoException(Long id) {
            super("No existe un reporte de soporte con id " + id + ".");
        }
    }
}
