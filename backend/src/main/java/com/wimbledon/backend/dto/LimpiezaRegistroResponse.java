package com.wimbledon.backend.dto;

import com.wimbledon.backend.entities.RegistroLimpieza;

import java.time.format.DateTimeFormatter;

public record LimpiezaRegistroResponse(
        Long id,
        String habitacion,
        String personal,
        String inicio,
        String fin,
        Long duracionSegundos,
        String observaciones
) {
    private static final DateTimeFormatter FORMATO = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

    public static LimpiezaRegistroResponse from(RegistroLimpieza r) {
        return new LimpiezaRegistroResponse(
                r.getId(),
                r.getHabitacionNumero(),
                r.getPersonal(),
                r.getInicio() != null ? r.getInicio().format(FORMATO) : null,
                r.getFin() != null ? r.getFin().format(FORMATO) : null,
                r.getDuracionSegundos(),
                r.getObservaciones()
        );
    }
}
