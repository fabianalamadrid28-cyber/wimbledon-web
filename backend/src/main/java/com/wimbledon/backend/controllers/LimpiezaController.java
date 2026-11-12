package com.wimbledon.backend.controllers;

import com.wimbledon.backend.dto.LimpiezaResumenResponse;
import com.wimbledon.backend.services.LimpiezaService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/limpiezas")
public class LimpiezaController {

    private final LimpiezaService service;

    public LimpiezaController(LimpiezaService service) {
        this.service = service;
    }

    /** Historial de limpiezas terminadas con su demora y el promedio. */
    @GetMapping
    public LimpiezaResumenResponse listar() {
        return service.resumen();
    }
}
