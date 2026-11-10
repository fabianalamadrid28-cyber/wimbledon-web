package com.wimbledon.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

/**
 * Autenticación por sesión (cookie JSESSIONID) con usuarios de la tabla "usuarios" y BCrypt.
 * Los roles de la BD (ADMINISTRADOR, RECEPCIONISTA, LIMPIEZA) se validan aquí, en el backend.
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private static final String ADMIN = "ADMINISTRADOR";
    private static final String SUPER = "SUPER_ADMIN";
    private static final String RECEPCION = "RECEPCIONISTA";
    private static final String LIMPIEZA = "LIMPIEZA";

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            // La sesión usa cookie SameSite=Lax (ver application.properties), que bloquea el envío
            // de la cookie en peticiones POST/PUT/DELETE originadas desde otros sitios.
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                // Autenticación
                .requestMatchers("/api/v1/auth/login", "/api/v1/auth/logout").permitAll()
                .requestMatchers("/api/v1/auth/me").authenticated()

                // Parte pública de la web: ver habitaciones, reservar en línea y reportar soporte
                // (el reporte público exige documento de un huésped con reserva vigente: lo valida SoporteService)
                .requestMatchers(HttpMethod.GET, "/api/v1/habitaciones", "/api/v1/habitaciones/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/v1/reservas").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/v1/soporte").permitAll()
                .requestMatchers("/api/v1/soporte", "/api/v1/soporte/**").hasAnyRole(ADMIN, SUPER, RECEPCION, LIMPIEZA)

                // Gestión de cuentas: solo ADMIN
                .requestMatchers("/api/v1/usuarios", "/api/v1/usuarios/**").hasAnyRole(ADMIN, SUPER)

                // Habitaciones: el estado lo cambian los 3 roles; crear/editar/eliminar solo ADMIN
                .requestMatchers(HttpMethod.PATCH, "/api/v1/habitaciones/*/estado").hasAnyRole(ADMIN, SUPER, RECEPCION, LIMPIEZA)
                .requestMatchers("/api/v1/habitaciones/**").hasAnyRole(ADMIN, SUPER)

                // Reservas, huéspedes y estadísticas: ADMIN y RECEPCIONISTA
                .requestMatchers("/api/v1/reservas", "/api/v1/reservas/**").hasAnyRole(ADMIN, SUPER, RECEPCION)
                .requestMatchers("/api/v1/dashboard/**").hasAnyRole(ADMIN, SUPER, RECEPCION)

                .anyRequest().authenticated()
            )
            .exceptionHandling(ex -> ex.authenticationEntryPoint(new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED)))
            .logout(logout -> logout
                .logoutUrl("/api/v1/auth/logout")
                .invalidateHttpSession(true)
                .deleteCookies("JSESSIONID")
                .logoutSuccessHandler((req, res, auth) -> res.setStatus(HttpStatus.OK.value())));

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(List.of("http://localhost:*", "http://127.0.0.1:*"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
