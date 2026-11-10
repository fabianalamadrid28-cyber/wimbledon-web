package com.wimbledon.backend.services;

import com.wimbledon.backend.entities.Usuario;
import com.wimbledon.backend.enums.Rol;
import com.wimbledon.backend.repositories.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Gestiona los usuarios con rol CLIENTE creados desde las reservas.
 * Si ya existe una cuenta con el mismo documento, se actualiza; si no, se crea.
 */
@Service
@RequiredArgsConstructor
public class ClienteService {

    private static final String CLAVE_POR_DEFECTO = "cliente123";

    private final UsuarioRepository usuarioRepository;

    @Transactional
    public Usuario registrarOActualizar(String documento, String nombreCompleto, String telefono) {
        String documentoLimpio = documento == null ? "" : documento.trim();
        if (documentoLimpio.isBlank() || nombreCompleto == null || nombreCompleto.isBlank()) {
            throw new IllegalArgumentException("Documento y nombre son obligatorios para registrar el cliente.");
        }
        return usuarioRepository.findByUsername(documentoLimpio)
                .map(u -> actualizar(u, nombreCompleto, telefono))
                .orElseGet(() -> crear(documentoLimpio, nombreCompleto, telefono));
    }

    private Usuario actualizar(Usuario usuario, String nombreCompleto, String telefono) {
        // Se conservan las credenciales y el rol del usuario existente.
        usuario.setNombreCompleto(nombreCompleto.trim());
        usuario.setTelefono(limpiarTelefono(telefono));
        if (!usuario.isActivo()) {
            usuario.setActivo(true);
        }
        return usuarioRepository.save(usuario);
    }

    private Usuario crear(String documento, String nombreCompleto, String telefono) {
        Usuario nuevo = Usuario.builder()
                .username(documento)
                .password(CLAVE_POR_DEFECTO)
                .nombreCompleto(nombreCompleto.trim())
                .telefono(limpiarTelefono(telefono))
                .rol(Rol.CLIENTE)
                .activo(true)
                .build();
        return usuarioRepository.save(nuevo);
    }

    private String limpiarTelefono(String telefono) {
        return telefono == null ? null : telefono.trim();
    }
}
