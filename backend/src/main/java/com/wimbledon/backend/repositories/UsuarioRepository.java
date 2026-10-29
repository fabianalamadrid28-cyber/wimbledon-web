package com.wimbledon.backend.repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.wimbledon.backend.entities.Usuario;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    // Busca un usuario por su nombre de usuario (Esencial para el login)
    Optional<Usuario> findByUsername(String username);
}
