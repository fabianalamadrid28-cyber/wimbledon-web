package com.wimbledon.backend.repositories;

import com.wimbledon.backend.entities.Habitacion;
import com.wimbledon.backend.enums.EstadoHabitacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface HabitacionRepository extends JpaRepository<Habitacion, Long> {
    // Busca habitaciones filtradas por su estado actual (Disponible, Ocupada, Mantenimiento, etc.)
    List<Habitacion> findByEstado(EstadoHabitacion estado);
}