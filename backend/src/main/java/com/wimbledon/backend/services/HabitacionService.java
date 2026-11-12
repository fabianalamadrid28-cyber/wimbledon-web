package com.wimbledon.backend.services;

import com.wimbledon.backend.entities.Habitacion;
import com.wimbledon.backend.enums.EstadoHabitacion;
import com.wimbledon.backend.repositories.HabitacionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class HabitacionService {

    private final HabitacionRepository habitacionRepository;
    private final LimpiezaService limpiezaService;

    public HabitacionService(HabitacionRepository habitacionRepository, LimpiezaService limpiezaService) {
        this.habitacionRepository = habitacionRepository;
        this.limpiezaService = limpiezaService;
    }

    public List<Habitacion> listarTodas() {
        return habitacionRepository.findAll();
    }

    public List<Habitacion> listarPorEstado(EstadoHabitacion estado) {
        return habitacionRepository.findByEstado(estado);
    }

    public Optional<Habitacion> obtenerPorId(Long id) {
        return habitacionRepository.findById(id);
    }

    @Transactional
    public Habitacion guardar(Habitacion habitacion) {
        return habitacionRepository.save(habitacion);
    }

    @Transactional
    public Habitacion actualizar(Long id, Habitacion datosActualizados) {
        Habitacion hab = habitacionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Habitación no encontrada con ID: " + id));

        if (datosActualizados.getNumero() != null) hab.setNumero(datosActualizados.getNumero());
        if (datosActualizados.getTipo() != null) hab.setTipo(datosActualizados.getTipo());
        if (datosActualizados.getNombreTema() != null) hab.setNombreTema(datosActualizados.getNombreTema());
        if (datosActualizados.getDescripcion() != null) hab.setDescripcion(datosActualizados.getDescripcion());
        if (datosActualizados.getPrecioBloque() != null) hab.setPrecioBloque(datosActualizados.getPrecioBloque());
        if (datosActualizados.getCapacidad() != null) hab.setCapacidad(datosActualizados.getCapacidad());
        if (datosActualizados.getPiso() != null) hab.setPiso(datosActualizados.getPiso());
        if (datosActualizados.getEstado() != null) {
            aplicarEstado(hab, datosActualizados.getEstado(), null, null);
        }
        if (datosActualizados.getUrlImagen() != null) hab.setUrlImagen(datosActualizados.getUrlImagen());

        hab.setTieneJacuzzi(datosActualizados.isTieneJacuzzi());
        hab.setTieneSauna(datosActualizados.isTieneSauna());
        hab.setTienePoleDance(datosActualizados.isTienePoleDance());
        hab.setTieneSillonTantrico(datosActualizados.isTieneSillonTantrico());
        hab.setTieneCocheraDirecta(datosActualizados.isTieneCocheraDirecta());

        return habitacionRepository.save(hab);
    }

    @Transactional
    public Habitacion cambiarEstado(Long id, EstadoHabitacion nuevoEstado) {
        return cambiarEstado(id, nuevoEstado, null, null);
    }

    /**
     * Cambia el estado validando la transición. Si el cambio abre o cierra una limpieza
     * (EN_PROCESO / LISTA) se registra el tiempo y quién la hizo.
     */
    @Transactional
    public Habitacion cambiarEstado(Long id, EstadoHabitacion nuevoEstado, String personal, String observaciones) {
        Habitacion hab = habitacionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Habitación no encontrada con ID: " + id));
        aplicarEstado(hab, nuevoEstado, personal, observaciones);
        return habitacionRepository.save(hab);
    }

    private void aplicarEstado(Habitacion hab, EstadoHabitacion nuevo, String personal, String observaciones) {
        EstadoHabitacion actual = hab.getEstado();
        TransicionEstados.validar(actual, nuevo);
        if (actual == nuevo) return; // doble clic o dos paneles a la vez: no reinicia el cronómetro

        if (nuevo == EstadoHabitacion.EN_PROCESO) {
            limpiezaService.iniciar(hab, personal);
        } else if (actual == EstadoHabitacion.EN_PROCESO && nuevo == EstadoHabitacion.LISTA) {
            limpiezaService.finalizar(hab, personal, observaciones);
        } else if (actual == EstadoHabitacion.EN_PROCESO) {
            limpiezaService.cancelar(hab);
        }
        hab.setEstado(nuevo);
    }

    @Transactional
    public void eliminar(Long id) {
        habitacionRepository.deleteById(id);
    }
}

