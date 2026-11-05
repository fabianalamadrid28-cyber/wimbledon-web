package com.wimbledon.backend.dto;

public record SoporteReporteRequest(
        String origen,
        String habitacion,
        String nombreContacto,
        String contacto,
        String categoria,
        String prioridad,
        String descripcion
) {}
