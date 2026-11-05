package com.wimbledon.backend.dto;

import com.wimbledon.backend.entities.ReporteSoporte;

import java.time.format.DateTimeFormatter;

public record SoporteReporteResponse(
        Long id,
        String origen,
        String habitacion,
        String nombreContacto,
        String contacto,
        String categoria,
        String prioridad,
        String descripcion,
        String estado,
        String creadoEn
) {
    private static final DateTimeFormatter FORMATO = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

    public static SoporteReporteResponse from(ReporteSoporte entity) {
        return new SoporteReporteResponse(
                entity.getId(),
                entity.getOrigen().name(),
                entity.getHabitacion(),
                entity.getNombreContacto(),
                entity.getContacto(),
                entity.getCategoria(),
                entity.getPrioridad().name(),
                entity.getDescripcion(),
                entity.getEstado().name(),
                entity.getCreadoEn() != null ? entity.getCreadoEn().format(FORMATO) : null
        );
    }
}
