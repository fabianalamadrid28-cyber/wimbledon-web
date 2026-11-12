package com.wimbledon.backend.services;

import com.wimbledon.backend.dto.LimpiezaRegistroResponse;
import com.wimbledon.backend.dto.LimpiezaResumenResponse;
import com.wimbledon.backend.entities.Habitacion;
import com.wimbledon.backend.entities.RegistroLimpieza;
import com.wimbledon.backend.repositories.RegistroLimpiezaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Mide cuánto demora cada limpieza. Lo invoca HabitacionService cuando cambia el estado,
 * así el tiempo se registra sin importar desde qué panel se pulse el botón.
 */
@Service
@RequiredArgsConstructor
public class LimpiezaService {

    private final RegistroLimpiezaRepository repository;

    /** LIMPIEZA_PENDIENTE → EN_PROCESO: arranca el cronómetro. */
    @Transactional
    public void iniciar(Habitacion hab, String personal) {
        repository.deleteByHabitacionNumeroAndFinIsNull(hab.getNumero()); // sin registros abiertos duplicados
        LocalDateTime ahora = LocalDateTime.now();
        hab.setLimpiezaInicio(ahora);
        repository.save(RegistroLimpieza.builder()
                .habitacionNumero(hab.getNumero())
                .personal(personal)
                .inicio(ahora)
                .build());
    }

    /** EN_PROCESO → LISTA: cierra el registro y calcula la demora. */
    @Transactional
    public void finalizar(Habitacion hab, String personal, String observaciones) {
        LocalDateTime fin = LocalDateTime.now();
        RegistroLimpieza registro = repository
                .findFirstByHabitacionNumeroAndFinIsNullOrderByInicioDesc(hab.getNumero())
                .orElseGet(() -> RegistroLimpieza.builder()
                        .habitacionNumero(hab.getNumero())
                        .personal(personal)
                        .inicio(hab.getLimpiezaInicio() != null ? hab.getLimpiezaInicio() : fin)
                        .build());
        registro.setFin(fin);
        registro.setDuracionSegundos(Math.max(0, Duration.between(registro.getInicio(), fin).toSeconds()));
        if (registro.getPersonal() == null) registro.setPersonal(personal);
        if (observaciones != null && !observaciones.isBlank()) {
            String limpia = observaciones.trim();
            registro.setObservaciones(limpia.length() > 500 ? limpia.substring(0, 500) : limpia);
        }
        repository.save(registro);
        hab.setLimpiezaInicio(null);
    }

    /** EN_PROCESO → otro estado sin terminar (se devolvió a pendiente o pasó a mantenimiento): no cuenta como limpieza. */
    @Transactional
    public void cancelar(Habitacion hab) {
        repository.deleteByHabitacionNumeroAndFinIsNull(hab.getNumero());
        hab.setLimpiezaInicio(null);
    }

    @Transactional(readOnly = true)
    public LimpiezaResumenResponse resumen() {
        List<RegistroLimpieza> terminados = repository.findTop100ByFinIsNotNullOrderByFinDesc();
        Long promedio = terminados.isEmpty() ? null : Math.round(terminados.stream()
                .filter(r -> r.getDuracionSegundos() != null)
                .mapToLong(RegistroLimpieza::getDuracionSegundos)
                .average().orElse(0));
        return new LimpiezaResumenResponse(
                terminados.stream().map(LimpiezaRegistroResponse::from).toList(),
                promedio,
                terminados.size());
    }
}
