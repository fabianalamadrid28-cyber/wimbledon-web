package com.wimbledon.backend.services;

import com.wimbledon.backend.entities.Habitacion;
import com.wimbledon.backend.entities.RegistroLimpieza;
import com.wimbledon.backend.enums.EstadoHabitacion;
import com.wimbledon.backend.repositories.RegistroLimpiezaRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class LimpiezaServiceTest {

    private RegistroLimpiezaRepository repository;
    private LimpiezaService service;
    private Habitacion hab;

    @BeforeEach
    void setUp() {
        repository = mock(RegistroLimpiezaRepository.class);
        service = new LimpiezaService(repository);
        hab = Habitacion.builder().numero("203").estado(EstadoHabitacion.LIMPIEZA_PENDIENTE).build();
    }

    @Test
    void iniciarArrancaElCronometroYAbreUnRegistro() {
        service.iniciar(hab, "rosa@hotel.com");

        assertNotNull(hab.getLimpiezaInicio());
        verify(repository).deleteByHabitacionNumeroAndFinIsNull("203");
        verify(repository).save(argThat(r -> r.getFin() == null && "203".equals(r.getHabitacionNumero())
                && "rosa@hotel.com".equals(r.getPersonal())));
    }

    @Test
    void finalizarCierraElRegistroYCalculaLaDemora() {
        RegistroLimpieza abierto = RegistroLimpieza.builder()
                .habitacionNumero("203").inicio(LocalDateTime.now().minusMinutes(12)).build();
        when(repository.findFirstByHabitacionNumeroAndFinIsNullOrderByInicioDesc("203")).thenReturn(Optional.of(abierto));
        hab.setLimpiezaInicio(abierto.getInicio());

        service.finalizar(hab, "rosa@hotel.com", "Se encontró un cargador");

        assertNotNull(abierto.getFin());
        assertTrue(abierto.getDuracionSegundos() >= 12 * 60 && abierto.getDuracionSegundos() < 13 * 60);
        assertEquals("Se encontró un cargador", abierto.getObservaciones());
        assertNull(hab.getLimpiezaInicio());
        verify(repository).save(abierto);
    }

    @Test
    void cancelarDescartaElRegistroAbierto() {
        hab.setLimpiezaInicio(LocalDateTime.now());

        service.cancelar(hab);

        assertNull(hab.getLimpiezaInicio());
        verify(repository).deleteByHabitacionNumeroAndFinIsNull("203");
        verify(repository, never()).save(any());
    }
}
