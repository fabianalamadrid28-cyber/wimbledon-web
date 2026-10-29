package com.wimbledon.backend.controllers;

import com.wimbledon.backend.entities.Habitacion;
import com.wimbledon.backend.enums.EstadoHabitacion;
import com.wimbledon.backend.services.HabitacionService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/habitaciones")
@CrossOrigin(origins = "*")
public class HabitacionController {

    private final HabitacionService habitacionService;

    public HabitacionController(HabitacionService habitacionService) {
        this.habitacionService = habitacionService;
    }

    @GetMapping
    public ResponseEntity<List<Habitacion>> listarHabitaciones(@RequestParam(required = false) EstadoHabitacion estado) {
        if (estado != null) {
            return ResponseEntity.ok(habitacionService.listarPorEstado(estado));
        }
        return ResponseEntity.ok(habitacionService.listarTodas());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerPorId(@PathVariable Long id) {
        return habitacionService.obtenerPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> crearHabitacion(@RequestBody Habitacion habitacion) {
        try {
            Habitacion creada = habitacionService.guardar(habitacion);
            return new ResponseEntity<>(creada, HttpStatus.CREATED);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> actualizarHabitacion(@PathVariable Long id, @RequestBody Habitacion datos) {
        try {
            Habitacion actualizada = habitacionService.actualizar(id, datos);
            return ResponseEntity.ok(actualizada);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PatchMapping("/{id}/estado")
    public ResponseEntity<?> cambiarEstado(@PathVariable Long id, @RequestBody Map<String, String> body) {
        try {
            String nuevoEstadoStr = body.get("estado");
            EstadoHabitacion estado = EstadoHabitacion.valueOf(nuevoEstadoStr.toUpperCase());
            Habitacion actualizada = habitacionService.cambiarEstado(id, estado);
            return ResponseEntity.ok(actualizada);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarHabitacion(@PathVariable Long id) {
        try {
            habitacionService.eliminar(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}

