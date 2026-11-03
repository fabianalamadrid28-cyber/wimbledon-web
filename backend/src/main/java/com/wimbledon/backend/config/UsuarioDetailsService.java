package com.wimbledon.backend.config;

import com.wimbledon.backend.entities.Usuario;
import com.wimbledon.backend.repositories.UsuarioRepository;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

/** Carga el usuario (correo, hash BCrypt y rol) desde la base de datos. */
@Service
public class UsuarioDetailsService implements UserDetailsService {

    private final UsuarioRepository usuarioRepository;

    public UsuarioDetailsService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String correo) throws UsernameNotFoundException {
        String c = correo == null ? "" : correo.trim();
        Usuario u = usuarioRepository.findByUsername(c)
                .or(() -> usuarioRepository.findByUsername(c.toLowerCase()))
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado"));
        return User.withUsername(u.getUsername())
                .password(u.getPassword())
                .roles(u.getRol().name())
                .disabled(!u.isActivo())
                .build();
    }
}
