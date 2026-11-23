package com.wimbledon.backend.services;

import com.wimbledon.backend.dto.BonoClienteResponse;
import com.wimbledon.backend.dto.ValidarBonoRequest;
import com.wimbledon.backend.dto.ValidarBonoResponse;
import com.wimbledon.backend.entities.Bono;
import com.wimbledon.backend.entities.Reserva;
import com.wimbledon.backend.repositories.ReservaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.*;

@Service
@RequiredArgsConstructor
public class BonoService {

    private final ReservaRepository reservaRepository;

    private static final List<Bono> CATALOGO_BONOS = List.of(
            Bono.builder()
                    .codigo("BIENVENIDA25")
                    .titulo("Bono Bienvenida VIP")
                    .descripcion("Descuento de S/ 25.00 en cualquier suite de Hotel Wimbledon.")
                    .montoDescuento(new BigDecimal("25.00"))
                    .nivelRequerido("TODOS")
                    .puntosRequeridos(0)
                    .vigencia("Permanente")
                    .activo(true)
                    .build(),
            Bono.builder()
                    .codigo("FRECUENTE35")
                    .titulo("Bono Cliente Frecuente")
                    .descripcion("Descuento especial de S/ 35.00 para huéspedes recurrentes.")
                    .montoDescuento(new BigDecimal("35.00"))
                    .nivelRequerido("PLATA")
                    .puntosRequeridos(200)
                    .vigencia("Permanente")
                    .activo(true)
                    .build(),
            Bono.builder()
                    .codigo("ROMANTICO40")
                    .titulo("Bono Pareja Romántica")
                    .descripcion("Descuento de S/ 40.00 en paquetes románticos y suites temáticas.")
                    .montoDescuento(new BigDecimal("40.00"))
                    .nivelRequerido("PLATA")
                    .puntosRequeridos(250)
                    .vigencia("Permanente")
                    .activo(true)
                    .build(),
            Bono.builder()
                    .codigo("VIP50")
                    .titulo("Bono Black Jacuzzi VIP")
                    .descripcion("Descuento exclusivo de S/ 50.00 en estancias pernocte con Jacuzzi.")
                    .montoDescuento(new BigDecimal("50.00"))
                    .nivelRequerido("ORO")
                    .puntosRequeridos(450)
                    .vigencia("Permanente")
                    .activo(true)
                    .build(),
            Bono.builder()
                    .codigo("DESAYUNO30")
                    .titulo("Bono Desayuno a la Suite")
                    .descripcion("Descuento de S/ 30.00 aplicable a desayunos y carta de autor.")
                    .montoDescuento(new BigDecimal("30.00"))
                    .nivelRequerido("TODOS")
                    .puntosRequeridos(100)
                    .vigencia("Permanente")
                    .activo(true)
                    .build()
    );

    public List<Bono> obtenerCatalogo() {
        return CATALOGO_BONOS;
    }

    public BonoClienteResponse consultarPorDocumento(String documento) {
        String docLimpio = (documento == null) ? "" : documento.trim();
        if (docLimpio.isBlank()) {
            return BonoClienteResponse.builder()
                    .documento("")
                    .nombreCliente("Visitante Wimbledon")
                    .nivel("BRONCE")
                    .estanciasAcumuladas(0)
                    .puntosFidelidad(100)
                    .beneficioNivel("Membresía inicial: S/ 25 de descuento de bienvenida en tu primera reserva.")
                    .bonosDisponibles(List.of(CATALOGO_BONOS.get(0), CATALOGO_BONOS.get(4)))
                    .mensaje("Ingresa tu DNI para consultar tus puntos acumulados o utiliza el bono de bienvenida.")
                    .build();
        }

        // Buscar reservas asociadas a este documento
        List<Reserva> reservas = reservaRepository.findAll().stream()
                .filter(r -> docLimpio.equalsIgnoreCase(r.getDocumentoHuesped()))
                .toList();

        int estancias = reservas.size();
        String nombre = reservas.isEmpty() ? "Huésped Distinguido" : reservas.get(reservas.size() - 1).getNombreHuesped();

        String nivel;
        int puntos;
        String beneficio;
        List<Bono> disponibles = new ArrayList<>();

        if (estancias >= 6) {
            nivel = "BLACK_VIP";
            puntos = (estancias * 120) + 300;
            beneficio = "Nivel Black VIP: Máxima prioridad en asignación de suites, late check-out sin costo y 15% en carta.";
            disponibles.addAll(CATALOGO_BONOS);
        } else if (estancias >= 3) {
            nivel = "ORO";
            puntos = (estancias * 100) + 150;
            beneficio = "Nivel Oro: Descuento en todas las suites temáticas y pernoctes con Jacuzzi.";
            disponibles.addAll(CATALOGO_BONOS);
        } else if (estancias >= 1) {
            nivel = "PLATA";
            puntos = (estancias * 100);
            beneficio = "Nivel Plata: Acceso a bonos de fidelidad de S/ 35 y S/ 40 en próximas visitas.";
            disponibles.add(CATALOGO_BONOS.get(0));
            disponibles.add(CATALOGO_BONOS.get(1));
            disponibles.add(CATALOGO_BONOS.get(2));
            disponibles.add(CATALOGO_BONOS.get(4));
        } else {
            nivel = "BRONCE";
            puntos = 100;
            beneficio = "Nivel Bronce: Bono de bienvenida disponible de S/ 25 para tu próxima estancia.";
            disponibles.add(CATALOGO_BONOS.get(0));
            disponibles.add(CATALOGO_BONOS.get(4));
        }

        return BonoClienteResponse.builder()
                .documento(docLimpio)
                .nombreCliente(nombre)
                .nivel(nivel)
                .estanciasAcumuladas(estancias)
                .puntosFidelidad(puntos)
                .beneficioNivel(beneficio)
                .bonosDisponibles(disponibles)
                .mensaje(estancias > 0 
                        ? "¡Gracias por tu fidelidad en Wimbledon! Tienes " + disponibles.size() + " bonos activos."
                        : "¡Bienvenido al Club Wimbledon! Tienes bonos de bienvenida para tu primera estancia.")
                .build();
    }

    public ValidarBonoResponse validarBono(ValidarBonoRequest request) {
        if (request == null || request.getCodigo() == null || request.getCodigo().isBlank()) {
            return ValidarBonoResponse.builder()
                    .valido(false)
                    .mensaje("Debes ingresar un código de bono.")
                    .montoDescuento(BigDecimal.ZERO)
                    .nuevoTotal(request != null && request.getMontoTotal() != null ? request.getMontoTotal() : BigDecimal.ZERO)
                    .build();
        }

        String codigoBuscado = request.getCodigo().trim().toUpperCase();
        Optional<Bono> bonoOpt = CATALOGO_BONOS.stream()
                .filter(b -> b.getCodigo().equalsIgnoreCase(codigoBuscado) && b.isActivo())
                .findFirst();

        if (bonoOpt.isEmpty()) {
            return ValidarBonoResponse.builder()
                    .valido(false)
                    .mensaje("El código de bono '" + codigoBuscado + "' no es válido o ha expirado.")
                    .montoDescuento(BigDecimal.ZERO)
                    .nuevoTotal(request.getMontoTotal() != null ? request.getMontoTotal() : BigDecimal.ZERO)
                    .build();
        }

        Bono bono = bonoOpt.get();
        BigDecimal total = request.getMontoTotal() != null ? request.getMontoTotal() : BigDecimal.ZERO;
        BigDecimal descuento = bono.getMontoDescuento();

        BigDecimal nuevoTotal = total.subtract(descuento);
        if (nuevoTotal.compareTo(BigDecimal.ZERO) < 0) {
            nuevoTotal = BigDecimal.ZERO;
        }

        return ValidarBonoResponse.builder()
                .valido(true)
                .mensaje("¡Bono aplicado con éxito! Descuento de S/ " + descuento + " otorgado.")
                .montoDescuento(descuento)
                .nuevoTotal(nuevoTotal)
                .bono(bono)
                .build();
    }
}
