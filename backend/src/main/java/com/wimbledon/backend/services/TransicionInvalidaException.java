package com.wimbledon.backend.services;

/** Cambio de estado que el ciclo de vida no permite (el controlador lo responde con 409). */
public class TransicionInvalidaException extends RuntimeException {
    public TransicionInvalidaException(String mensaje) {
        super(mensaje);
    }
}
