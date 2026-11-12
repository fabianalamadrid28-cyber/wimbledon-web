package com.wimbledon.backend.repositories;

import com.wimbledon.backend.entities.ReporteSoporte;
import com.wimbledon.backend.enums.EstadoSoporte;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReporteSoporteRepository extends JpaRepository<ReporteSoporte, Long> {
    List<ReporteSoporte> findAllByOrderByCreadoEnDesc();
    List<ReporteSoporte> findByEstadoOrderByCreadoEnDesc(EstadoSoporte estado);

    /** Incidencias de clientes que administración aún no revisa. */
    List<ReporteSoporte> findByEscaladoAdminTrueAndRevisadoAdminFalseOrderByCreadoEnDesc();
}
