package com.wimbledon.backend.dto;

import java.util.List;

/** Historial de limpiezas terminadas y el promedio de demora (en segundos). */
public record LimpiezaResumenResponse(
        List<LimpiezaRegistroResponse> registros,
        Long promedioSegundos,
        int total
) {}
