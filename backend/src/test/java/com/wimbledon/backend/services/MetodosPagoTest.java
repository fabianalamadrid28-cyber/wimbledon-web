package com.wimbledon.backend.services;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class MetodosPagoTest {

    @Test
    void sin_metodo_y_sin_operacion_es_valido_para_reservas_de_recepcion() {
        assertNull(MetodosPago.motivoInvalido(null, null));
        assertNull(MetodosPago.motivoInvalido("  ", ""));
    }

    @Test
    void operacion_sin_metodo_se_rechaza() {
        assertNotNull(MetodosPago.motivoInvalido(null, "12345678"));
    }

    @Test
    void yape_plin_y_transferencia_exigen_operacion_de_6_a_12_digitos() {
        for (String metodo : new String[]{"YAPE", "PLIN", "TRANSFERENCIA"}) {
            assertNull(MetodosPago.motivoInvalido(metodo, "123456"));
            assertNull(MetodosPago.motivoInvalido(metodo, "123456789012"));
            assertNotNull(MetodosPago.motivoInvalido(metodo, null), metodo + " sin operación");
            assertNotNull(MetodosPago.motivoInvalido(metodo, "12345"), metodo + " muy corto");
            assertNotNull(MetodosPago.motivoInvalido(metodo, "1234567890123"), metodo + " muy largo");
            assertNotNull(MetodosPago.motivoInvalido(metodo, "12AB5678"), metodo + " con letras");
        }
    }

    @Test
    void pago_en_hotel_no_lleva_operacion() {
        assertNull(MetodosPago.motivoInvalido("EN_HOTEL", null));
        assertNotNull(MetodosPago.motivoInvalido("EN_HOTEL", "12345678"));
    }

    @Test
    void metodo_desconocido_se_rechaza() {
        assertNotNull(MetodosPago.motivoInvalido("BITCOIN", "12345678"));
    }

    @Test
    void normaliza_mayusculas_y_espacios() {
        assertEquals("YAPE", MetodosPago.normalizarMetodo(" yape "));
        assertEquals("EN_HOTEL", MetodosPago.normalizarMetodo("en hotel"));
        assertNull(MetodosPago.normalizarMetodo(null));
        assertEquals("12345678", MetodosPago.normalizarOperacion(" 12345678 "));
        assertNull(MetodosPago.normalizarOperacion("  "));
        assertNull(MetodosPago.motivoInvalido("yape", " 12345678 "));
    }
}
