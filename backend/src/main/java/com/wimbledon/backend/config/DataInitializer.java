package com.wimbledon.backend.config;

import com.wimbledon.backend.entities.Habitacion;
import com.wimbledon.backend.entities.Reserva;
import com.wimbledon.backend.entities.Usuario;
import com.wimbledon.backend.enums.EstadoHabitacion;
import com.wimbledon.backend.enums.EstadoReserva;
import com.wimbledon.backend.enums.Rol;
import com.wimbledon.backend.repositories.HabitacionRepository;
import com.wimbledon.backend.repositories.ReservaRepository;
import com.wimbledon.backend.repositories.UsuarioRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

@Configuration
public class DataInitializer {

    @Bean
    public CommandLineRunner initData(
            HabitacionRepository habitacionRepository,
            ReservaRepository reservaRepository,
            UsuarioRepository usuarioRepository) {
        return args -> {
            // Inicializar usuarios base
            if (usuarioRepository.count() == 0) {
                usuarioRepository.save(Usuario.builder()
                        .username("admin@hotel.com")
                        .password("admin123")
                        .nombreCompleto("Administrador Principal")
                        .telefono("+51 999 888 777")
                        .rol(Rol.ADMINISTRADOR)
                        .activo(true)
                        .build());

                usuarioRepository.save(Usuario.builder()
                        .username("ana.torres@hotel.com")
                        .password("recepcion123")
                        .nombreCompleto("Ana Torres")
                        .telefono("+51 987 654 321")
                        .rol(Rol.RECEPCIONISTA)
                        .activo(true)
                        .build());

                usuarioRepository.save(Usuario.builder()
                        .username("rosa.limpieza@hotel.com")
                        .password("limpieza123")
                        .nombreCompleto("Rosa Flores")
                        .telefono("+51 977 112 334")
                        .rol(Rol.LIMPIEZA)
                        .activo(true)
                        .build());
            }

            // Inicializar habitaciones si no existen
            if (habitacionRepository.count() == 0) {
                Habitacion h101 = habitacionRepository.save(Habitacion.builder()
                        .numero("101").tipo("Simple").nombreTema("Suite Simple Clásica")
                        .descripcion("Habitación simple acogedora con cama queen, TV smart y ducha española.")
                        .precioBloque(new BigDecimal("120.00")).capacidad(1).piso(1)
                        .estado(EstadoHabitacion.DISPONIBLE).tieneJacuzzi(false).tieneCocheraDirecta(true)
                        .urlImagen("/suite-simple.jpg").build());

                Habitacion h102 = habitacionRepository.save(Habitacion.builder()
                        .numero("102").tipo("Doble").nombreTema("Suite Doble Estándar")
                        .descripcion("Habitación doble espaciosa con cama king y acabados modernos.")
                        .precioBloque(new BigDecimal("160.00")).capacidad(2).piso(1)
                        .estado(EstadoHabitacion.DISPONIBLE).tieneJacuzzi(false).tieneCocheraDirecta(true)
                        .urlImagen("/suite-tematica.jpg").build());

                Habitacion h103 = habitacionRepository.save(Habitacion.builder()
                        .numero("103").tipo("Doble").nombreTema("Suite Doble Superior")
                        .descripcion("Habitación doble con sala de estar, aire acondicionado y vista al jardín.")
                        .precioBloque(new BigDecimal("160.00")).capacidad(2).piso(1)
                        .estado(EstadoHabitacion.DISPONIBLE).tieneJacuzzi(false).tieneCocheraDirecta(false)
                        .urlImagen("/suite-tematica.jpg").build());

                Habitacion h108 = habitacionRepository.save(Habitacion.builder()
                        .numero("108").tipo("Suite").nombreTema("Suite Ejecutiva")
                        .descripcion("Suite premium con zona de trabajo y comodidades de lujo.")
                        .precioBloque(new BigDecimal("250.00")).capacidad(2).piso(1)
                        .estado(EstadoHabitacion.DISPONIBLE).tieneJacuzzi(true).tieneCocheraDirecta(true)
                        .urlImagen("/suite-vip.jpg").build());

                Habitacion h201 = habitacionRepository.save(Habitacion.builder()
                        .numero("201").tipo("Suite").nombreTema("Suite Panorámica")
                        .descripcion("Habitación suite con vista a la ciudad, cama king, TV y minibar.")
                        .precioBloque(new BigDecimal("250.00")).capacidad(2).piso(2)
                        .estado(EstadoHabitacion.DISPONIBLE).tieneJacuzzi(true).tieneSauna(true).tieneCocheraDirecta(true)
                        .urlImagen("/suite-jacuzzi.jpg").build());

                Habitacion h202 = habitacionRepository.save(Habitacion.builder()
                        .numero("202").tipo("Suite").nombreTema("Suite Romántica")
                        .descripcion("Suite con jacuzzi doble privado, iluminación tenue y ambientación especial.")
                        .precioBloque(new BigDecimal("250.00")).capacidad(2).piso(2)
                        .estado(EstadoHabitacion.DISPONIBLE).tieneJacuzzi(true).tieneCocheraDirecta(false)
                        .urlImagen("/suite-vip.jpg").build());

                Habitacion h203 = habitacionRepository.save(Habitacion.builder()
                        .numero("203").tipo("Suite").nombreTema("Suite Presidencial")
                        .descripcion("Suite de máxima categoría con sauna y jacuzzi hidromasaje.")
                        .precioBloque(new BigDecimal("250.00")).capacidad(2).piso(2)
                        .estado(EstadoHabitacion.MANTENIMIENTO).tieneJacuzzi(true).tieneSauna(true)
                        .urlImagen("/suite-sauna.jpg").build());

                Habitacion h205 = habitacionRepository.save(Habitacion.builder()
                        .numero("205").tipo("Doble").nombreTema("Suite Deluxe")
                        .descripcion("Habitación con diseño contemporáneo y cochera con ingreso privado.")
                        .precioBloque(new BigDecimal("160.00")).capacidad(2).piso(2)
                        .estado(EstadoHabitacion.OCUPADA).tieneCocheraDirecta(true)
                        .urlImagen("/suite-cochera.jpg").build());

                Habitacion h301 = habitacionRepository.save(Habitacion.builder()
                        .numero("301").tipo("Doble").nombreTema("Suite Terraza")
                        .descripcion("Habitación doble con balcón y vista panorámica al mar.")
                        .precioBloque(new BigDecimal("160.00")).capacidad(2).piso(3)
                        .estado(EstadoHabitacion.DISPONIBLE).tieneCocheraDirecta(false)
                        .urlImagen("/suite-tematica.jpg").build());

                Habitacion h302 = habitacionRepository.save(Habitacion.builder()
                        .numero("302").tipo("Doble").nombreTema("Suite Marítima")
                        .descripcion("Habitación doble en tercer nivel con sonido envolvente y bar privado.")
                        .precioBloque(new BigDecimal("160.00")).capacidad(2).piso(3)
                        .estado(EstadoHabitacion.OCUPADA).tieneCocheraDirecta(false)
                        .urlImagen("/suite-simple.jpg").build());

                Habitacion h304 = habitacionRepository.save(Habitacion.builder()
                        .numero("304").tipo("Suite").nombreTema("Suite Imperial")
                        .descripcion("Suite de lujo en tercer piso con jacuzzi y vista exterior.")
                        .precioBloque(new BigDecimal("250.00")).capacidad(2).piso(3)
                        .estado(EstadoHabitacion.OCUPADA).tieneJacuzzi(true)
                        .urlImagen("/suite-vip.jpg").build());

                Habitacion h305 = habitacionRepository.save(Habitacion.builder()
                        .numero("305").tipo("Doble").nombreTema("Suite Confort")
                        .descripcion("Habitación doble en espera de protocolo de aseo tras check-out.")
                        .precioBloque(new BigDecimal("160.00")).capacidad(2).piso(3)
                        .estado(EstadoHabitacion.LIMPIEZA_PENDIENTE).tieneCocheraDirecta(false)
                        .urlImagen("/suite-tematica.jpg").build());

                // Crear reservas iniciales correspondientes a las capturas
                reservaRepository.save(Reserva.builder()
                        .codigo("#R-1025").habitacion(h302).documentoHuesped("45892134")
                        .nombreHuesped("María López").emailHuesped("maria.lopez@email.com")
                        .telefonoWhatsApp("+51 987 654 321").fechaReserva(LocalDate.now())
                        .fechaCheckIn(LocalDate.of(2025, 7, 7)).fechaCheckOut(LocalDate.of(2025, 7, 10))
                        .horaEntradaProgramada(LocalTime.of(14, 0)).horaSalidaProgramada(LocalTime.of(12, 0))
                        .bloqueSeleccionado("NOCHE COMPLETA").totalPago(new BigDecimal("480.00"))
                        .tokenAccesoQr(UUID.randomUUID().toString()).estado(EstadoReserva.CONFIRMADA).build());

                reservaRepository.save(Reserva.builder()
                        .codigo("#R-1026").habitacion(h101).documentoHuesped("71234589")
                        .nombreHuesped("Carlos Ruiz").emailHuesped("carlos.ruiz@email.com")
                        .telefonoWhatsApp("+51 912 345 678").fechaReserva(LocalDate.now())
                        .fechaCheckIn(LocalDate.of(2025, 7, 7)).fechaCheckOut(LocalDate.of(2025, 7, 8))
                        .horaEntradaProgramada(LocalTime.of(15, 0)).horaSalidaProgramada(LocalTime.of(11, 0))
                        .bloqueSeleccionado("PERNOCTE").totalPago(new BigDecimal("120.00"))
                        .tokenAccesoQr(UUID.randomUUID().toString()).estado(EstadoReserva.CONFIRMADA).build());

                reservaRepository.save(Reserva.builder()
                        .codigo("#R-1027").habitacion(h205).documentoHuesped("08976543")
                        .nombreHuesped("Ana Torres").emailHuesped("ana.t@gmail.com")
                        .telefonoWhatsApp("+51 998 877 665").fechaReserva(LocalDate.now())
                        .fechaCheckIn(LocalDate.of(2025, 7, 7)).fechaCheckOut(LocalDate.of(2025, 7, 15))
                        .horaEntradaProgramada(LocalTime.of(16, 0)).horaSalidaProgramada(LocalTime.of(12, 0))
                        .bloqueSeleccionado("NOCHE COMPLETA").totalPago(new BigDecimal("1280.00"))
                        .tokenAccesoQr(UUID.randomUUID().toString()).estado(EstadoReserva.PENDIENTE).build());

                reservaRepository.save(Reserva.builder()
                        .codigo("#R-1028").habitacion(h304).documentoHuesped("42567891")
                        .nombreHuesped("Luis Pérez").emailHuesped("luis.perez@outlook.com")
                        .telefonoWhatsApp("+51 976 543 210").fechaReserva(LocalDate.now())
                        .fechaCheckIn(LocalDate.of(2025, 7, 7)).fechaCheckOut(LocalDate.of(2025, 7, 10))
                        .horaEntradaProgramada(LocalTime.of(17, 0)).horaSalidaProgramada(LocalTime.of(11, 0))
                        .bloqueSeleccionado("NOCHE COMPLETA").totalPago(new BigDecimal("750.00"))
                        .tokenAccesoQr(UUID.randomUUID().toString()).estado(EstadoReserva.CHECKIN).build());

                reservaRepository.save(Reserva.builder()
                        .codigo("#R-1029").habitacion(h201).documentoHuesped("76543219")
                        .nombreHuesped("Valeria Gómez").emailHuesped("valeria.g@hotmail.com")
                        .telefonoWhatsApp("+51 965 432 109").fechaReserva(LocalDate.now())
                        .fechaCheckIn(LocalDate.of(2025, 7, 7)).fechaCheckOut(LocalDate.of(2025, 7, 9))
                        .horaEntradaProgramada(LocalTime.of(18, 0)).horaSalidaProgramada(LocalTime.of(12, 0))
                        .bloqueSeleccionado("NOCHE COMPLETA").totalPago(new BigDecimal("500.00"))
                        .tokenAccesoQr(UUID.randomUUID().toString()).estado(EstadoReserva.PENDIENTE).build());

                reservaRepository.save(Reserva.builder()
                        .codigo("#R-1030").habitacion(h103).documentoHuesped("10293847")
                        .nombreHuesped("Jorge Silva").emailHuesped("jorge.silva@empresa.com")
                        .telefonoWhatsApp("+51 954 321 098").fechaReserva(LocalDate.now())
                        .fechaCheckIn(LocalDate.of(2025, 7, 7)).fechaCheckOut(LocalDate.of(2025, 7, 12))
                        .horaEntradaProgramada(LocalTime.of(14, 0)).horaSalidaProgramada(LocalTime.of(12, 0))
                        .bloqueSeleccionado("NOCHE COMPLETA").totalPago(new BigDecimal("800.00"))
                        .tokenAccesoQr(UUID.randomUUID().toString()).estado(EstadoReserva.CONFIRMADA).build());
            }
        };
    }
}

