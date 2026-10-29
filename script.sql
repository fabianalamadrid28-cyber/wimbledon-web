-- ==============================================================================
-- SCRIPT DE BASE DE DATOS: HOTEL WIMBLEDON
-- Compatible con MySQL 8.0+ / MySQL Workbench
-- Base de datos: wimbledon_db
-- ==============================================================================

CREATE DATABASE IF NOT EXISTS `wimbledon_db` 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE `wimbledon_db`;

-- Desactivar temporalmente verificación de claves foráneas para recreación limpia
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `reservas`;
DROP TABLE IF EXISTS `habitaciones`;
DROP TABLE IF EXISTS `usuarios`;

SET FOREIGN_KEY_CHECKS = 1;

-- ==============================================================================
-- 1. TABLA: usuarios
-- Roles soportados: SUPER_ADMIN, ADMINISTRADOR, RECEPCIONISTA, LIMPIEZA, CLIENTE
-- ==============================================================================
CREATE TABLE `usuarios` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(255) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `nombre_completo` VARCHAR(255) NOT NULL,
  `telefono` VARCHAR(50) DEFAULT NULL,
  `rol` ENUM('SUPER_ADMIN', 'ADMINISTRADOR', 'RECEPCIONISTA', 'LIMPIEZA', 'CLIENTE') NOT NULL,
  `activo` BOOLEAN NOT NULL DEFAULT TRUE,
  `fecha_creacion` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================================================
-- 2. TABLA: habitaciones
-- Estados: DISPONIBLE, OCUPADA, LIMPIEZA_PENDIENTE, EN_PROCESO, LISTA, MANTENIMIENTO
-- ==============================================================================
CREATE TABLE `habitaciones` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `numero` VARCHAR(50) NOT NULL UNIQUE,
  `tipo` VARCHAR(50) NOT NULL, -- 'Simple', 'Doble', 'Suite'
  `nombre_tema` VARCHAR(255) NOT NULL,
  `descripcion` TEXT DEFAULT NULL,
  `precio_bloque` DECIMAL(10,2) NOT NULL,
  `capacidad` INT NOT NULL DEFAULT 2,
  `piso` INT NOT NULL DEFAULT 1,
  `estado` VARCHAR(50) NOT NULL DEFAULT 'DISPONIBLE',
  `tiene_jacuzzi` BOOLEAN NOT NULL DEFAULT FALSE,
  `tiene_sauna` BOOLEAN NOT NULL DEFAULT FALSE,
  `tiene_pole_dance` BOOLEAN NOT NULL DEFAULT FALSE,
  `tiene_sillon_tantrico` BOOLEAN NOT NULL DEFAULT FALSE,
  `tiene_cochera_directa` BOOLEAN NOT NULL DEFAULT FALSE,
  `url_imagen` VARCHAR(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================================================
-- 3. TABLA: reservas
-- Estados: PENDIENTE, CONFIRMADA, CHECKIN, FINALIZADA, CANCELADA
-- ==============================================================================
CREATE TABLE `reservas` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `codigo` VARCHAR(50) NOT NULL UNIQUE,
  `habitacion_id` BIGINT NOT NULL,
  `documento_huesped` VARCHAR(50) NOT NULL,
  `nombre_huesped` VARCHAR(255) NOT NULL,
  `email_huesped` VARCHAR(255) DEFAULT NULL,
  `telefono_whats_app` VARCHAR(50) NOT NULL,
  `fecha_reserva` DATE NOT NULL,
  `fecha_check_in` DATE DEFAULT NULL,
  `fecha_check_out` DATE DEFAULT NULL,
  `hora_entrada_programada` TIME NOT NULL,
  `hora_salida_programada` TIME NOT NULL,
  `bloque_seleccionado` VARCHAR(50) NOT NULL, -- '6 HORAS', '7 HORAS', 'PERNOCTE', 'NOCHE COMPLETA'
  `total_pago` DECIMAL(10,2) NOT NULL,
  `token_acceso_qr` VARCHAR(255) NOT NULL UNIQUE,
  `estado` VARCHAR(50) NOT NULL DEFAULT 'CONFIRMADA',
  `notas_adicionales` TEXT DEFAULT NULL,
  `fecha_creacion` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_reserva_habitacion` FOREIGN KEY (`habitacion_id`) REFERENCES `habitaciones` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================================================
-- INSERCIÓN DE DATOS: USUARIOS Y ROLES MAPEADOS
-- Contraseñas de prueba fáciles de recordar para el entorno de desarrollo
-- ==============================================================================

-- 1. Rol SUPER_ADMIN
INSERT INTO `usuarios` (`username`, `password`, `nombre_completo`, `telefono`, `rol`, `activo`) VALUES
('superadmin@hotel.com', 'admin123', 'Carlos Mendoza', '+51 999 000 111', 'SUPER_ADMIN', TRUE);

-- 2. Rol ADMINISTRADOR (Panel Principal, Gestión de Reservas, Habitaciones, Reportes)
INSERT INTO `usuarios` (`username`, `password`, `nombre_completo`, `telefono`, `rol`, `activo`) VALUES
('admin@hotel.com', 'admin123', 'Administrador General', '+51 999 888 777', 'ADMINISTRADOR', TRUE),
('gerencia@hotel.com', 'gerencia123', 'Rodrigo Salazar', '+51 999 222 333', 'ADMINISTRADOR', TRUE);

-- 3. Rol RECEPCIONISTA (Vista de Recepción: Ana Torres)
INSERT INTO `usuarios` (`username`, `password`, `nombre_completo`, `telefono`, `rol`, `activo`) VALUES
('ana.torres@hotel.com', 'recepcion123', 'Ana Torres', '+51 987 654 321', 'RECEPCIONISTA', TRUE),
('carlos.recepcion@hotel.com', 'recepcion123', 'Carlos Rivera', '+51 981 223 344', 'RECEPCIONISTA', TRUE);

-- 4. Rol LIMPIEZA (Vista de Personal de Limpieza: Rosa Flores)
INSERT INTO `usuarios` (`username`, `password`, `nombre_completo`, `telefono`, `rol`, `activo`) VALUES
('rosa.limpieza@hotel.com', 'limpieza123', 'Rosa Flores', '+51 977 112 334', 'LIMPIEZA', TRUE),
('maria.limpieza@hotel.com', 'limpieza123', 'María Quispe', '+51 976 554 433', 'LIMPIEZA', TRUE),
('lucia.limpieza@hotel.com', 'limpieza123', 'Lucía Paredes', '+51 975 667 788', 'LIMPIEZA', TRUE);

-- 5. Rol CLIENTE (Huéspedes registrados)
INSERT INTO `usuarios` (`username`, `password`, `nombre_completo`, `telefono`, `rol`, `activo`) VALUES
('maria.lopez@email.com', 'cliente123', 'María López', '+51 987 654 321', 'CLIENTE', TRUE),
('carlos.ruiz@email.com', 'cliente123', 'Carlos Ruiz', '+51 912 345 678', 'CLIENTE', TRUE);

-- ==============================================================================
-- INSERCIÓN DE DATOS: HABITACIONES (Mapeadas según las capturas del hotel)
-- ==============================================================================
INSERT INTO `habitaciones` (`id`, `numero`, `tipo`, `nombre_tema`, `descripcion`, `precio_bloque`, `capacidad`, `piso`, `estado`, `tiene_jacuzzi`, `tiene_sauna`, `tiene_pole_dance`, `tiene_sillon_tantrico`, `tiene_cochera_directa`, `url_imagen`) VALUES
(1, '101', 'Simple', 'Suite Simple Clásica', 'Habitación simple acogedora con cama queen, TV smart y ducha española.', 120.00, 1, 1, 'DISPONIBLE', FALSE, FALSE, FALSE, FALSE, TRUE, '/suite-simple.jpg'),
(2, '102', 'Doble', 'Suite Doble Estándar', 'Habitación doble espaciosa con cama king y acabados modernos.', 160.00, 2, 1, 'DISPONIBLE', FALSE, FALSE, FALSE, FALSE, TRUE, '/suite-tematica.jpg'),
(3, '103', 'Doble', 'Suite Doble Superior', 'Habitación doble con sala de estar, aire acondicionado y vista al jardín.', 160.00, 2, 1, 'DISPONIBLE', FALSE, FALSE, FALSE, FALSE, FALSE, '/suite-tematica.jpg'),
(4, '108', 'Suite', 'Suite Ejecutiva', 'Suite premium con zona de trabajo y comodidades de lujo.', 250.00, 2, 1, 'DISPONIBLE', TRUE, FALSE, FALSE, FALSE, TRUE, '/suite-vip.jpg'),
(5, '201', 'Suite', 'Suite Panorámica', 'Habitación suite con vista a la ciudad, cama king, TV y minibar.', 250.00, 2, 2, 'DISPONIBLE', TRUE, TRUE, FALSE, FALSE, TRUE, '/suite-jacuzzi.jpg'),
(6, '202', 'Suite', 'Suite Romántica', 'Suite con jacuzzi doble privado, iluminación tenue y ambientación especial.', 250.00, 2, 2, 'DISPONIBLE', TRUE, FALSE, FALSE, TRUE, FALSE, '/suite-vip.jpg'),
(7, '203', 'Suite', 'Suite Presidencial', 'Suite de máxima categoría con sauna y jacuzzi hidromasaje.', 250.00, 2, 2, 'MANTENIMIENTO', TRUE, TRUE, FALSE, TRUE, FALSE, '/suite-sauna.jpg'),
(8, '205', 'Doble', 'Suite Deluxe', 'Habitación con diseño contemporáneo y cochera con ingreso privado.', 160.00, 2, 2, 'OCUPADA', FALSE, FALSE, FALSE, FALSE, TRUE, '/suite-cochera.jpg'),
(9, '301', 'Doble', 'Suite Terraza', 'Habitación doble con balcón y vista panorámica al mar.', 160.00, 2, 3, 'DISPONIBLE', FALSE, FALSE, FALSE, FALSE, FALSE, '/suite-tematica.jpg'),
(10, '302', 'Doble', 'Suite Marítima', 'Habitación doble en tercer nivel con sonido envolvente y bar privado.', 160.00, 2, 3, 'OCUPADA', FALSE, FALSE, FALSE, FALSE, FALSE, '/suite-simple.jpg'),
(11, '304', 'Suite', 'Suite Imperial', 'Suite de lujo en tercer piso con jacuzzi y vista exterior.', 250.00, 2, 3, 'OCUPADA', TRUE, FALSE, TRUE, TRUE, FALSE, '/suite-vip.jpg'),
(12, '305', 'Doble', 'Suite Confort', 'Habitación doble en espera de protocolo de aseo tras check-out.', 160.00, 2, 3, 'LIMPIEZA_PENDIENTE', FALSE, FALSE, FALSE, FALSE, FALSE, '/suite-tematica.jpg');

-- ==============================================================================
-- INSERCIÓN DE DATOS: RESERVAS (Fieles a las tablas y dashboards del frontend)
-- ==============================================================================
INSERT INTO `reservas` (`id`, `codigo`, `habitacion_id`, `documento_huesped`, `nombre_huesped`, `email_huesped`, `telefono_whats_app`, `fecha_reserva`, `fecha_check_in`, `fecha_check_out`, `hora_entrada_programada`, `hora_salida_programada`, `bloque_seleccionado`, `total_pago`, `token_acceso_qr`, `estado`, `notas_adicionales`) VALUES
(1, '#R-1025', 10, '45892134', 'María López', 'maria.lopez@email.com', '+51 987 654 321', CURDATE(), '2025-07-07', '2025-07-10', '14:00:00', '12:00:00', 'NOCHE COMPLETA', 480.00, 'UUID-WBL-1025-QR7788', 'CONFIRMADA', 'Solicita almohadas adicionales.'),
(2, '#R-1026', 1, '71234589', 'Carlos Ruiz', 'carlos.ruiz@email.com', '+51 912 345 678', CURDATE(), '2025-07-07', '2025-07-08', '15:00:00', '11:00:00', 'PERNOCTE', 120.00, 'UUID-WBL-1026-QR7789', 'CONFIRMADA', 'Ingreso por cochera directa.'),
(3, '#R-1027', 8, '08976543', 'Ana Torres', 'ana.t@gmail.com', '+51 998 877 665', CURDATE(), '2025-07-07', '2025-07-15', '16:00:00', '12:00:00', 'NOCHE COMPLETA', 1280.00, 'UUID-WBL-1027-QR7790', 'PENDIENTE', 'Confirmación de pago pendiente por Yape.'),
(4, '#R-1028', 11, '42567891', 'Luis Pérez', 'luis.perez@outlook.com', '+51 976 543 210', CURDATE(), '2025-07-07', '2025-07-10', '17:00:00', '11:00:00', 'NOCHE COMPLETA', 750.00, 'UUID-WBL-1028-QR7791', 'CHECKIN', 'Huésped alojado actualmente en suite.'),
(5, '#R-1029', 5, '76543219', 'Valeria Gómez', 'valeria.g@hotmail.com', '+51 965 432 109', CURDATE(), '2025-07-07', '2025-07-09', '18:00:00', '12:00:00', 'NOCHE COMPLETA', 500.00, 'UUID-WBL-1029-QR7792', 'PENDIENTE', 'Llegada aproximada a las 6:30 PM.'),
(6, '#R-1030', 3, '10293847', 'Jorge Silva', 'jorge.silva@empresa.com', '+51 954 321 098', CURDATE(), '2025-07-07', '2025-07-12', '14:00:00', '12:00:00', 'NOCHE COMPLETA', 800.00, 'UUID-WBL-1030-QR7793', 'CONFIRMADA', 'Reserva corporativa con factura.');

-- ==============================================================================
-- CONSULTAS DE COMPROBACIÓN RÁPIDA (Para ejecutar en MySQL Workbench)
-- ==============================================================================

-- 1. Ver todos los usuarios organizados por rol
SELECT id, username, nombre_completo, rol, telefono, activo FROM usuarios ORDER BY rol;

-- 2. Resumen de habitaciones por estado actual
SELECT estado, COUNT(*) AS cantidad FROM habitaciones GROUP BY estado;

-- 3. Lista de reservas activas con su habitación y huésped
SELECT 
    r.codigo, 
    r.nombre_huesped, 
    h.numero AS habitacion, 
    h.tipo, 
    r.fecha_check_in, 
    r.fecha_check_out, 
    r.estado, 
    r.total_pago
FROM reservas r
INNER JOIN habitaciones h ON r.habitacion_id = h.id
ORDER BY r.id ASC;

