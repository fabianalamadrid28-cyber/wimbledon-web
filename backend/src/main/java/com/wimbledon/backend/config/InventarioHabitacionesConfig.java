package com.wimbledon.backend.config;

import com.wimbledon.backend.entities.Habitacion;
import com.wimbledon.backend.enums.EstadoHabitacion;
import com.wimbledon.backend.repositories.HabitacionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.event.EventListener;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

/**
 * Completa el inventario del hotel hasta las 150 habitaciones (50 por piso).
 *
 * Solo inserta los números que faltan; nunca modifica ni elimina las habitaciones existentes
 * (por eso es seguro ejecutarlo en bases de datos ya creadas y en cualquier rama).
 * Se ejecuta al final del arranque, después de DataInitializer.
 */
@Configuration
public class InventarioHabitacionesConfig {

    private static final Logger log = LoggerFactory.getLogger(InventarioHabitacionesConfig.class);

    /** Un tipo de habitación y sus datos comerciales. */
    private record Modelo(
            String tipo,
            String nombreTema,
            String descripcion,
            String precioBloque,
            int capacidad,
            String urlImagen,
            boolean jacuzzi,
            boolean sauna,
            boolean poleDance,
            boolean sillonTantrico,
            boolean cocheraDirecta) {
    }

    /** Rango de números de habitación que comparten un modelo. */
    private record Grupo(int desde, int hasta, int piso, Modelo modelo) {
    }

    // Mismo catálogo que fronted/src/services/api.js (buildInitialRooms): 15 grupos x 10 = 150.
    private static final List<Grupo> CATALOGO = List.of(
            // --- PISO 1: Cochera Directa y Suites Express (101 - 150) ---
            new Grupo(101, 110, 1, new Modelo("Simple", "Simple con Jacuzzi",
                    "Habitación con jacuzzi relajante, cama queen y acceso vehicular discreto.",
                    "89.00", 2, "/suite-cochera.jpg", true, false, false, false, true)),
            new Grupo(111, 120, 1, new Modelo("Suite", "Venetian Flowers",
                    "Suite temática floral ejecutiva con jacuzzi y cochera privada.",
                    "100.00", 2, "/suite-tematica.jpg", true, false, false, false, true)),
            new Grupo(121, 130, 1, new Modelo("Simple", "Habitación Delux",
                    "Habitación contemporánea con cama queen y ducha española.",
                    "55.00", 2, "/suite-simple.jpg", false, false, false, false, false)),
            new Grupo(131, 140, 1, new Modelo("Suite", "Pacific Dreams",
                    "Suite de lujo con jacuzzi y cochera directa privada.",
                    "125.00", 2, "/suite-vip.jpg", true, false, true, false, true)),
            new Grupo(141, 150, 1, new Modelo("Suite", "Riverside Dreams",
                    "Suite romántica con jacuzzi doble, cochera y pole dance.",
                    "125.00", 2, "/suite-vip.jpg", true, false, true, false, true)),

            // --- PISO 2: Suites Sensuales & Jacuzzi (201 - 250) ---
            new Grupo(201, 210, 2, new Modelo("Suite", "Riverside Dreams",
                    "Suite romántica con jacuzzi doble y barra de pole dance.",
                    "125.00", 2, "/suite-vip.jpg", true, false, true, false, false)),
            new Grupo(211, 220, 2, new Modelo("Suite", "Dark Fantasies",
                    "Suite sensual equipada con jacuzzi, sillón tántrico y pole dance.",
                    "208.00", 2, "/suite-vip.jpg", true, false, true, true, false)),
            new Grupo(221, 230, 2, new Modelo("Doble", "Jacuzzi Deluxe",
                    "Habitación doble contemporánea con tina de hidromasaje.",
                    "104.00", 2, "/suite-jacuzzi.jpg", true, false, false, false, false)),
            new Grupo(231, 240, 2, new Modelo("Suite", "Tropical Dreams",
                    "Suite con ambientación tropical y jacuzzi doble.",
                    "125.00", 2, "/suite-tematica.jpg", true, false, false, false, false)),
            new Grupo(241, 250, 2, new Modelo("Simple", "Simple Vista al Mar",
                    "Habitación confortable con vista exterior y cama queen.",
                    "73.00", 2, "/suite-simple.jpg", false, false, false, false, false)),

            // --- PISO 3: Nivel Presidencial & Vista al Mar (301 - 350) ---
            new Grupo(301, 310, 3, new Modelo("Simple", "Simple Vista al Mar",
                    "Habitación con vista panorámica exterior al mar y cama king.",
                    "73.00", 2, "/suite-simple.jpg", false, false, false, false, false)),
            new Grupo(311, 320, 3, new Modelo("Doble", "Hawaian Dreams",
                    "Habitación acogedora con estilo isleño y vista panorámica.",
                    "73.00", 2, "/suite-tematica.jpg", false, false, false, false, false)),
            new Grupo(321, 330, 3, new Modelo("Suite", "Habitación Especial",
                    "Suite amplia de hasta 3 personas con sala de estar y jacuzzi.",
                    "150.00", 3, "/suite-jacuzzi.jpg", true, false, false, false, false)),
            new Grupo(331, 340, 3, new Modelo("Presidencial", "Pacific Dreams Presidencial",
                    "Suite presidencial de máximo lujo: vista al mar, jacuzzi y pole dance.",
                    "177.00", 4, "/suite-vip.jpg", true, false, true, true, false)),
            new Grupo(341, 350, 3, new Modelo("Presidencial", "Suite Presidencial con Cámara Seca",
                    "Master suite con sauna finlandés privado y tina circular de hidromasaje.",
                    "200.00", 4, "/suite-sauna.jpg", true, true, false, true, false))
    );

    private final HabitacionRepository habitacionRepository;

    public InventarioHabitacionesConfig(HabitacionRepository habitacionRepository) {
        this.habitacionRepository = habitacionRepository;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void completarInventario() {
        Set<String> existentes = new LinkedHashSet<>();
        habitacionRepository.findAll().forEach(h -> {
            if (h.getNumero() != null) {
                existentes.add(h.getNumero().trim());
            }
        });

        List<Habitacion> faltantes = new ArrayList<>();
        for (Grupo grupo : CATALOGO) {
            for (int numero = grupo.desde(); numero <= grupo.hasta(); numero++) {
                String numeroTexto = String.valueOf(numero);
                if (existentes.contains(numeroTexto)) {
                    continue;
                }
                Modelo modelo = grupo.modelo();
                faltantes.add(Habitacion.builder()
                        .numero(numeroTexto)
                        .tipo(modelo.tipo())
                        .nombreTema(modelo.nombreTema())
                        .descripcion(modelo.descripcion())
                        .precioBloque(new BigDecimal(modelo.precioBloque()))
                        .capacidad(modelo.capacidad())
                        .piso(grupo.piso())
                        .estado(EstadoHabitacion.DISPONIBLE)
                        .tieneJacuzzi(modelo.jacuzzi())
                        .tieneSauna(modelo.sauna())
                        .tienePoleDance(modelo.poleDance())
                        .tieneSillonTantrico(modelo.sillonTantrico())
                        .tieneCocheraDirecta(modelo.cocheraDirecta())
                        .urlImagen(modelo.urlImagen())
                        .build());
            }
        }

        if (!faltantes.isEmpty()) {
            habitacionRepository.saveAll(faltantes);
            log.info("Inventario completado: se agregaron {} habitaciones. Total: {}.",
                    faltantes.size(), habitacionRepository.count());
        } else {
            log.info("Inventario completo: no faltan habitaciones ({} en total).", habitacionRepository.count());
        }
    }
}
