package com.wimbledon.backend.repositories;

import com.wimbledon.backend.entities.RegistroLimpieza;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RegistroLimpiezaRepository extends JpaRepository<RegistroLimpieza, Long> {

    /** Limpiezas ya terminadas, la más reciente primero. */
    List<RegistroLimpieza> findTop100ByFinIsNotNullOrderByFinDesc();

    Optional<RegistroLimpieza> findFirstByHabitacionNumeroAndFinIsNullOrderByInicioDesc(String habitacionNumero);

    long deleteByHabitacionNumeroAndFinIsNull(String habitacionNumero);
}
