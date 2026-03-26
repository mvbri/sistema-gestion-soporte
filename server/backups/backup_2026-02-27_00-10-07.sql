-- Backup generado el 2026-02-27T00:10:07.221Z
-- Sistema de Gestión de Soporte Técnico

SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";


-- --------------------------------------------------------
-- Estructura de tabla para `consumable_types`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `consumable_types`;
CREATE TABLE `consumable_types` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  KEY `idx_name` (`name`),
  KEY `idx_active` (`active`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- --------------------------------------------------------
-- Datos de la tabla `consumable_types`
-- --------------------------------------------------------

INSERT INTO `consumable_types` (`id`, `name`, `description`, `active`, `created_at`, `updated_at`) VALUES (1, 'Paper', 'Resmas de papel, hojas sueltas, etc.', 1, '2026-02-26 06:58:54', '2026-02-26 06:58:54');
INSERT INTO `consumable_types` (`id`, `name`, `description`, `active`, `created_at`, `updated_at`) VALUES (2, 'Writing', 'Lápices, bolígrafos, marcadores, etc.', 1, '2026-02-26 06:58:54', '2026-02-26 06:58:54');
INSERT INTO `consumable_types` (`id`, `name`, `description`, `active`, `created_at`, `updated_at`) VALUES (3, 'Printing', 'Tóner, cartuchos de tinta, etc.', 1, '2026-02-26 06:58:54', '2026-02-26 06:58:54');
INSERT INTO `consumable_types` (`id`, `name`, `description`, `active`, `created_at`, `updated_at`) VALUES (4, 'Office', 'Otros consumibles de oficina', 1, '2026-02-26 06:58:54', '2026-02-26 06:58:54');
INSERT INTO `consumable_types` (`id`, `name`, `description`, `active`, `created_at`, `updated_at`) VALUES (5, 'Other', 'Otro tipo de consumible', 1, '2026-02-26 06:58:54', '2026-02-26 06:58:54');
INSERT INTO `consumable_types` (`id`, `name`, `description`, `active`, `created_at`, `updated_at`) VALUES (7, 'skin care', NULL, 1, '2026-02-26 07:16:28', '2026-02-26 07:16:28');


-- --------------------------------------------------------
-- Estructura de tabla para `consumables`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `consumables`;
CREATE TABLE `consumables` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `type_id` int(11) NOT NULL,
  `unit` varchar(50) NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT 0,
  `minimum_quantity` int(11) NOT NULL DEFAULT 0,
  `status` enum('available','low_stock','out_of_stock','inactive') NOT NULL DEFAULT 'available',
  `location` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_status` (`status`),
  KEY `idx_type` (`type_id`),
  KEY `idx_active` (`active`),
  KEY `idx_name` (`name`),
  CONSTRAINT `1` FOREIGN KEY (`type_id`) REFERENCES `consumable_types` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- --------------------------------------------------------
-- Datos de la tabla `consumables`
-- --------------------------------------------------------

INSERT INTO `consumables` (`id`, `name`, `type_id`, `unit`, `quantity`, `minimum_quantity`, `status`, `location`, `description`, `active`, `created_at`, `updated_at`) VALUES (1, 'Boligrafos', 5, 'cajas', 2, 1, 'available', NULL, NULL, 1, '2026-02-26 07:01:50', '2026-02-26 07:09:25');
INSERT INTO `consumables` (`id`, `name`, `type_id`, `unit`, `quantity`, `minimum_quantity`, `status`, `location`, `description`, `active`, `created_at`, `updated_at`) VALUES (2, 'Hojas de papel', 1, 'resmas', 7, 2, 'available', NULL, NULL, 1, '2026-02-27 00:00:29', '2026-02-27 00:00:29');


-- --------------------------------------------------------
-- Estructura de tabla para `equipment`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `equipment`;
CREATE TABLE `equipment` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `brand` varchar(100) DEFAULT NULL,
  `model` varchar(100) DEFAULT NULL,
  `serial_number` varchar(100) DEFAULT NULL,
  `type_id` int(11) NOT NULL DEFAULT 1,
  `type` enum('laptop','desktop','monitor','printer','network_device','other') NOT NULL DEFAULT 'other',
  `status` enum('available','assigned','maintenance','retired') NOT NULL DEFAULT 'available',
  `location` varchar(255) DEFAULT NULL,
  `assigned_to_user_id` int(11) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `purchase_date` date DEFAULT NULL,
  `warranty_expires_at` date DEFAULT NULL,
  `active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `serial_number` (`serial_number`),
  KEY `idx_status` (`status`),
  KEY `idx_type` (`type`),
  KEY `idx_assigned_user` (`assigned_to_user_id`),
  KEY `idx_active` (`active`),
  KEY `idx_serial_number` (`serial_number`),
  KEY `fk_equipment_type` (`type_id`),
  CONSTRAINT `1` FOREIGN KEY (`assigned_to_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_equipment_type` FOREIGN KEY (`type_id`) REFERENCES `equipment_types` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- --------------------------------------------------------
-- Datos de la tabla `equipment`
-- --------------------------------------------------------

INSERT INTO `equipment` (`id`, `name`, `brand`, `model`, `serial_number`, `type_id`, `type`, `status`, `location`, `assigned_to_user_id`, `description`, `purchase_date`, `warranty_expires_at`, `active`, `created_at`, `updated_at`) VALUES (1, 'Laptop', 'Lenovo', '8021', 'xe1000', 12, 'laptop', 'retired', 'Venezuela', NULL, '', '2026-02-24 04:00:00', '2026-02-24 04:00:00', 0, '2026-02-25 11:47:24', '2026-02-25 13:14:44');
INSERT INTO `equipment` (`id`, `name`, `brand`, `model`, `serial_number`, `type_id`, `type`, `status`, `location`, `assigned_to_user_id`, `description`, `purchase_date`, `warranty_expires_at`, `active`, `created_at`, `updated_at`) VALUES (2, 'Harina Pan', NULL, '8020', NULL, 1, 'other', 'available', NULL, NULL, NULL, '2026-02-24 04:00:00', NULL, 0, '2026-02-25 13:14:47', '2026-02-26 06:01:03');
INSERT INTO `equipment` (`id`, `name`, `brand`, `model`, `serial_number`, `type_id`, `type`, `status`, `location`, `assigned_to_user_id`, `description`, `purchase_date`, `warranty_expires_at`, `active`, `created_at`, `updated_at`) VALUES (3, 'Laptop-DEV-01', 'Apple', 'MacBook Pro M3 Max 14\"', 'GCFX12345679', 2, 'other', 'available', NULL, NULL, NULL, '2026-02-25 04:00:00', '2026-03-31 04:00:00', 1, '2026-02-26 06:15:29', '2026-02-27 02:46:46');
INSERT INTO `equipment` (`id`, `name`, `brand`, `model`, `serial_number`, `type_id`, `type`, `status`, `location`, `assigned_to_user_id`, `description`, `purchase_date`, `warranty_expires_at`, `active`, `created_at`, `updated_at`) VALUES (4, 'LAP-SOPORTE-01', 'Apple', '700Gt', 'S/N: B2C4X13', 9, 'other', 'assigned', NULL, 10, NULL, '2026-02-27 04:00:00', '2026-02-27 04:00:00', 1, '2026-02-26 23:57:55', '2026-02-26 23:59:47');
INSERT INTO `equipment` (`id`, `name`, `brand`, `model`, `serial_number`, `type_id`, `type`, `status`, `location`, `assigned_to_user_id`, `description`, `purchase_date`, `warranty_expires_at`, `active`, `created_at`, `updated_at`) VALUES (7, 'IMP-CORP-02', 'Epson', 'LaserJet Pro M404', 'S/N: B2C4X1453', 7, 'other', 'available', NULL, NULL, NULL, '2026-02-28 04:00:00', NULL, 1, '2026-02-26 23:59:10', '2026-02-26 23:59:10');


-- --------------------------------------------------------
-- Estructura de tabla para `equipment_types`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `equipment_types`;
CREATE TABLE `equipment_types` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- --------------------------------------------------------
-- Datos de la tabla `equipment_types`
-- --------------------------------------------------------

INSERT INTO `equipment_types` (`id`, `name`, `description`, `active`, `created_at`, `updated_at`) VALUES (1, 'dron', NULL, 1, '2026-02-25 12:57:43', '2026-02-25 12:57:43');
INSERT INTO `equipment_types` (`id`, `name`, `description`, `active`, `created_at`, `updated_at`) VALUES (2, 'Laptop', 'Computadora portátil', 1, '2026-02-25 13:13:30', '2026-02-25 13:13:30');
INSERT INTO `equipment_types` (`id`, `name`, `description`, `active`, `created_at`, `updated_at`) VALUES (3, 'Desktop', 'Computadora de escritorio', 1, '2026-02-25 13:13:30', '2026-02-25 13:13:30');
INSERT INTO `equipment_types` (`id`, `name`, `description`, `active`, `created_at`, `updated_at`) VALUES (4, 'Monitor', 'Monitor de computadora', 1, '2026-02-25 13:13:30', '2026-02-25 13:13:30');
INSERT INTO `equipment_types` (`id`, `name`, `description`, `active`, `created_at`, `updated_at`) VALUES (5, 'Teclado', 'Teclado de computadora', 1, '2026-02-25 13:13:30', '2026-02-25 13:13:30');
INSERT INTO `equipment_types` (`id`, `name`, `description`, `active`, `created_at`, `updated_at`) VALUES (6, 'Mouse', 'Mouse o ratón', 1, '2026-02-25 13:13:30', '2026-02-25 13:13:30');
INSERT INTO `equipment_types` (`id`, `name`, `description`, `active`, `created_at`, `updated_at`) VALUES (7, 'Impresora', 'Impresora', 1, '2026-02-25 13:13:30', '2026-02-25 13:13:30');
INSERT INTO `equipment_types` (`id`, `name`, `description`, `active`, `created_at`, `updated_at`) VALUES (8, 'Router', 'Router o enrutador de red', 1, '2026-02-25 13:13:30', '2026-02-25 13:13:30');
INSERT INTO `equipment_types` (`id`, `name`, `description`, `active`, `created_at`, `updated_at`) VALUES (9, 'Switch', 'Switch de red', 1, '2026-02-25 13:13:30', '2026-02-25 13:13:30');
INSERT INTO `equipment_types` (`id`, `name`, `description`, `active`, `created_at`, `updated_at`) VALUES (10, 'Tablet', 'Tablet o tableta', 1, '2026-02-25 13:13:30', '2026-02-25 13:13:30');
INSERT INTO `equipment_types` (`id`, `name`, `description`, `active`, `created_at`, `updated_at`) VALUES (11, 'Smartphone', 'Teléfono inteligente', 1, '2026-02-25 13:13:30', '2026-02-25 13:13:30');
INSERT INTO `equipment_types` (`id`, `name`, `description`, `active`, `created_at`, `updated_at`) VALUES (12, 'Otro', 'Otro tipo de equipo', 1, '2026-02-25 13:13:30', '2026-02-25 13:13:30');


-- --------------------------------------------------------
-- Estructura de tabla para `incident_areas`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `incident_areas`;
CREATE TABLE `incident_areas` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- --------------------------------------------------------
-- Datos de la tabla `incident_areas`
-- --------------------------------------------------------

INSERT INTO `incident_areas` (`id`, `name`, `description`, `active`, `created_at`, `updated_at`) VALUES (1, 'Dirección de Informática', 'Área de sistemas y tecnología', 1, '2026-02-22 06:19:40', '2026-02-22 06:19:40');
INSERT INTO `incident_areas` (`id`, `name`, `description`, `active`, `created_at`, `updated_at`) VALUES (2, 'Dirección de Administración siuuu', 'Área administrativa', 0, '2026-02-22 06:19:40', '2026-02-22 07:34:47');
INSERT INTO `incident_areas` (`id`, `name`, `description`, `active`, `created_at`, `updated_at`) VALUES (4, 'Dirección de Talento Humano', 'Área de recursos humanos', 1, '2026-02-22 06:19:40', '2026-02-22 06:19:40');
INSERT INTO `incident_areas` (`id`, `name`, `description`, `active`, `created_at`, `updated_at`) VALUES (5, 'Sala de Reuniones', 'Salas de reuniones y espacios comunes', 1, '2026-02-22 06:19:40', '2026-02-22 06:19:40');
INSERT INTO `incident_areas` (`id`, `name`, `description`, `active`, `created_at`, `updated_at`) VALUES (6, 'Oficina 201', 'Oficina administrativa', 1, '2026-02-22 06:19:40', '2026-02-22 06:19:40');
INSERT INTO `incident_areas` (`id`, `name`, `description`, `active`, `created_at`, `updated_at`) VALUES (7, 'Oficina 202', 'Oficina administrativa', 1, '2026-02-22 06:19:40', '2026-02-22 06:19:40');
INSERT INTO `incident_areas` (`id`, `name`, `description`, `active`, `created_at`, `updated_at`) VALUES (8, 'Oficina 203', 'Oficina administrativa', 1, '2026-02-22 06:19:40', '2026-02-22 06:19:40');
INSERT INTO `incident_areas` (`id`, `name`, `description`, `active`, `created_at`, `updated_at`) VALUES (9, 'Sale de reuniones', 'Migrated from tickets: Sale de reuniones', 1, '2026-02-22 06:19:40', '2026-02-22 06:19:40');
INSERT INTO `incident_areas` (`id`, `name`, `description`, `active`, `created_at`, `updated_at`) VALUES (10, 'Oficina 2', 'Migrated from tickets: Oficina 2', 1, '2026-02-22 06:19:40', '2026-02-22 06:19:40');
INSERT INTO `incident_areas` (`id`, `name`, `description`, `active`, `created_at`, `updated_at`) VALUES (18, 'Dirección de presupuesto', NULL, 1, '2026-02-22 07:22:16', '2026-02-22 07:22:16');


-- --------------------------------------------------------
-- Estructura de tabla para `roles`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `roles`;
CREATE TABLE `roles` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- --------------------------------------------------------
-- Datos de la tabla `roles`
-- --------------------------------------------------------

INSERT INTO `roles` (`id`, `name`, `description`, `created_at`, `updated_at`) VALUES (1, 'administrator', 'Administrador del sistema con acceso completo', '2026-01-26 11:48:33', '2026-01-26 11:48:33');
INSERT INTO `roles` (`id`, `name`, `description`, `created_at`, `updated_at`) VALUES (2, 'technician', 'Técnico de soporte con permisos para gestionar incidencias', '2026-01-26 11:48:33', '2026-01-26 11:48:33');
INSERT INTO `roles` (`id`, `name`, `description`, `created_at`, `updated_at`) VALUES (3, 'end_user', 'Usuario final que puede reportar incidencias', '2026-01-26 11:48:33', '2026-01-26 11:48:33');


-- --------------------------------------------------------
-- Estructura de tabla para `ticket_categories`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `ticket_categories`;
CREATE TABLE `ticket_categories` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- --------------------------------------------------------
-- Datos de la tabla `ticket_categories`
-- --------------------------------------------------------

INSERT INTO `ticket_categories` (`id`, `name`, `description`, `active`, `created_at`, `updated_at`) VALUES (1, 'Hardware', 'Problemas relacionados con equipos físicos', 1, '2026-02-18 06:22:39', '2026-02-18 06:22:39');
INSERT INTO `ticket_categories` (`id`, `name`, `description`, `active`, `created_at`, `updated_at`) VALUES (2, 'Software', 'Problemas relacionados con aplicaciones y programas', 1, '2026-02-18 06:22:39', '2026-02-18 06:22:39');
INSERT INTO `ticket_categories` (`id`, `name`, `description`, `active`, `created_at`, `updated_at`) VALUES (3, 'Red', 'Problemas relacionados con conectividad y red', 1, '2026-02-18 06:22:39', '2026-02-18 06:22:39');
INSERT INTO `ticket_categories` (`id`, `name`, `description`, `active`, `created_at`, `updated_at`) VALUES (4, 'Otro', 'Otras incidencias no categorizadas', 1, '2026-02-18 06:22:39', '2026-02-18 06:22:39');
INSERT INTO `ticket_categories` (`id`, `name`, `description`, `active`, `created_at`, `updated_at`) VALUES (7, 'Categoria nueva', 'Una nueva categoria fghgffdj', 1, '2026-02-22 07:20:33', '2026-02-22 07:20:33');
INSERT INTO `ticket_categories` (`id`, `name`, `description`, `active`, `created_at`, `updated_at`) VALUES (8, 'Desarmado y Precisión', NULL, 1, '2026-02-26 23:48:07', '2026-02-26 23:48:07');


-- --------------------------------------------------------
-- Estructura de tabla para `ticket_comments`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `ticket_comments`;
CREATE TABLE `ticket_comments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `ticket_id` char(36) NOT NULL,
  `user_id` int(11) NOT NULL,
  `content` text NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_ticket` (`ticket_id`),
  KEY `idx_usuario` (`user_id`),
  KEY `idx_fecha_creacion` (`created_at`),
  CONSTRAINT `1` FOREIGN KEY (`ticket_id`) REFERENCES `tickets` (`id`) ON DELETE CASCADE,
  CONSTRAINT `2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- --------------------------------------------------------
-- Datos de la tabla `ticket_comments`
-- --------------------------------------------------------

INSERT INTO `ticket_comments` (`id`, `ticket_id`, `user_id`, `content`, `created_at`) VALUES (1, '39bcac38-d276-4910-ada6-dc2c4e1d32a0', 5, 'Se debe mejorar tal cosa', '2026-02-21 02:55:08');
INSERT INTO `ticket_comments` (`id`, `ticket_id`, `user_id`, `content`, `created_at`) VALUES (2, '39bcac38-d276-4910-ada6-dc2c4e1d32a0', 5, 'Ya me encargo.', '2026-02-21 03:55:51');
INSERT INTO `ticket_comments` (`id`, `ticket_id`, `user_id`, `content`, `created_at`) VALUES (3, '39bcac38-d276-4910-ada6-dc2c4e1d32a0', 5, 'Listo', '2026-02-21 03:56:27');
INSERT INTO `ticket_comments` (`id`, `ticket_id`, `user_id`, `content`, `created_at`) VALUES (4, '39bcac38-d276-4910-ada6-dc2c4e1d32a0', 5, 'Faltó un comentario', '2026-02-21 07:59:45');
INSERT INTO `ticket_comments` (`id`, `ticket_id`, `user_id`, `content`, `created_at`) VALUES (10, '79c1de31-1cc7-4be0-b487-60139b4329fe', 12, '1 Comentario', '2026-02-22 10:50:09');
INSERT INTO `ticket_comments` (`id`, `ticket_id`, `user_id`, `content`, `created_at`) VALUES (11, '79c1de31-1cc7-4be0-b487-60139b4329fe', 5, 'Un comentario de un administrador', '2026-02-22 10:53:55');
INSERT INTO `ticket_comments` (`id`, `ticket_id`, `user_id`, `content`, `created_at`) VALUES (12, '79c1de31-1cc7-4be0-b487-60139b4329fe', 12, 'Yo de nuevo', '2026-02-22 11:04:41');
INSERT INTO `ticket_comments` (`id`, `ticket_id`, `user_id`, `content`, `created_at`) VALUES (13, 'caa36b2f-aed8-4bd7-9984-0862eb1e156f', 12, 'Un comentario', '2026-02-27 07:01:25');


-- --------------------------------------------------------
-- Estructura de tabla para `ticket_equipment`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `ticket_equipment`;
CREATE TABLE `ticket_equipment` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `ticket_id` char(36) NOT NULL,
  `equipment_id` int(11) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_ticket_equipment` (`ticket_id`,`equipment_id`),
  KEY `idx_ticket` (`ticket_id`),
  KEY `idx_equipment` (`equipment_id`),
  CONSTRAINT `1` FOREIGN KEY (`ticket_id`) REFERENCES `tickets` (`id`) ON DELETE CASCADE,
  CONSTRAINT `2` FOREIGN KEY (`equipment_id`) REFERENCES `equipment` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- --------------------------------------------------------
-- Datos de la tabla `ticket_equipment`
-- --------------------------------------------------------

INSERT INTO `ticket_equipment` (`id`, `ticket_id`, `equipment_id`, `created_at`) VALUES (2, '8d4e18e7-7928-4faa-9d42-7f842d70aacd', 3, '2026-02-27 02:47:32');
INSERT INTO `ticket_equipment` (`id`, `ticket_id`, `equipment_id`, `created_at`) VALUES (3, '438d5130-0b39-49c6-a745-78c6543e855f', 3, '2026-02-27 00:08:28');


-- --------------------------------------------------------
-- Estructura de tabla para `ticket_history`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `ticket_history`;
CREATE TABLE `ticket_history` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `ticket_id` char(36) NOT NULL,
  `user_id` int(11) NOT NULL,
  `change_type` varchar(50) NOT NULL,
  `previous_field` varchar(255) DEFAULT NULL,
  `new_field` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `changed_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_ticket` (`ticket_id`),
  KEY `idx_usuario` (`user_id`),
  KEY `idx_fecha_cambio` (`changed_at`),
  CONSTRAINT `1` FOREIGN KEY (`ticket_id`) REFERENCES `tickets` (`id`) ON DELETE CASCADE,
  CONSTRAINT `2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=42 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- --------------------------------------------------------
-- Datos de la tabla `ticket_history`
-- --------------------------------------------------------

INSERT INTO `ticket_history` (`id`, `ticket_id`, `user_id`, `change_type`, `previous_field`, `new_field`, `description`, `changed_at`) VALUES (1, '5fd6b520-fcc0-44e6-8892-a5a3cfb6f14e', 5, 'CREACION', NULL, NULL, 'Ticket creado', '2026-02-18 06:50:46');
INSERT INTO `ticket_history` (`id`, `ticket_id`, `user_id`, `change_type`, `previous_field`, `new_field`, `description`, `changed_at`) VALUES (2, '7f9b37ae-d459-41e2-a23f-d12d24c69987', 5, 'CREACION', NULL, NULL, 'Ticket creado', '2026-02-18 07:03:54');
INSERT INTO `ticket_history` (`id`, `ticket_id`, `user_id`, `change_type`, `previous_field`, `new_field`, `description`, `changed_at`) VALUES (3, '39bcac38-d276-4910-ada6-dc2c4e1d32a0', 5, 'CREACION', NULL, NULL, 'Ticket creado', '2026-02-18 07:09:20');
INSERT INTO `ticket_history` (`id`, `ticket_id`, `user_id`, `change_type`, `previous_field`, `new_field`, `description`, `changed_at`) VALUES (4, '39bcac38-d276-4910-ada6-dc2c4e1d32a0', 5, 'ACTUALIZACION', 'La red se cayó de nuevo.', 'La red se cayó de nuevo. aja', 'descripcion cambiado de \"La red se cayó de nuevo.\" a \"La red se cayó de nuevo. aja\"', '2026-02-18 07:38:40');
INSERT INTO `ticket_history` (`id`, `ticket_id`, `user_id`, `change_type`, `previous_field`, `new_field`, `description`, `changed_at`) VALUES (5, '39bcac38-d276-4910-ada6-dc2c4e1d32a0', 5, 'ACTUALIZACION', 'Sin asignar', 'Maria  Briceño R', 'tecnico_asignado cambiado de \"Sin asignar\" a \"Maria  Briceño R\"', '2026-02-18 07:38:40');
INSERT INTO `ticket_history` (`id`, `ticket_id`, `user_id`, `change_type`, `previous_field`, `new_field`, `description`, `changed_at`) VALUES (6, '39bcac38-d276-4910-ada6-dc2c4e1d32a0', 5, 'COMENTARIO', NULL, NULL, 'Comentario agregado', '2026-02-21 02:55:08');
INSERT INTO `ticket_history` (`id`, `ticket_id`, `user_id`, `change_type`, `previous_field`, `new_field`, `description`, `changed_at`) VALUES (7, '39bcac38-d276-4910-ada6-dc2c4e1d32a0', 5, 'ACTUALIZACION', 'La red se cayó de nuevo. aja', 'La red se cayó de nuevo. ajax', 'descripcion cambiado de \"La red se cayó de nuevo. aja\" a \"La red se cayó de nuevo. ajax\"', '2026-02-21 03:21:53');
INSERT INTO `ticket_history` (`id`, `ticket_id`, `user_id`, `change_type`, `previous_field`, `new_field`, `description`, `changed_at`) VALUES (9, '39bcac38-d276-4910-ada6-dc2c4e1d32a0', 5, 'ACTUALIZACION', 'La red se cayó de nuevo. ajax', 'La red se cayó de nuevo', 'descripcion cambiado de \"La red se cayó de nuevo. ajax\" a \"La red se cayó de nuevo\"', '2026-02-21 03:31:24');
INSERT INTO `ticket_history` (`id`, `ticket_id`, `user_id`, `change_type`, `previous_field`, `new_field`, `description`, `changed_at`) VALUES (10, '39bcac38-d276-4910-ada6-dc2c4e1d32a0', 5, 'COMENTARIO', NULL, NULL, 'Comentario agregado', '2026-02-21 03:55:51');
INSERT INTO `ticket_history` (`id`, `ticket_id`, `user_id`, `change_type`, `previous_field`, `new_field`, `description`, `changed_at`) VALUES (11, '39bcac38-d276-4910-ada6-dc2c4e1d32a0', 5, 'COMENTARIO', NULL, NULL, 'Comentario agregado', '2026-02-21 03:56:27');
INSERT INTO `ticket_history` (`id`, `ticket_id`, `user_id`, `change_type`, `previous_field`, `new_field`, `description`, `changed_at`) VALUES (12, '39bcac38-d276-4910-ada6-dc2c4e1d32a0', 5, 'COMENTARIO', NULL, NULL, 'Comentario agregado', '2026-02-21 07:59:45');
INSERT INTO `ticket_history` (`id`, `ticket_id`, `user_id`, `change_type`, `previous_field`, `new_field`, `description`, `changed_at`) VALUES (13, '39bcac38-d276-4910-ada6-dc2c4e1d32a0', 5, 'ACTUALIZACION', 'Abierto', 'En Proceso', 'estado cambiado de \"Abierto\" a \"En Proceso\"', '2026-02-21 04:04:07');
INSERT INTO `ticket_history` (`id`, `ticket_id`, `user_id`, `change_type`, `previous_field`, `new_field`, `description`, `changed_at`) VALUES (14, '39bcac38-d276-4910-ada6-dc2c4e1d32a0', 5, 'ACTUALIZACION', 'En Proceso', 'Resuelto', 'Estado cambiado de \"En Proceso\" a \"Resuelto\"', '2026-02-21 04:06:43');
INSERT INTO `ticket_history` (`id`, `ticket_id`, `user_id`, `change_type`, `previous_field`, `new_field`, `description`, `changed_at`) VALUES (21, '79c1de31-1cc7-4be0-b487-60139b4329fe', 12, 'CREATION', NULL, NULL, 'Ticket creado', '2026-02-22 06:45:52');
INSERT INTO `ticket_history` (`id`, `ticket_id`, `user_id`, `change_type`, `previous_field`, `new_field`, `description`, `changed_at`) VALUES (22, '79c1de31-1cc7-4be0-b487-60139b4329fe', 5, 'UPDATE', 'Sin asignar', 'Maria IT two', 'assigned_technician cambiado de \"Sin asignar\" a \"Maria IT two\"', '2026-02-22 07:03:14');
INSERT INTO `ticket_history` (`id`, `ticket_id`, `user_id`, `change_type`, `previous_field`, `new_field`, `description`, `changed_at`) VALUES (23, '79c1de31-1cc7-4be0-b487-60139b4329fe', 5, 'UPDATE', 'Abierto', 'Asignado', 'state cambiado de \"Abierto\" a \"Asignado\"', '2026-02-22 07:03:14');
INSERT INTO `ticket_history` (`id`, `ticket_id`, `user_id`, `change_type`, `previous_field`, `new_field`, `description`, `changed_at`) VALUES (24, '79c1de31-1cc7-4be0-b487-60139b4329fe', 10, 'UPDATE', 'Asignado', 'En Proceso', 'state cambiado de \"Asignado\" a \"En Proceso\"', '2026-02-22 07:18:56');
INSERT INTO `ticket_history` (`id`, `ticket_id`, `user_id`, `change_type`, `previous_field`, `new_field`, `description`, `changed_at`) VALUES (25, '79c1de31-1cc7-4be0-b487-60139b4329fe', 10, 'UPDATE', 'En Proceso', 'Resuelto', 'Estado cambiado de \"En Proceso\" a \"Resuelto\"', '2026-02-22 07:29:30');
INSERT INTO `ticket_history` (`id`, `ticket_id`, `user_id`, `change_type`, `previous_field`, `new_field`, `description`, `changed_at`) VALUES (26, '3ffaaf09-0af4-4cbb-aff5-396d6779d334', 12, 'CREATION', NULL, NULL, 'Ticket creado', '2026-02-22 07:49:05');
INSERT INTO `ticket_history` (`id`, `ticket_id`, `user_id`, `change_type`, `previous_field`, `new_field`, `description`, `changed_at`) VALUES (27, '3ffaaf09-0af4-4cbb-aff5-396d6779d334', 5, 'UPDATE', 'Sin asignar', 'Maria IT two', 'assigned_technician cambiado de \"Sin asignar\" a \"Maria IT two\"', '2026-02-22 07:58:29');
INSERT INTO `ticket_history` (`id`, `ticket_id`, `user_id`, `change_type`, `previous_field`, `new_field`, `description`, `changed_at`) VALUES (28, '3ffaaf09-0af4-4cbb-aff5-396d6779d334', 5, 'UPDATE', 'Abierto', 'Asignado', 'state cambiado de \"Abierto\" a \"Asignado\"', '2026-02-22 07:58:29');
INSERT INTO `ticket_history` (`id`, `ticket_id`, `user_id`, `change_type`, `previous_field`, `new_field`, `description`, `changed_at`) VALUES (29, '3ffaaf09-0af4-4cbb-aff5-396d6779d334', 10, 'UPDATE', 'Asignado', 'Cerrado', 'state cambiado de \"Asignado\" a \"Cerrado\"', '2026-02-22 08:00:56');
INSERT INTO `ticket_history` (`id`, `ticket_id`, `user_id`, `change_type`, `previous_field`, `new_field`, `description`, `changed_at`) VALUES (30, 'caa36b2f-aed8-4bd7-9984-0862eb1e156f', 12, 'CREATION', NULL, NULL, 'Ticket creado', '2026-02-27 06:17:19');
INSERT INTO `ticket_history` (`id`, `ticket_id`, `user_id`, `change_type`, `previous_field`, `new_field`, `description`, `changed_at`) VALUES (31, '366455ff-ebf2-4d57-918b-6cd8ab71aaa4', 14, 'CREATION', NULL, NULL, 'Ticket creado', '2026-02-27 06:26:00');
INSERT INTO `ticket_history` (`id`, `ticket_id`, `user_id`, `change_type`, `previous_field`, `new_field`, `description`, `changed_at`) VALUES (32, '8d4e18e7-7928-4faa-9d42-7f842d70aacd', 12, 'CREATION', NULL, NULL, 'Ticket creado', '2026-02-27 02:47:32');
INSERT INTO `ticket_history` (`id`, `ticket_id`, `user_id`, `change_type`, `previous_field`, `new_field`, `description`, `changed_at`) VALUES (33, '366455ff-ebf2-4d57-918b-6cd8ab71aaa4', 5, 'UPDATE', 'Sin asignar', 'Maria IT two', 'assigned_technician cambiado de \"Sin asignar\" a \"Maria IT two\"', '2026-02-27 02:48:05');
INSERT INTO `ticket_history` (`id`, `ticket_id`, `user_id`, `change_type`, `previous_field`, `new_field`, `description`, `changed_at`) VALUES (34, '366455ff-ebf2-4d57-918b-6cd8ab71aaa4', 5, 'UPDATE', 'Abierto', 'Asignado', 'state cambiado de \"Abierto\" a \"Asignado\"', '2026-02-27 02:48:05');
INSERT INTO `ticket_history` (`id`, `ticket_id`, `user_id`, `change_type`, `previous_field`, `new_field`, `description`, `changed_at`) VALUES (35, '366455ff-ebf2-4d57-918b-6cd8ab71aaa4', 10, 'UPDATE', 'Asignado', 'En Proceso', 'Estado cambiado de \"Asignado\" a \"En Proceso\"', '2026-02-27 02:50:03');
INSERT INTO `ticket_history` (`id`, `ticket_id`, `user_id`, `change_type`, `previous_field`, `new_field`, `description`, `changed_at`) VALUES (36, '366455ff-ebf2-4d57-918b-6cd8ab71aaa4', 10, 'UPDATE', 'En Proceso', 'Resuelto', 'Estado cambiado de \"En Proceso\" a \"Resuelto\"', '2026-02-27 02:50:05');
INSERT INTO `ticket_history` (`id`, `ticket_id`, `user_id`, `change_type`, `previous_field`, `new_field`, `description`, `changed_at`) VALUES (37, 'caa36b2f-aed8-4bd7-9984-0862eb1e156f', 5, 'UPDATE', 'Sin asignar', 'Maria IT two', 'assigned_technician cambiado de \"Sin asignar\" a \"Maria IT two\"', '2026-02-27 02:52:52');
INSERT INTO `ticket_history` (`id`, `ticket_id`, `user_id`, `change_type`, `previous_field`, `new_field`, `description`, `changed_at`) VALUES (38, 'caa36b2f-aed8-4bd7-9984-0862eb1e156f', 5, 'UPDATE', 'Abierto', 'Asignado', 'state cambiado de \"Abierto\" a \"Asignado\"', '2026-02-27 02:52:52');
INSERT INTO `ticket_history` (`id`, `ticket_id`, `user_id`, `change_type`, `previous_field`, `new_field`, `description`, `changed_at`) VALUES (39, 'caa36b2f-aed8-4bd7-9984-0862eb1e156f', 10, 'UPDATE', 'Asignado', 'En Proceso', 'Estado cambiado de \"Asignado\" a \"En Proceso\"', '2026-02-27 02:53:32');
INSERT INTO `ticket_history` (`id`, `ticket_id`, `user_id`, `change_type`, `previous_field`, `new_field`, `description`, `changed_at`) VALUES (40, 'caa36b2f-aed8-4bd7-9984-0862eb1e156f', 10, 'UPDATE', 'En Proceso', 'Resuelto', 'Estado cambiado de \"En Proceso\" a \"Resuelto\"', '2026-02-27 02:54:42');
INSERT INTO `ticket_history` (`id`, `ticket_id`, `user_id`, `change_type`, `previous_field`, `new_field`, `description`, `changed_at`) VALUES (41, '438d5130-0b39-49c6-a745-78c6543e855f', 12, 'CREATION', NULL, NULL, 'Ticket creado', '2026-02-27 00:08:28');


-- --------------------------------------------------------
-- Estructura de tabla para `ticket_priorities`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `ticket_priorities`;
CREATE TABLE `ticket_priorities` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `level` int(11) NOT NULL,
  `color` varchar(20) NOT NULL,
  `description` text DEFAULT NULL,
  `active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`name`),
  UNIQUE KEY `nivel` (`level`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- --------------------------------------------------------
-- Datos de la tabla `ticket_priorities`
-- --------------------------------------------------------

INSERT INTO `ticket_priorities` (`id`, `name`, `level`, `color`, `description`, `active`, `created_at`, `updated_at`) VALUES (2, 'Media', 2, 'bg-yellow-100', 'Prioridad media, atención normal', 1, '2026-02-18 06:22:39', '2026-02-18 06:22:39');
INSERT INTO `ticket_priorities` (`id`, `name`, `level`, `color`, `description`, `active`, `created_at`, `updated_at`) VALUES (3, 'Alta', 3, 'bg-orange-100', 'Prioridad alta, requiere atención pronta', 1, '2026-02-18 06:22:39', '2026-02-18 06:22:39');
INSERT INTO `ticket_priorities` (`id`, `name`, `level`, `color`, `description`, `active`, `created_at`, `updated_at`) VALUES (4, 'Urgente', 4, 'bg-red-100', 'Prioridad urgente, requiere atención inmediata', 1, '2026-02-18 06:22:39', '2026-02-18 06:22:39');
INSERT INTO `ticket_priorities` (`id`, `name`, `level`, `color`, `description`, `active`, `created_at`, `updated_at`) VALUES (11, 'Baja', 1, 'bg-green-100', NULL, 1, '2026-02-18 06:42:38', '2026-02-18 06:42:38');


-- --------------------------------------------------------
-- Estructura de tabla para `ticket_states`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `ticket_states`;
CREATE TABLE `ticket_states` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `description` text DEFAULT NULL,
  `color` varchar(20) DEFAULT 'bg-gray-100',
  `order` int(11) DEFAULT 0,
  `active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- --------------------------------------------------------
-- Datos de la tabla `ticket_states`
-- --------------------------------------------------------

INSERT INTO `ticket_states` (`id`, `name`, `description`, `color`, `order`, `active`, `created_at`, `updated_at`) VALUES (1, 'Abierto', 'Ticket creado y pendiente de asignación', 'bg-green-400', 1, 1, '2026-02-18 06:22:39', '2026-02-18 07:27:48');
INSERT INTO `ticket_states` (`id`, `name`, `description`, `color`, `order`, `active`, `created_at`, `updated_at`) VALUES (2, 'Asignado', 'Ticket asignado a un técnico', 'bg-yellow-200', 2, 1, '2026-02-18 06:22:39', '2026-02-18 07:27:48');
INSERT INTO `ticket_states` (`id`, `name`, `description`, `color`, `order`, `active`, `created_at`, `updated_at`) VALUES (3, 'En Proceso', 'Técnico trabajando en la resolución', 'bg-orange-300', 3, 1, '2026-02-18 06:22:39', '2026-02-18 07:27:48');
INSERT INTO `ticket_states` (`id`, `name`, `description`, `color`, `order`, `active`, `created_at`, `updated_at`) VALUES (4, 'Resuelto', 'Ticket resuelto, pendiente de confirmación', 'bg-blue-100', 4, 1, '2026-02-18 06:22:39', '2026-02-18 07:27:48');
INSERT INTO `ticket_states` (`id`, `name`, `description`, `color`, `order`, `active`, `created_at`, `updated_at`) VALUES (5, 'Cerrado', 'Ticket cerrado definitivamente', 'bg-gray-100', 5, 1, '2026-02-18 06:22:39', '2026-02-18 06:22:39');


-- --------------------------------------------------------
-- Estructura de tabla para `tickets`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `tickets`;
CREATE TABLE `tickets` (
  `id` char(36) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `incident_area_id` int(11) DEFAULT NULL,
  `category_id` int(11) NOT NULL,
  `priority_id` int(11) NOT NULL,
  `state_id` int(11) NOT NULL DEFAULT 1,
  `created_by_user_id` int(11) NOT NULL,
  `assigned_technician_id` int(11) DEFAULT NULL,
  `image_url` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `closed_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_usuario_creador` (`created_by_user_id`),
  KEY `idx_tecnico_asignado` (`assigned_technician_id`),
  KEY `idx_estado` (`state_id`),
  KEY `idx_categoria` (`category_id`),
  KEY `idx_prioridad` (`priority_id`),
  KEY `idx_fecha_creacion` (`created_at`),
  KEY `idx_incident_area` (`incident_area_id`),
  CONSTRAINT `1` FOREIGN KEY (`category_id`) REFERENCES `ticket_categories` (`id`),
  CONSTRAINT `2` FOREIGN KEY (`priority_id`) REFERENCES `ticket_priorities` (`id`),
  CONSTRAINT `3` FOREIGN KEY (`state_id`) REFERENCES `ticket_states` (`id`),
  CONSTRAINT `4` FOREIGN KEY (`created_by_user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `5` FOREIGN KEY (`assigned_technician_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_ticket_incident_area` FOREIGN KEY (`incident_area_id`) REFERENCES `incident_areas` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- --------------------------------------------------------
-- Datos de la tabla `tickets`
-- --------------------------------------------------------

INSERT INTO `tickets` (`id`, `title`, `description`, `incident_area_id`, `category_id`, `priority_id`, `state_id`, `created_by_user_id`, `assigned_technician_id`, `image_url`, `created_at`, `updated_at`, `closed_at`) VALUES ('366455ff-ebf2-4d57-918b-6cd8ab71aaa4', 'Falla de Hardware 6', 'Un gran fallo de hardware', 5, 1, 4, 4, 14, 10, '[\"/uploads/tickets/ticket-1772144760737-929286019.png\"]', '2026-02-27 06:26:00', '2026-02-27 02:50:05', NULL);
INSERT INTO `tickets` (`id`, `title`, `description`, `incident_area_id`, `category_id`, `priority_id`, `state_id`, `created_by_user_id`, `assigned_technician_id`, `image_url`, `created_at`, `updated_at`, `closed_at`) VALUES ('39bcac38-d276-4910-ada6-dc2c4e1d32a0', 'Falla de red', 'La red se cayó de nuevo', 9, 3, 4, 4, 5, 5, '[\"/uploads/tickets/ticket-1771355360506-582526171.PNG\",\"/uploads/tickets/ticket-1771355360509-543711500.PNG\"]', '2026-02-18 07:09:20', '2026-02-22 06:19:40', NULL);
INSERT INTO `tickets` (`id`, `title`, `description`, `incident_area_id`, `category_id`, `priority_id`, `state_id`, `created_by_user_id`, `assigned_technician_id`, `image_url`, `created_at`, `updated_at`, `closed_at`) VALUES ('3ffaaf09-0af4-4cbb-aff5-396d6779d334', 'Falla de Hardware 2', 'Se metió un bug en el ordenador', 1, 7, 11, 5, 12, 10, '[\"/uploads/tickets/ticket-1771703345714-932043046.jpg\"]', '2026-02-22 07:49:05', '2026-02-22 08:00:56', '2026-02-22 08:00:56');
INSERT INTO `tickets` (`id`, `title`, `description`, `incident_area_id`, `category_id`, `priority_id`, `state_id`, `created_by_user_id`, `assigned_technician_id`, `image_url`, `created_at`, `updated_at`, `closed_at`) VALUES ('438d5130-0b39-49c6-a745-78c6543e855f', 'nuevo error', 'Oh no un error nuevo', 10, 4, 2, 1, 12, NULL, '[\"/uploads/tickets/ticket-1772150908868-751216195.png\"]', '2026-02-27 00:08:28', '2026-02-27 00:08:28', NULL);
INSERT INTO `tickets` (`id`, `title`, `description`, `incident_area_id`, `category_id`, `priority_id`, `state_id`, `created_by_user_id`, `assigned_technician_id`, `image_url`, `created_at`, `updated_at`, `closed_at`) VALUES ('5fd6b520-fcc0-44e6-8892-a5a3cfb6f14e', 'Falla de sistema', 'Ha fallado de manera estrepitosa.', 9, 2, 4, 1, 5, NULL, '/uploads/tickets/ticket-1771354246010-234137976.PNG', '2026-02-18 06:50:46', '2026-02-22 06:19:40', NULL);
INSERT INTO `tickets` (`id`, `title`, `description`, `incident_area_id`, `category_id`, `priority_id`, `state_id`, `created_by_user_id`, `assigned_technician_id`, `image_url`, `created_at`, `updated_at`, `closed_at`) VALUES ('79c1de31-1cc7-4be0-b487-60139b4329fe', 'Falla de red 3', 'Otra falla de red 3 otra', 2, 3, 4, 4, 12, 10, '[\"/uploads/tickets/ticket-1771699552163-284470268.jpg\",\"/uploads/tickets/ticket-1771699552165-567105812.jpg\"]', '2026-02-22 06:45:52', '2026-02-22 07:29:30', NULL);
INSERT INTO `tickets` (`id`, `title`, `description`, `incident_area_id`, `category_id`, `priority_id`, `state_id`, `created_by_user_id`, `assigned_technician_id`, `image_url`, `created_at`, `updated_at`, `closed_at`) VALUES ('7f9b37ae-d459-41e2-a23f-d12d24c69987', 'Falla de Hardware', 'La pc no quiere encender.', 10, 1, 2, 1, 5, NULL, '/uploads/tickets/ticket-1771355034025-376685395.PNG', '2026-02-18 07:03:54', '2026-02-22 06:19:40', NULL);
INSERT INTO `tickets` (`id`, `title`, `description`, `incident_area_id`, `category_id`, `priority_id`, `state_id`, `created_by_user_id`, `assigned_technician_id`, `image_url`, `created_at`, `updated_at`, `closed_at`) VALUES ('8d4e18e7-7928-4faa-9d42-7f842d70aacd', 'Falla ultra de red', 'mkvmdlkv fmfls mslmemdw', 10, 3, 2, 1, 12, NULL, '[\"/uploads/tickets/ticket-1772146052795-306146112.png\"]', '2026-02-27 02:47:32', '2026-02-27 02:47:32', NULL);
INSERT INTO `tickets` (`id`, `title`, `description`, `incident_area_id`, `category_id`, `priority_id`, `state_id`, `created_by_user_id`, `assigned_technician_id`, `image_url`, `created_at`, `updated_at`, `closed_at`) VALUES ('caa36b2f-aed8-4bd7-9984-0862eb1e156f', 'Falla de Hardware 6', 'ermrlf;e e;lfmer;l m;lem;gle', 10, 1, 3, 4, 12, 10, '[\"/uploads/tickets/ticket-1772144239792-704211027.png\"]', '2026-02-27 06:17:19', '2026-02-27 02:54:42', NULL);


-- --------------------------------------------------------
-- Estructura de tabla para `tool_types`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `tool_types`;
CREATE TABLE `tool_types` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  KEY `idx_name` (`name`),
  KEY `idx_active` (`active`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- --------------------------------------------------------
-- Datos de la tabla `tool_types`
-- --------------------------------------------------------

INSERT INTO `tool_types` (`id`, `name`, `description`, `active`, `created_at`, `updated_at`) VALUES (1, 'Hand Tool', 'Herramientas manuales como destornilladores, alicates, llaves, etc.', 1, '2026-02-26 23:43:09', '2026-02-26 23:43:09');
INSERT INTO `tool_types` (`id`, `name`, `description`, `active`, `created_at`, `updated_at`) VALUES (2, 'Cable', 'Cables de red, alimentación, HDMI, USB, etc.', 1, '2026-02-26 23:43:09', '2026-02-26 23:43:09');
INSERT INTO `tool_types` (`id`, `name`, `description`, `active`, `created_at`, `updated_at`) VALUES (3, 'Network', 'Herramientas de red como crimpadoras, probadores de cable, etc.', 1, '2026-02-26 23:43:09', '2026-02-26 23:43:09');
INSERT INTO `tool_types` (`id`, `name`, `description`, `active`, `created_at`, `updated_at`) VALUES (5, 'Other', 'Otro tipo de herramienta', 1, '2026-02-26 23:43:09', '2026-02-26 23:43:09');
INSERT INTO `tool_types` (`id`, `name`, `description`, `active`, `created_at`, `updated_at`) VALUES (6, 'Desarmado y Precisión', NULL, 1, '2026-02-26 23:46:23', '2026-02-26 23:46:23');


-- --------------------------------------------------------
-- Estructura de tabla para `tools`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `tools`;
CREATE TABLE `tools` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `code` varchar(100) DEFAULT NULL,
  `type_id` int(11) NOT NULL,
  `status` enum('available','assigned','maintenance','lost','retired') NOT NULL DEFAULT 'available',
  `tool_condition` enum('new','good','worn','broken') NOT NULL DEFAULT 'good',
  `location` varchar(255) DEFAULT NULL,
  `assigned_to_user_id` int(11) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  KEY `idx_status` (`status`),
  KEY `idx_type` (`type_id`),
  KEY `idx_assigned_user` (`assigned_to_user_id`),
  KEY `idx_active` (`active`),
  KEY `idx_code` (`code`),
  CONSTRAINT `1` FOREIGN KEY (`assigned_to_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `2` FOREIGN KEY (`type_id`) REFERENCES `tool_types` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- --------------------------------------------------------
-- Datos de la tabla `tools`
-- --------------------------------------------------------

INSERT INTO `tools` (`id`, `name`, `code`, `type_id`, `status`, `tool_condition`, `location`, `assigned_to_user_id`, `description`, `active`, `created_at`, `updated_at`) VALUES (1, 'Destornillador', 'i46i5565', 6, 'available', 'new', 'Oficita 2', NULL, NULL, 1, '2026-02-27 00:01:04', '2026-02-27 00:01:04');


-- --------------------------------------------------------
-- Estructura de tabla para `users`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `full_name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `department` varchar(100) DEFAULT NULL,
  `incident_area_id` int(11) DEFAULT NULL,
  `role_id` int(11) NOT NULL DEFAULT 3,
  `email_verified` tinyint(1) DEFAULT 0,
  `active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `security_question_1` varchar(255) DEFAULT NULL,
  `security_answer_1` varchar(255) DEFAULT NULL,
  `security_question_2` varchar(255) DEFAULT NULL,
  `security_answer_2` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_email` (`email`),
  KEY `idx_role` (`role_id`),
  KEY `idx_user_incident_area` (`incident_area_id`),
  CONSTRAINT `1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`),
  CONSTRAINT `fk_user_incident_area` FOREIGN KEY (`incident_area_id`) REFERENCES `incident_areas` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- --------------------------------------------------------
-- Datos de la tabla `users`
-- --------------------------------------------------------

INSERT INTO `users` (`id`, `full_name`, `email`, `password`, `phone`, `department`, `incident_area_id`, `role_id`, `email_verified`, `active`, `created_at`, `updated_at`, `security_question_1`, `security_answer_1`, `security_question_2`, `security_answer_2`) VALUES (5, 'Maria  Briceño R', 'mvbridev@gmail.com', '$2a$10$nA4810S5qBPYFE3Auw/tRu.ohfwBIGaRvhqQR1Pxi7vlH2oxZlNna', '4249312548', 'Secretaria', NULL, 1, 1, 1, '2026-02-10 06:12:04', '2026-02-21 04:13:13', NULL, NULL, NULL, NULL);
INSERT INTO `users` (`id`, `full_name`, `email`, `password`, `phone`, `department`, `incident_area_id`, `role_id`, `email_verified`, `active`, `created_at`, `updated_at`, `security_question_1`, `security_answer_1`, `security_question_2`, `security_answer_2`) VALUES (10, 'Maria IT two', 'mvbri10@gmail.com', '$2a$10$4pW0NlqFfp2CxPiR3UMRnOLBdyCJkqZ1VJfuwVVJ7GhtyAKNCVMfW', NULL, 'IT', NULL, 2, 1, 1, '2026-02-13 11:03:20', '2026-02-26 23:55:14', '¿Cuál es mi mascota?', '$2a$10$n5fHDup1vY.pDUggM4pzi.qiu28YQRMzwhOJrIbsYAytfZy8aWLmi', '¿En qué ciudad naciste?', '$2a$10$Q.LOMQYV.aDYKpeePDvpDO7Q36/1Rq1McJBdvhai3oGdZzsprjtge');
INSERT INTO `users` (`id`, `full_name`, `email`, `password`, `phone`, `department`, `incident_area_id`, `role_id`, `email_verified`, `active`, `created_at`, `updated_at`, `security_question_1`, `security_answer_1`, `security_question_2`, `security_answer_2`) VALUES (12, 'Maria Colaboradora', 'mvbri06@gmail.com', '$2a$10$p76V87iY39eZgvRWHvjeQ.3geyktYA19Wz7SiNcGL7m5v3ovgFaD6', '+58 4249312888', 'Oficina 2', 10, 3, 1, 1, '2026-02-21 04:11:42', '2026-02-27 06:13:58', NULL, NULL, NULL, NULL);
INSERT INTO `users` (`id`, `full_name`, `email`, `password`, `phone`, `department`, `incident_area_id`, `role_id`, `email_verified`, `active`, `created_at`, `updated_at`, `security_question_1`, `security_answer_1`, `security_question_2`, `security_answer_2`) VALUES (13, 'Alias', 'mvbri10+55@gmail.com', '$2a$10$IYIAgJvdclV9iY0U8jEhIuH0T360KDEH84Ioy.bDfjxq0UZdJImuO', NULL, 'IT', NULL, 3, 1, 1, '2026-02-22 08:14:39', '2026-02-24 07:45:08', NULL, NULL, NULL, NULL);
INSERT INTO `users` (`id`, `full_name`, `email`, `password`, `phone`, `department`, `incident_area_id`, `role_id`, `email_verified`, `active`, `created_at`, `updated_at`, `security_question_1`, `security_answer_1`, `security_question_2`, `security_answer_2`) VALUES (14, 'Juan', 'mvbri10+juan@gmail.com', '$2a$10$6nBVg.42bL7F6ddpgf9/8.AWO3Zr0KyaEpGa.LXrlmH5Tpxg8FY/i', NULL, 'Sala de Reuniones', 5, 3, 1, 1, '2026-02-27 06:22:39', '2026-02-27 02:34:41', 'cual es tu mascota favorita', '$2a$10$y7NPUXeM8/kV/63pK9aY6umioKK8I370H9Z7Bzx9ndvdEmEksMmMS', 'En que ciudad naciste', '$2a$10$OBHT2cyiJEipgEFHAWREeOn1qZOa2rTsUyBXdvMOyxr/czYItRTCu');
INSERT INTO `users` (`id`, `full_name`, `email`, `password`, `phone`, `department`, `incident_area_id`, `role_id`, `email_verified`, `active`, `created_at`, `updated_at`, `security_question_1`, `security_answer_1`, `security_question_2`, `security_answer_2`) VALUES (15, 'miley', 'mvbri10+miley@gmail.com', '$2a$10$ecfwyr4rVDlEgP1QeTgkruJuyHOCVKUf.iLI0CY51i34/gpE5Oqzm', NULL, NULL, NULL, 3, 1, 1, '2026-02-27 02:40:27', '2026-02-27 00:09:38', NULL, NULL, NULL, NULL);


-- --------------------------------------------------------
-- Estructura de tabla para `verification_tokens`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `verification_tokens`;
CREATE TABLE `verification_tokens` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `token` varchar(255) NOT NULL,
  `type` enum('email_verification','password_recovery') NOT NULL,
  `expires_at` timestamp NOT NULL,
  `used` tinyint(1) DEFAULT 0,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `token` (`token`),
  KEY `idx_token` (`token`),
  KEY `idx_user` (`user_id`),
  CONSTRAINT `1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=35 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- --------------------------------------------------------
-- Datos de la tabla `verification_tokens`
-- --------------------------------------------------------

INSERT INTO `verification_tokens` (`id`, `user_id`, `token`, `type`, `expires_at`, `used`, `created_at`) VALUES (5, 5, '523bdf5710cd2ff3542e937854a5532e3ad21c87c960665fe321c73e31cbcd15', 'email_verification', '2026-02-11 06:12:04', 1, '2026-02-10 06:12:04');
INSERT INTO `verification_tokens` (`id`, `user_id`, `token`, `type`, `expires_at`, `used`, `created_at`) VALUES (17, 5, '9cd9352ad23b0e45af12ed3ba537568a11f83431ade92f633ef29e319cdd0bbc', 'password_recovery', '2026-02-13 11:28:25', 1, '2026-02-13 10:28:25');
INSERT INTO `verification_tokens` (`id`, `user_id`, `token`, `type`, `expires_at`, `used`, `created_at`) VALUES (23, 10, 'b06e1bd42ab1474224619342319cd53668325cee009ff4339f2d7064cfdf8003', 'email_verification', '2026-02-14 11:04:19', 1, '2026-02-13 11:04:19');
INSERT INTO `verification_tokens` (`id`, `user_id`, `token`, `type`, `expires_at`, `used`, `created_at`) VALUES (28, 12, 'c7fd7b698d0f2c971bb34b7302d4844486a26855a6b03b6d4cee8e0cba668b74', 'email_verification', '2026-02-22 04:11:42', 1, '2026-02-21 04:11:42');
INSERT INTO `verification_tokens` (`id`, `user_id`, `token`, `type`, `expires_at`, `used`, `created_at`) VALUES (29, 13, '9364da7fd725c0cea6b39c66778a48421ebe2ff14eb8b8464e24b79bcaf1a021', 'email_verification', '2026-02-23 08:14:39', 1, '2026-02-22 08:14:39');
INSERT INTO `verification_tokens` (`id`, `user_id`, `token`, `type`, `expires_at`, `used`, `created_at`) VALUES (32, 14, '759e3d70fa310f4646d02fcade0a55158f03fcc4174404471b6ddd7a5535570e', 'password_recovery', '2026-02-27 07:23:51', 1, '2026-02-27 06:23:51');
INSERT INTO `verification_tokens` (`id`, `user_id`, `token`, `type`, `expires_at`, `used`, `created_at`) VALUES (33, 14, '93bdd453756f752bea2f7f1037236007bf8ec41b3e8e395740ad6b106fae7adc', 'email_verification', '2026-02-28 06:24:55', 1, '2026-02-27 06:24:55');
INSERT INTO `verification_tokens` (`id`, `user_id`, `token`, `type`, `expires_at`, `used`, `created_at`) VALUES (34, 10, '3e656e458b3d2f0b47b2198c5d00fd234565b82ad530d6ba68f79de9472439b0', 'password_recovery', '2026-02-27 00:54:52', 1, '2026-02-26 23:54:52');

SET FOREIGN_KEY_CHECKS = 1;
