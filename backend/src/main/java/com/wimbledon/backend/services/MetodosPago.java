package com.wimbledon.backend.services;

import java.util.Set;
import java.util.regex.Pattern;

/**
 * Reglas del método de pago de una reserva. Única fuente de verdad (igual que ReglasReserva):
 * funciones puras, sin acceso a base de datos, fáciles de probar.
 *
 * Yape, Plin y las transferencias NO tienen API pública para un hotel pequeño, así que el flujo es:
 *   1. El huésped paga desde su app (QR / número del hotel) y escribe el N° de operación.
 *   2. La reserva queda PENDIENTE con ese N° de operación.
 *   3. Recepción verifica el pago en la app del negocio y pasa la reserva a CONFIRMADA.
 * Con EN_HOTEL no hay N° de operación: se paga al llegar (efectivo o POS) y la reserva solo se
 * sostiene el tiempo de espera normal de una PENDIENTE.
 */
public final class MetodosPago {

    public static final String YAPE = "YAPE";
    public static final String PLIN = "PLIN";
    public static final String TRANSFERENCIA = "TRANSFERENCIA";
    public static final String EN_HOTEL = "EN_HOTEL";

    /** Métodos que se pagan por adelantado y exigen N° de operación. */
    private static final Set<String> DIGITALES = Set.of(YAPE, PLIN, TRANSFERENCIA);
    private static final Set<String> VALIDOS = Set.of(YAPE, PLIN, TRANSFERENCIA, EN_HOTEL);

    /** Los comprobantes de Yape/Plin/bancos traen entre 6 y 12 dígitos; se deja un margen. */
    private static final Pattern NUMERO_OPERACION = Pattern.compile("^\\d{6,12}$");

    private MetodosPago() {
    }

    /** Devuelve el método en mayúsculas y sin espacios, o null si viene vacío. */
    public static String normalizarMetodo(String metodo) {
        if (metodo == null || metodo.isBlank()) return null;
        return metodo.trim().toUpperCase().replace(' ', '_');
    }

    /** Quita espacios al N° de operación, o devuelve null si viene vacío. */
    public static String normalizarOperacion(String numero) {
        if (numero == null || numero.isBlank()) return null;
        return numero.trim();
    }

    public static boolean exigeOperacion(String metodo) {
        return metodo != null && DIGITALES.contains(metodo);
    }

    /**
     * Valida el par (método, N° de operación). Devuelve el motivo del rechazo o null si es válido.
     * Si no viene método (reservas de recepción / datos antiguos) no se exige nada.
     */
    public static String motivoInvalido(String metodo, String numeroOperacion) {
        String m = normalizarMetodo(metodo);
        String op = normalizarOperacion(numeroOperacion);

        if (m == null) {
            return op == null ? null : "Indica el método de pago junto con el número de operación.";
        }
        if (!VALIDOS.contains(m)) {
            return "Método de pago no válido. Usa Yape, Plin, transferencia o pago en el hotel.";
        }
        if (exigeOperacion(m)) {
            if (op == null) {
                return "Ingresa el número de operación de tu pago con " + etiqueta(m) + ".";
            }
            if (!NUMERO_OPERACION.matcher(op).matches()) {
                return "El número de operación debe tener entre 6 y 12 dígitos (solo números).";
            }
        } else if (op != null) {
            return "El pago en el hotel no lleva número de operación.";
        }
        return null;
    }

    public static String etiqueta(String metodo) {
        return switch (metodo == null ? "" : metodo) {
            case YAPE -> "Yape";
            case PLIN -> "Plin";
            case TRANSFERENCIA -> "transferencia bancaria";
            case EN_HOTEL -> "pago en el hotel";
            default -> "el método elegido";
        };
    }
}
