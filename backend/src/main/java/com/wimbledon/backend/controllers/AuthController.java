package com.wimbledon.backend.controllers;

import com.wimbledon.backend.entities.Usuario;
import com.wimbledon.backend.enums.Rol;
import com.wimbledon.backend.repositories.UsuarioRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.context.SecurityContextHolderStrategy;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    public record LoginRequest(String email, String password) {}

    // Roles con acceso a los paneles internos (CLIENTE no tiene panel)
    private static final Set<Rol> ROLES_PANEL =
            Set.of(Rol.SUPER_ADMIN, Rol.ADMINISTRADOR, Rol.RECEPCIONISTA, Rol.LIMPIEZA);

    private final AuthenticationManager authenticationManager;
    private final UsuarioRepository usuarioRepository;
    private final SecurityContextRepository contextRepository = new HttpSessionSecurityContextRepository();
    private final SecurityContextHolderStrategy contextHolder = SecurityContextHolder.getContextHolderStrategy();

    public AuthController(AuthenticationManager authenticationManager, UsuarioRepository usuarioRepository) {
        this.authenticationManager = authenticationManager;
        this.usuarioRepository = usuarioRepository;
    }

    /** El rol NO viene del cliente: se lee de la BD tras validar correo y contraseña. */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest body, HttpServletRequest req, HttpServletResponse res) {
        if (body == null || body.email() == null || body.email().isBlank()
                || body.password() == null || body.password().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("mensaje", "Ingresa tu correo y contraseña."));
        }
        try {
            Authentication auth = authenticationManager.authenticate(
                    UsernamePasswordAuthenticationToken.unauthenticated(body.email().trim(), body.password()));
            Usuario u = usuarioRepository.findByUsername(auth.getName()).orElseThrow();
            if (!ROLES_PANEL.contains(u.getRol())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("mensaje", "Tu cuenta no tiene acceso al panel de empleados."));
            }
            if (req.getSession(false) != null) {
                req.changeSessionId(); // evita fijación de sesión
            }
            SecurityContext context = contextHolder.createEmptyContext();
            context.setAuthentication(auth);
            contextHolder.setContext(context);
            contextRepository.saveContext(context, req, res);
            return ResponseEntity.ok(perfil(u));
        } catch (AuthenticationException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("mensaje", "Correo o contraseña incorrectos, o cuenta inactiva."));
        }
    }

    /** Devuelve el usuario de la sesión actual (para restaurar la sesión al recargar). */
    @GetMapping("/me")
    public ResponseEntity<?> me(Authentication authentication) {
        return usuarioRepository.findByUsername(authentication.getName())
                .filter(u -> u.isActivo() && ROLES_PANEL.contains(u.getRol()))
                .<ResponseEntity<?>>map(u -> ResponseEntity.ok(perfil(u)))
                .orElseGet(() -> ResponseEntity.status(HttpStatus.UNAUTHORIZED).build());
    }

    static Map<String, Object> perfil(Usuario u) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", u.getId());
        m.put("email", u.getUsername());
        m.put("nombre", u.getNombreCompleto());
        m.put("telefono", u.getTelefono());
        m.put("rol", u.getRol().name());
        return m;
    }
}
