package com.wimbledon.backend.controllers;

import com.wimbledon.backend.entities.Usuario;
import com.wimbledon.backend.enums.Rol;
import com.wimbledon.backend.repositories.UsuarioRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.regex.Pattern;

/**
 * Gestión de cuentas del personal. Solo accesible para ADMIN (ver SecurityConfig).
 * Solo permite crear/editar RECEPCIONISTA y LIMPIEZA: no se pueden crear administradores
 * ni cambiar el rol de un administrador desde esta API.
 */
@RestController
@RequestMapping("/api/v1/usuarios")
public class UsuarioController {

    public record UsuarioRequest(String email, String nombreCompleto, String telefono,
                                 String rol, String password, Boolean activo) {}

    private static final Set<Rol> ROLES_GESTIONABLES = Set.of(Rol.RECEPCIONISTA, Rol.LIMPIEZA);
    private static final Pattern EMAIL = Pattern.compile("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$");
    private static final int MIN_PASSWORD = 8;

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public UsuarioController(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping
    public List<Map<String, Object>> listar() {
        return usuarioRepository.findAll().stream()
                .filter(u -> u.getRol() != Rol.CLIENTE)
                .map(this::dto)
                .toList();
    }

    @PostMapping
    public ResponseEntity<?> crear(@RequestBody UsuarioRequest r) {
        String email = r.email() == null ? "" : r.email().trim().toLowerCase();
        if (!EMAIL.matcher(email).matches()) return error(HttpStatus.BAD_REQUEST, "Correo electrónico inválido.");
        if (r.nombreCompleto() == null || r.nombreCompleto().isBlank())
            return error(HttpStatus.BAD_REQUEST, "El nombre es obligatorio.");
        if (r.password() == null || r.password().length() < MIN_PASSWORD)
            return error(HttpStatus.BAD_REQUEST, "La contraseña debe tener al menos " + MIN_PASSWORD + " caracteres.");
        Rol rol = rolGestionable(r.rol());
        if (rol == null) return error(HttpStatus.FORBIDDEN, "Solo se pueden crear cuentas de RECEPCIONISTA o LIMPIEZA.");
        if (usuarioRepository.findByUsername(email).isPresent())
            return error(HttpStatus.CONFLICT, "Ya existe una cuenta con ese correo.");

        Usuario u = usuarioRepository.save(Usuario.builder()
                .username(email)
                .password(passwordEncoder.encode(r.password()))
                .nombreCompleto(r.nombreCompleto().trim())
                .telefono(r.telefono() == null ? null : r.telefono().trim())
                .rol(rol)
                .activo(true)
                .build());
        return ResponseEntity.status(HttpStatus.CREATED).body(dto(u));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> actualizar(@PathVariable Long id, @RequestBody UsuarioRequest r) {
        Usuario u = usuarioRepository.findById(id).orElse(null);
        if (u == null) return error(HttpStatus.NOT_FOUND, "Usuario no encontrado.");
        if (!ROLES_GESTIONABLES.contains(u.getRol()))
            return error(HttpStatus.FORBIDDEN, "No se pueden modificar cuentas de administrador desde aquí.");

        if (r.email() != null && !r.email().isBlank()) {
            String email = r.email().trim().toLowerCase();
            if (!EMAIL.matcher(email).matches()) return error(HttpStatus.BAD_REQUEST, "Correo electrónico inválido.");
            if (!email.equals(u.getUsername()) && usuarioRepository.findByUsername(email).isPresent())
                return error(HttpStatus.CONFLICT, "Ya existe una cuenta con ese correo.");
            u.setUsername(email);
        }
        if (r.nombreCompleto() != null && !r.nombreCompleto().isBlank()) u.setNombreCompleto(r.nombreCompleto().trim());
        if (r.telefono() != null) u.setTelefono(r.telefono().trim());
        if (r.rol() != null) {
            Rol rol = rolGestionable(r.rol());
            if (rol == null) return error(HttpStatus.FORBIDDEN, "Rol no permitido.");
            u.setRol(rol);
        }
        if (r.activo() != null) u.setActivo(r.activo());
        if (r.password() != null && !r.password().isEmpty()) {
            if (r.password().length() < MIN_PASSWORD)
                return error(HttpStatus.BAD_REQUEST, "La contraseña debe tener al menos " + MIN_PASSWORD + " caracteres.");
            u.setPassword(passwordEncoder.encode(r.password()));
        }
        return ResponseEntity.ok(dto(usuarioRepository.save(u)));
    }

    private Rol rolGestionable(String valor) {
        if (valor == null) return null;
        try {
            Rol rol = Rol.valueOf(valor.trim().toUpperCase());
            return ROLES_GESTIONABLES.contains(rol) ? rol : null;
        } catch (IllegalArgumentException e) {
            return null;
        }
    }

    private Map<String, Object> dto(Usuario u) {
        Map<String, Object> m = new LinkedHashMap<>(AuthController.perfil(u)); // nunca incluye la contraseña
        m.put("activo", u.isActivo());
        m.put("editable", ROLES_GESTIONABLES.contains(u.getRol()));
        return m;
    }

    private ResponseEntity<Map<String, String>> error(HttpStatus status, String mensaje) {
        return ResponseEntity.status(status).body(Map.of("mensaje", mensaje));
    }
}
