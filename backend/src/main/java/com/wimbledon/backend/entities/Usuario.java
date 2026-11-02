package com.wimbledon.backend.entities;

import com.wimbledon.backend.enums.Rol;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "usuarios")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String username; // Puede ser el correo o DNI para iniciar sesión

    @Column(nullable = false)
    private String password; // Contraseña cifrada

    @Column(nullable = false)
    private String nombreCompleto;

    private String telefono;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Rol rol; // SUPER_ADMIN, ADMINISTRADOR, RECEPCIONISTA, LIMPIEZA, CLIENTE

    @Builder.Default
    private boolean activo = true;
}
