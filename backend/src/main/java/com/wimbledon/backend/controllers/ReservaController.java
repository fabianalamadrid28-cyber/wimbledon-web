package com.wimbledon.backend.controllers;

import com.wimbledon.backend.entities.Reserva;
import com.wimbledon.backend.enums.EstadoReserva;
import com.wimbledon.backend.services.ReservaService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/reservas")
@CrossOrigin(origins = "*")
public class ReservaController {

    private final ReservaService reservaService;

    public ReservaController(ReservaService reservaService) {
        this.reservaService = reservaService;
    }

    @GetMapping
    public ResponseEntity<List<Reserva>> listarReservas() {
        return ResponseEntity.ok(reservaService.listarTodas());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerPorId(@PathVariable Long id) {
        return reservaService.obtenerPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> crearReserva(@RequestBody Reserva nuevaReserva) {
        try {
            Reserva creada = reservaService.crearReserva(nuevaReserva);
            return new ResponseEntity<>(creada, HttpStatus.CREATED);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> actualizarReserva(@PathVariable Long id, @RequestBody Reserva datos) {
        try {
            Reserva actualizada = reservaService.actualizarReserva(id, datos);
            return ResponseEntity.ok(actualizada);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PatchMapping("/{id}/estado")
    public ResponseEntity<?> cambiarEstado(@PathVariable Long id, @RequestBody Map<String, String> body) {
        try {
            String nuevoEstadoStr = body.get("estado");
            EstadoReserva estado = EstadoReserva.valueOf(nuevoEstadoStr.toUpperCase());
            Reserva actualizada = reservaService.cambiarEstado(id, estado);
            return ResponseEntity.ok(actualizada);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarReserva(@PathVariable Long id) {
        try {
            reservaService.eliminarReserva(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/express")
    public ResponseEntity<?> crearReservaExpress(@RequestBody Reserva nuevaReserva) {
        try {
            Reserva reservaCreada = reservaService.registrarReservaExpress(nuevaReserva);
            return new ResponseEntity<>(reservaCreada, HttpStatus.CREATED);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return new ResponseEntity<>("Error interno en el servidor al procesar la reserva.", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
