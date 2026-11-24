package com.wimbledon.backend.controllers;

import com.wimbledon.backend.dto.BonoClienteResponse;
import com.wimbledon.backend.dto.ValidarBonoRequest;
import com.wimbledon.backend.dto.ValidarBonoResponse;
import com.wimbledon.backend.entities.Bono;
import com.wimbledon.backend.services.BonoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/bonos")
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000"})
@RequiredArgsConstructor
public class BonoController {

    private final BonoService bonoService;

    @GetMapping("/catalogo")
    public ResponseEntity<List<Bono>> obtenerCatalogo() {
        return ResponseEntity.ok(bonoService.obtenerCatalogo());
    }

    @GetMapping("/cliente")
    public ResponseEntity<BonoClienteResponse> consultarPorCliente(@RequestParam(required = false) String documento) {
        return ResponseEntity.ok(bonoService.consultarPorDocumento(documento));
    }

    @PostMapping("/validar")
    public ResponseEntity<ValidarBonoResponse> validarBono(@RequestBody ValidarBonoRequest request) {
        return ResponseEntity.ok(bonoService.validarBono(request));
    }
}
