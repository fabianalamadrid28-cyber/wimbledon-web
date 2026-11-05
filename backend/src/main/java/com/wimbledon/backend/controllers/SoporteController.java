package com.wimbledon.backend.controllers;

import com.wimbledon.backend.dto.SoporteReporteRequest;
import com.wimbledon.backend.dto.SoporteReporteResponse;
import com.wimbledon.backend.services.SoporteService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/soporte")
public class SoporteController {

    private final SoporteService service;

    public SoporteController(SoporteService service) {
        this.service = service;
    }

    /** Lista todos los reportes (el personal de limpieza usa esta bandeja). */
    @GetMapping
    public List<SoporteReporteResponse> listar() {
        return service.listar();
    }

    /** Crea un reporte desde el sitio público o desde el panel de limpieza. */
    @PostMapping
    public ResponseEntity<?> crear(@RequestBody SoporteReporteRequest body) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(service.crear(body));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("mensaje", ex.getMessage()));
        }
    }

    /** Actualiza el estado de atención al cliente. */
    @PatchMapping("/{id}/estado")
    public ResponseEntity<?> actualizarEstado(@PathVariable Long id, @RequestBody Map<String, String> body) {
        try {
            return ResponseEntity.ok(service.actualizarEstado(id, body == null ? null : body.get("estado")));
        } catch (SoporteService.ReporteNoEncontradoException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("mensaje", ex.getMessage()));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("mensaje", ex.getMessage()));
        }
    }
}
