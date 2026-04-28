-- Backup generado el 2026-04-28T16:00:17.166Z
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

INSERT INTO `consumable_types` (`id`, `name`, `description`, `active`, `created_at`, `updated_at`) VALUES (1, 'Paper', 'Resmas de papel, hojas sueltas, etc.', 1, '2026-02-25 18:58:54', '2026-02-25 18:58:54');
INSERT INTO `consumable_types` (`id`, `name`, `description`, `active`, `created_at`, `updated_at`) VALUES (2, 'Writing', 'Lápices, bolígrafos, marcadores, etc.', 1, '2026-02-25 18:58:54', '2026-02-25 18:58:54');
INSERT INTO `consumable_types` (`id`, `name`, `description`, `active`, `created_at`, `updated_at`) VALUES (3, 'Printing', 'Tóner, cartuchos de tinta, etc.', 1, '2026-02-25 18:58:54', '2026-02-25 18:58:54');
INSERT INTO `consumable_types` (`id`, `name`, `description`, `active`, `created_at`, `updated_at`) VALUES (4, 'Office', 'Otros consumibles de oficina', 1, '2026-02-25 18:58:54', '2026-02-25 18:58:54');
INSERT INTO `consumable_types` (`id`, `name`, `description`, `active`, `created_at`, `updated_at`) VALUES (5, 'Other', 'Otro tipo de consumible', 1, '2026-02-25 18:58:54', '2026-02-25 18:58:54');
INSERT INTO `consumable_types` (`id`, `name`, `description`, `active`, `created_at`, `updated_at`) VALUES (7, 'skin care', NULL, 1, '2026-02-25 19:16:28', '2026-02-25 19:16:28');


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
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- --------------------------------------------------------
-- Datos de la tabla `consumables`
-- --------------------------------------------------------

INSERT INTO `consumables` (`id`, `name`, `type_id`, `unit`, `quantity`, `minimum_quantity`, `status`, `location`, `description`, `active`, `created_at`, `updated_at`) VALUES (1, 'Boligrafos', 5, 'cajas', 2, 1, 'available', NULL, NULL, 1, '2026-02-25 19:01:50', '2026-02-25 19:09:25');


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
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- --------------------------------------------------------
-- Datos de la tabla `equipment`
-- --------------------------------------------------------

INSERT INTO `equipment` (`id`, `name`, `brand`, `model`, `serial_number`, `type_id`, `type`, `status`, `location`, `assigned_to_user_id`, `description`, `purchase_date`, `warranty_expires_at`, `active`, `created_at`, `updated_at`) VALUES (1, 'Laptop', 'Lenovo', '8021', 'xe1000', 12, 'laptop', 'retired', 'Venezuela', NULL, '', '2026-02-24 04:00:00', '2026-02-24 04:00:00', 0, '2026-02-24 23:47:24', '2026-02-25 01:14:44');
INSERT INTO `equipment` (`id`, `name`, `brand`, `model`, `serial_number`, `type_id`, `type`, `status`, `location`, `assigned_to_user_id`, `description`, `purchase_date`, `warranty_expires_at`, `active`, `created_at`, `updated_at`) VALUES (2, 'Harina Pan', NULL, '8020', NULL, 1, 'other', 'available', NULL, NULL, NULL, '2026-02-24 04:00:00', NULL, 0, '2026-02-25 01:14:47', '2026-02-25 18:01:03');
INSERT INTO `equipment` (`id`, `name`, `brand`, `model`, `serial_number`, `type_id`, `type`, `status`, `location`, `assigned_to_user_id`, `description`, `purchase_date`, `warranty_expires_at`, `active`, `created_at`, `updated_at`) VALUES (3, 'Laptop-DEV-01', 'Apple', 'MacBook Pro M3 Max 14\"', 'GCFX12345679', 2, 'other', 'available', NULL, NULL, NULL, '2026-02-25 04:00:00', '2026-03-31 04:00:00', 1, '2026-02-25 18:15:29', '2026-04-28 15:21:40');


-- --------------------------------------------------------
-- Estructura de tabla para `equipment_loan_checklists`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `equipment_loan_checklists`;
CREATE TABLE `equipment_loan_checklists` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `loan_item_id` int(11) NOT NULL,
  `checklist_type` enum('delivery','return') NOT NULL,
  `battery_level` tinyint(4) DEFAULT NULL,
  `physical_condition` enum('new','good','worn','damaged') NOT NULL DEFAULT 'good',
  `accessories` text DEFAULT NULL,
  `observations` text DEFAULT NULL,
  `created_by_user_id` int(11) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `created_by_user_id` (`created_by_user_id`),
  KEY `idx_equipment_loan_checklists_item` (`loan_item_id`),
  KEY `idx_equipment_loan_checklists_type` (`checklist_type`),
  CONSTRAINT `1` FOREIGN KEY (`loan_item_id`) REFERENCES `equipment_loan_items` (`id`) ON DELETE CASCADE,
  CONSTRAINT `2` FOREIGN KEY (`created_by_user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `chk_equipment_loan_checklists_battery` CHECK (`battery_level` is null or `battery_level` >= 0 and `battery_level` <= 100)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- --------------------------------------------------------
-- Datos de la tabla `equipment_loan_checklists`
-- --------------------------------------------------------

INSERT INTO `equipment_loan_checklists` (`id`, `loan_item_id`, `checklist_type`, `battery_level`, `physical_condition`, `accessories`, `observations`, `created_by_user_id`, `created_at`) VALUES (1, 1, 'delivery', NULL, 'good', NULL, NULL, 5, '2026-04-28 14:28:33');
INSERT INTO `equipment_loan_checklists` (`id`, `loan_item_id`, `checklist_type`, `battery_level`, `physical_condition`, `accessories`, `observations`, `created_by_user_id`, `created_at`) VALUES (2, 1, 'return', NULL, 'good', NULL, NULL, 5, '2026-04-28 14:29:38');
INSERT INTO `equipment_loan_checklists` (`id`, `loan_item_id`, `checklist_type`, `battery_level`, `physical_condition`, `accessories`, `observations`, `created_by_user_id`, `created_at`) VALUES (3, 2, 'delivery', NULL, 'good', NULL, NULL, 5, '2026-04-28 14:49:33');
INSERT INTO `equipment_loan_checklists` (`id`, `loan_item_id`, `checklist_type`, `battery_level`, `physical_condition`, `accessories`, `observations`, `created_by_user_id`, `created_at`) VALUES (4, 2, 'return', NULL, 'good', NULL, NULL, 5, '2026-04-28 14:49:38');
INSERT INTO `equipment_loan_checklists` (`id`, `loan_item_id`, `checklist_type`, `battery_level`, `physical_condition`, `accessories`, `observations`, `created_by_user_id`, `created_at`) VALUES (5, 3, 'delivery', NULL, 'good', NULL, NULL, 5, '2026-04-28 14:50:34');
INSERT INTO `equipment_loan_checklists` (`id`, `loan_item_id`, `checklist_type`, `battery_level`, `physical_condition`, `accessories`, `observations`, `created_by_user_id`, `created_at`) VALUES (6, 3, 'return', NULL, 'good', NULL, NULL, 5, '2026-04-28 14:52:17');
INSERT INTO `equipment_loan_checklists` (`id`, `loan_item_id`, `checklist_type`, `battery_level`, `physical_condition`, `accessories`, `observations`, `created_by_user_id`, `created_at`) VALUES (7, 4, 'delivery', NULL, 'good', NULL, NULL, 5, '2026-04-28 14:53:18');
INSERT INTO `equipment_loan_checklists` (`id`, `loan_item_id`, `checklist_type`, `battery_level`, `physical_condition`, `accessories`, `observations`, `created_by_user_id`, `created_at`) VALUES (8, 4, 'return', NULL, 'good', NULL, NULL, 5, '2026-04-28 14:53:24');
INSERT INTO `equipment_loan_checklists` (`id`, `loan_item_id`, `checklist_type`, `battery_level`, `physical_condition`, `accessories`, `observations`, `created_by_user_id`, `created_at`) VALUES (9, 5, 'delivery', NULL, 'good', NULL, NULL, 5, '2026-04-28 15:21:35');
INSERT INTO `equipment_loan_checklists` (`id`, `loan_item_id`, `checklist_type`, `battery_level`, `physical_condition`, `accessories`, `observations`, `created_by_user_id`, `created_at`) VALUES (10, 5, 'return', NULL, 'good', NULL, NULL, 5, '2026-04-28 15:21:40');


-- --------------------------------------------------------
-- Estructura de tabla para `equipment_loan_history`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `equipment_loan_history`;
CREATE TABLE `equipment_loan_history` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `loan_id` int(11) NOT NULL,
  `changed_by_user_id` int(11) NOT NULL,
  `previous_status` enum('pending','approved','delivered','returned','rejected','overdue','cancelled') DEFAULT NULL,
  `new_status` enum('pending','approved','delivered','returned','rejected','overdue','cancelled') NOT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `changed_by_user_id` (`changed_by_user_id`),
  KEY `idx_equipment_loan_history_loan` (`loan_id`),
  KEY `idx_equipment_loan_history_status` (`new_status`),
  CONSTRAINT `1` FOREIGN KEY (`loan_id`) REFERENCES `equipment_loans` (`id`) ON DELETE CASCADE,
  CONSTRAINT `2` FOREIGN KEY (`changed_by_user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=38 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- --------------------------------------------------------
-- Datos de la tabla `equipment_loan_history`
-- --------------------------------------------------------

INSERT INTO `equipment_loan_history` (`id`, `loan_id`, `changed_by_user_id`, `previous_status`, `new_status`, `notes`, `created_at`) VALUES (1, 1, 5, NULL, 'pending', 'Solicitud creada', '2026-04-28 14:12:12');
INSERT INTO `equipment_loan_history` (`id`, `loan_id`, `changed_by_user_id`, `previous_status`, `new_status`, `notes`, `created_at`) VALUES (2, 1, 5, 'pending', 'approved', 'Préstamo aprobado por IT', '2026-04-28 14:27:54');
INSERT INTO `equipment_loan_history` (`id`, `loan_id`, `changed_by_user_id`, `previous_status`, `new_status`, `notes`, `created_at`) VALUES (3, 1, 5, 'approved', 'delivered', 'Entrega registrada', '2026-04-28 14:28:33');
INSERT INTO `equipment_loan_history` (`id`, `loan_id`, `changed_by_user_id`, `previous_status`, `new_status`, `notes`, `created_at`) VALUES (4, 1, 5, 'delivered', 'returned', 'Devolución registrada', '2026-04-28 14:29:38');
INSERT INTO `equipment_loan_history` (`id`, `loan_id`, `changed_by_user_id`, `previous_status`, `new_status`, `notes`, `created_at`) VALUES (5, 2, 5, NULL, 'pending', 'Solicitud creada', '2026-04-28 14:36:30');
INSERT INTO `equipment_loan_history` (`id`, `loan_id`, `changed_by_user_id`, `previous_status`, `new_status`, `notes`, `created_at`) VALUES (6, 2, 5, 'pending', 'approved', 'Préstamo aprobado por IT', '2026-04-28 14:47:44');
INSERT INTO `equipment_loan_history` (`id`, `loan_id`, `changed_by_user_id`, `previous_status`, `new_status`, `notes`, `created_at`) VALUES (7, 2, 5, 'approved', 'delivered', 'Entrega registrada', '2026-04-28 14:49:33');
INSERT INTO `equipment_loan_history` (`id`, `loan_id`, `changed_by_user_id`, `previous_status`, `new_status`, `notes`, `created_at`) VALUES (8, 2, 5, 'delivered', 'returned', 'Devolución registrada', '2026-04-28 14:49:38');
INSERT INTO `equipment_loan_history` (`id`, `loan_id`, `changed_by_user_id`, `previous_status`, `new_status`, `notes`, `created_at`) VALUES (9, 3, 5, NULL, 'pending', 'Solicitud creada', '2026-04-28 14:50:22');
INSERT INTO `equipment_loan_history` (`id`, `loan_id`, `changed_by_user_id`, `previous_status`, `new_status`, `notes`, `created_at`) VALUES (10, 3, 5, 'pending', 'approved', 'Préstamo aprobado por IT', '2026-04-28 14:50:30');
INSERT INTO `equipment_loan_history` (`id`, `loan_id`, `changed_by_user_id`, `previous_status`, `new_status`, `notes`, `created_at`) VALUES (11, 3, 5, 'approved', 'delivered', 'Entrega registrada', '2026-04-28 14:50:34');
INSERT INTO `equipment_loan_history` (`id`, `loan_id`, `changed_by_user_id`, `previous_status`, `new_status`, `notes`, `created_at`) VALUES (12, 3, 5, 'delivered', 'returned', 'Devolución registrada', '2026-04-28 14:52:17');
INSERT INTO `equipment_loan_history` (`id`, `loan_id`, `changed_by_user_id`, `previous_status`, `new_status`, `notes`, `created_at`) VALUES (13, 4, 5, NULL, 'pending', 'Solicitud creada', '2026-04-28 14:52:56');
INSERT INTO `equipment_loan_history` (`id`, `loan_id`, `changed_by_user_id`, `previous_status`, `new_status`, `notes`, `created_at`) VALUES (14, 4, 5, 'pending', 'approved', 'Préstamo aprobado por IT', '2026-04-28 14:53:10');
INSERT INTO `equipment_loan_history` (`id`, `loan_id`, `changed_by_user_id`, `previous_status`, `new_status`, `notes`, `created_at`) VALUES (15, 4, 5, 'approved', 'delivered', 'Entrega registrada', '2026-04-28 14:53:18');
INSERT INTO `equipment_loan_history` (`id`, `loan_id`, `changed_by_user_id`, `previous_status`, `new_status`, `notes`, `created_at`) VALUES (16, 4, 5, 'delivered', 'returned', 'Devolución registrada', '2026-04-28 14:53:24');
INSERT INTO `equipment_loan_history` (`id`, `loan_id`, `changed_by_user_id`, `previous_status`, `new_status`, `notes`, `created_at`) VALUES (17, 5, 5, NULL, 'pending', 'Solicitud creada', '2026-04-28 14:54:32');
INSERT INTO `equipment_loan_history` (`id`, `loan_id`, `changed_by_user_id`, `previous_status`, `new_status`, `notes`, `created_at`) VALUES (18, 6, 5, NULL, 'pending', 'Solicitud creada', '2026-04-28 14:56:14');
INSERT INTO `equipment_loan_history` (`id`, `loan_id`, `changed_by_user_id`, `previous_status`, `new_status`, `notes`, `created_at`) VALUES (19, 5, 5, 'pending', 'approved', 'Préstamo aprobado por IT', '2026-04-28 14:56:28');
INSERT INTO `equipment_loan_history` (`id`, `loan_id`, `changed_by_user_id`, `previous_status`, `new_status`, `notes`, `created_at`) VALUES (22, 6, 5, 'pending', 'rejected', 'Rechazado por revisión administrativa', '2026-04-28 15:03:51');
INSERT INTO `equipment_loan_history` (`id`, `loan_id`, `changed_by_user_id`, `previous_status`, `new_status`, `notes`, `created_at`) VALUES (23, 5, 5, 'approved', 'delivered', 'Entrega registrada', '2026-04-28 15:21:35');
INSERT INTO `equipment_loan_history` (`id`, `loan_id`, `changed_by_user_id`, `previous_status`, `new_status`, `notes`, `created_at`) VALUES (24, 5, 5, 'delivered', 'returned', 'Devolución registrada', '2026-04-28 15:21:40');
INSERT INTO `equipment_loan_history` (`id`, `loan_id`, `changed_by_user_id`, `previous_status`, `new_status`, `notes`, `created_at`) VALUES (25, 27, 5, NULL, 'pending', 'Solicitud creada', '2026-04-28 15:22:01');
INSERT INTO `equipment_loan_history` (`id`, `loan_id`, `changed_by_user_id`, `previous_status`, `new_status`, `notes`, `created_at`) VALUES (26, 27, 5, 'pending', 'rejected', 'Rechazado por revisión administrativa', '2026-04-28 15:22:09');
INSERT INTO `equipment_loan_history` (`id`, `loan_id`, `changed_by_user_id`, `previous_status`, `new_status`, `notes`, `created_at`) VALUES (27, 28, 5, NULL, 'pending', 'Solicitud creada', '2026-04-28 15:22:23');
INSERT INTO `equipment_loan_history` (`id`, `loan_id`, `changed_by_user_id`, `previous_status`, `new_status`, `notes`, `created_at`) VALUES (28, 28, 5, 'pending', 'rejected', 'Rechazado por revisión administrativa', '2026-04-28 15:24:04');
INSERT INTO `equipment_loan_history` (`id`, `loan_id`, `changed_by_user_id`, `previous_status`, `new_status`, `notes`, `created_at`) VALUES (29, 29, 5, NULL, 'pending', 'Solicitud creada', '2026-04-28 15:24:34');
INSERT INTO `equipment_loan_history` (`id`, `loan_id`, `changed_by_user_id`, `previous_status`, `new_status`, `notes`, `created_at`) VALUES (30, 29, 5, 'pending', 'rejected', 'Rechazado por revisión administrativa', '2026-04-28 15:24:42');
INSERT INTO `equipment_loan_history` (`id`, `loan_id`, `changed_by_user_id`, `previous_status`, `new_status`, `notes`, `created_at`) VALUES (31, 30, 12, NULL, 'pending', 'Solicitud creada', '2026-04-28 15:29:30');
INSERT INTO `equipment_loan_history` (`id`, `loan_id`, `changed_by_user_id`, `previous_status`, `new_status`, `notes`, `created_at`) VALUES (32, 30, 12, 'pending', 'pending', 'Checklist de solicitud pendiente actualizado', '2026-04-28 15:32:57');
INSERT INTO `equipment_loan_history` (`id`, `loan_id`, `changed_by_user_id`, `previous_status`, `new_status`, `notes`, `created_at`) VALUES (33, 30, 12, 'pending', 'cancelled', 'Cancelado por solicitante', '2026-04-28 15:34:02');
INSERT INTO `equipment_loan_history` (`id`, `loan_id`, `changed_by_user_id`, `previous_status`, `new_status`, `notes`, `created_at`) VALUES (34, 31, 12, NULL, 'pending', 'Solicitud creada', '2026-04-28 15:35:54');
INSERT INTO `equipment_loan_history` (`id`, `loan_id`, `changed_by_user_id`, `previous_status`, `new_status`, `notes`, `created_at`) VALUES (35, 31, 5, 'pending', 'rejected', 'no procede no se justifica', '2026-04-28 15:38:31');
INSERT INTO `equipment_loan_history` (`id`, `loan_id`, `changed_by_user_id`, `previous_status`, `new_status`, `notes`, `created_at`) VALUES (36, 32, 10, NULL, 'pending', 'Solicitud creada', '2026-04-28 15:55:37');
INSERT INTO `equipment_loan_history` (`id`, `loan_id`, `changed_by_user_id`, `previous_status`, `new_status`, `notes`, `created_at`) VALUES (37, 32, 10, 'pending', 'pending', 'Checklist de solicitud pendiente actualizado', '2026-04-28 15:56:46');


-- --------------------------------------------------------
-- Estructura de tabla para `equipment_loan_incidents`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `equipment_loan_incidents`;
CREATE TABLE `equipment_loan_incidents` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `loan_item_id` int(11) NOT NULL,
  `incident_type` enum('damage','loss','missing_accessory','other') NOT NULL,
  `description` text NOT NULL,
  `estimated_cost` decimal(10,2) DEFAULT NULL,
  `reported_by_user_id` int(11) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `reported_by_user_id` (`reported_by_user_id`),
  KEY `idx_equipment_loan_incidents_item` (`loan_item_id`),
  KEY `idx_equipment_loan_incidents_type` (`incident_type`),
  CONSTRAINT `1` FOREIGN KEY (`loan_item_id`) REFERENCES `equipment_loan_items` (`id`) ON DELETE CASCADE,
  CONSTRAINT `2` FOREIGN KEY (`reported_by_user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;


-- --------------------------------------------------------
-- Estructura de tabla para `equipment_loan_items`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `equipment_loan_items`;
CREATE TABLE `equipment_loan_items` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `loan_id` int(11) NOT NULL,
  `equipment_id` int(11) DEFAULT NULL,
  `pool_id` int(11) DEFAULT NULL,
  `quantity` int(11) NOT NULL DEFAULT 1,
  `active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_equipment_loan_items_loan` (`loan_id`),
  KEY `idx_equipment_loan_items_equipment` (`equipment_id`),
  KEY `idx_equipment_loan_items_pool` (`pool_id`),
  KEY `idx_equipment_loan_items_active` (`active`),
  CONSTRAINT `1` FOREIGN KEY (`loan_id`) REFERENCES `equipment_loans` (`id`) ON DELETE CASCADE,
  CONSTRAINT `2` FOREIGN KEY (`equipment_id`) REFERENCES `equipment` (`id`),
  CONSTRAINT `3` FOREIGN KEY (`pool_id`) REFERENCES `equipment_pools` (`id`),
  CONSTRAINT `chk_equipment_loan_items_quantity` CHECK (`quantity` > 0),
  CONSTRAINT `chk_equipment_loan_items_target` CHECK (`equipment_id` is not null and `pool_id` is null or `equipment_id` is null and `pool_id` is not null)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- --------------------------------------------------------
-- Datos de la tabla `equipment_loan_items`
-- --------------------------------------------------------

INSERT INTO `equipment_loan_items` (`id`, `loan_id`, `equipment_id`, `pool_id`, `quantity`, `active`, `created_at`, `updated_at`) VALUES (1, 1, 3, NULL, 1, 1, '2026-04-28 14:12:12', '2026-04-28 14:12:12');
INSERT INTO `equipment_loan_items` (`id`, `loan_id`, `equipment_id`, `pool_id`, `quantity`, `active`, `created_at`, `updated_at`) VALUES (2, 2, 3, NULL, 1, 1, '2026-04-28 14:36:30', '2026-04-28 14:36:30');
INSERT INTO `equipment_loan_items` (`id`, `loan_id`, `equipment_id`, `pool_id`, `quantity`, `active`, `created_at`, `updated_at`) VALUES (3, 3, 3, NULL, 1, 1, '2026-04-28 14:50:22', '2026-04-28 14:50:22');
INSERT INTO `equipment_loan_items` (`id`, `loan_id`, `equipment_id`, `pool_id`, `quantity`, `active`, `created_at`, `updated_at`) VALUES (4, 4, 3, NULL, 1, 1, '2026-04-28 14:52:56', '2026-04-28 14:52:56');
INSERT INTO `equipment_loan_items` (`id`, `loan_id`, `equipment_id`, `pool_id`, `quantity`, `active`, `created_at`, `updated_at`) VALUES (5, 5, 3, NULL, 1, 1, '2026-04-28 14:54:32', '2026-04-28 14:54:32');
INSERT INTO `equipment_loan_items` (`id`, `loan_id`, `equipment_id`, `pool_id`, `quantity`, `active`, `created_at`, `updated_at`) VALUES (6, 6, 3, NULL, 1, 1, '2026-04-28 14:56:14', '2026-04-28 14:56:14');
INSERT INTO `equipment_loan_items` (`id`, `loan_id`, `equipment_id`, `pool_id`, `quantity`, `active`, `created_at`, `updated_at`) VALUES (7, 27, 3, NULL, 1, 1, '2026-04-28 15:22:01', '2026-04-28 15:22:01');
INSERT INTO `equipment_loan_items` (`id`, `loan_id`, `equipment_id`, `pool_id`, `quantity`, `active`, `created_at`, `updated_at`) VALUES (8, 28, 3, NULL, 1, 1, '2026-04-28 15:22:23', '2026-04-28 15:22:23');
INSERT INTO `equipment_loan_items` (`id`, `loan_id`, `equipment_id`, `pool_id`, `quantity`, `active`, `created_at`, `updated_at`) VALUES (9, 29, 3, NULL, 1, 1, '2026-04-28 15:24:34', '2026-04-28 15:24:34');
INSERT INTO `equipment_loan_items` (`id`, `loan_id`, `equipment_id`, `pool_id`, `quantity`, `active`, `created_at`, `updated_at`) VALUES (10, 30, 3, NULL, 1, 1, '2026-04-28 15:29:30', '2026-04-28 15:29:30');
INSERT INTO `equipment_loan_items` (`id`, `loan_id`, `equipment_id`, `pool_id`, `quantity`, `active`, `created_at`, `updated_at`) VALUES (11, 31, 3, NULL, 1, 1, '2026-04-28 15:35:54', '2026-04-28 15:35:54');
INSERT INTO `equipment_loan_items` (`id`, `loan_id`, `equipment_id`, `pool_id`, `quantity`, `active`, `created_at`, `updated_at`) VALUES (12, 32, 3, NULL, 1, 1, '2026-04-28 15:55:37', '2026-04-28 15:55:37');


-- --------------------------------------------------------
-- Estructura de tabla para `equipment_loans`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `equipment_loans`;
CREATE TABLE `equipment_loans` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `requester_user_id` int(11) NOT NULL,
  `target_incident_area_id` int(11) DEFAULT NULL,
  `approved_by_user_id` int(11) DEFAULT NULL,
  `delivered_by_user_id` int(11) DEFAULT NULL,
  `returned_by_user_id` int(11) DEFAULT NULL,
  `status` enum('pending','approved','delivered','returned','rejected','overdue','cancelled') NOT NULL DEFAULT 'pending',
  `request_notes` text DEFAULT NULL,
  `pending_physical_condition` enum('new','good','worn','damaged') DEFAULT NULL,
  `pending_battery_level` tinyint(4) DEFAULT NULL,
  `pending_observations` text DEFAULT NULL,
  `approval_notes` text DEFAULT NULL,
  `rejection_reason` text DEFAULT NULL,
  `start_date` date NOT NULL,
  `expected_return_date` date NOT NULL,
  `delivered_at` datetime DEFAULT NULL,
  `returned_at` datetime DEFAULT NULL,
  `active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `approved_by_user_id` (`approved_by_user_id`),
  KEY `delivered_by_user_id` (`delivered_by_user_id`),
  KEY `returned_by_user_id` (`returned_by_user_id`),
  KEY `idx_equipment_loans_status` (`status`),
  KEY `idx_equipment_loans_requester` (`requester_user_id`),
  KEY `idx_equipment_loans_dates` (`start_date`,`expected_return_date`),
  KEY `idx_equipment_loans_active` (`active`),
  KEY `idx_equipment_loans_target_incident_area` (`target_incident_area_id`),
  CONSTRAINT `1` FOREIGN KEY (`requester_user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `2` FOREIGN KEY (`approved_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `3` FOREIGN KEY (`delivered_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `4` FOREIGN KEY (`returned_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_equipment_loans_target_incident_area` FOREIGN KEY (`target_incident_area_id`) REFERENCES `incident_areas` (`id`) ON DELETE SET NULL,
  CONSTRAINT `chk_equipment_loans_dates` CHECK (`expected_return_date` >= `start_date`),
  CONSTRAINT `chk_equipment_loans_pending_battery` CHECK (`pending_battery_level` is null or `pending_battery_level` >= 0 and `pending_battery_level` <= 100)
) ENGINE=InnoDB AUTO_INCREMENT=33 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- --------------------------------------------------------
-- Datos de la tabla `equipment_loans`
-- --------------------------------------------------------

INSERT INTO `equipment_loans` (`id`, `requester_user_id`, `target_incident_area_id`, `approved_by_user_id`, `delivered_by_user_id`, `returned_by_user_id`, `status`, `request_notes`, `pending_physical_condition`, `pending_battery_level`, `pending_observations`, `approval_notes`, `rejection_reason`, `start_date`, `expected_return_date`, `delivered_at`, `returned_at`, `active`, `created_at`, `updated_at`) VALUES (1, 5, NULL, 5, 5, 5, 'returned', 'onbording', NULL, NULL, NULL, NULL, NULL, '2026-04-02 04:00:00', '2026-04-30 04:00:00', '2026-04-28 14:28:33', '2026-04-28 14:29:38', 1, '2026-04-28 14:12:12', '2026-04-28 14:29:38');
INSERT INTO `equipment_loans` (`id`, `requester_user_id`, `target_incident_area_id`, `approved_by_user_id`, `delivered_by_user_id`, `returned_by_user_id`, `status`, `request_notes`, `pending_physical_condition`, `pending_battery_level`, `pending_observations`, `approval_notes`, `rejection_reason`, `start_date`, `expected_return_date`, `delivered_at`, `returned_at`, `active`, `created_at`, `updated_at`) VALUES (2, 5, NULL, 5, 5, 5, 'returned', NULL, NULL, NULL, NULL, NULL, NULL, '2026-04-03 04:00:00', '2026-04-24 04:00:00', '2026-04-28 14:49:33', '2026-04-28 14:49:38', 1, '2026-04-28 14:36:30', '2026-04-28 14:49:38');
INSERT INTO `equipment_loans` (`id`, `requester_user_id`, `target_incident_area_id`, `approved_by_user_id`, `delivered_by_user_id`, `returned_by_user_id`, `status`, `request_notes`, `pending_physical_condition`, `pending_battery_level`, `pending_observations`, `approval_notes`, `rejection_reason`, `start_date`, `expected_return_date`, `delivered_at`, `returned_at`, `active`, `created_at`, `updated_at`) VALUES (3, 5, NULL, 5, 5, 5, 'returned', 'okey', NULL, NULL, NULL, NULL, NULL, '2026-04-16 04:00:00', '2026-04-23 04:00:00', '2026-04-28 14:50:34', '2026-04-28 14:52:17', 1, '2026-04-28 14:50:22', '2026-04-28 14:52:17');
INSERT INTO `equipment_loans` (`id`, `requester_user_id`, `target_incident_area_id`, `approved_by_user_id`, `delivered_by_user_id`, `returned_by_user_id`, `status`, `request_notes`, `pending_physical_condition`, `pending_battery_level`, `pending_observations`, `approval_notes`, `rejection_reason`, `start_date`, `expected_return_date`, `delivered_at`, `returned_at`, `active`, `created_at`, `updated_at`) VALUES (4, 5, NULL, 5, 5, 5, 'returned', 'okey', NULL, NULL, NULL, NULL, NULL, '2026-04-16 04:00:00', '2026-04-30 04:00:00', '2026-04-28 14:53:18', '2026-04-28 14:53:24', 1, '2026-04-28 14:52:56', '2026-04-28 14:53:24');
INSERT INTO `equipment_loans` (`id`, `requester_user_id`, `target_incident_area_id`, `approved_by_user_id`, `delivered_by_user_id`, `returned_by_user_id`, `status`, `request_notes`, `pending_physical_condition`, `pending_battery_level`, `pending_observations`, `approval_notes`, `rejection_reason`, `start_date`, `expected_return_date`, `delivered_at`, `returned_at`, `active`, `created_at`, `updated_at`) VALUES (5, 5, NULL, 5, 5, 5, 'returned', NULL, NULL, NULL, NULL, NULL, NULL, '2026-04-29 04:00:00', '2026-06-18 04:00:00', '2026-04-28 15:21:35', '2026-04-28 15:21:40', 1, '2026-04-28 14:54:32', '2026-04-28 15:21:40');
INSERT INTO `equipment_loans` (`id`, `requester_user_id`, `target_incident_area_id`, `approved_by_user_id`, `delivered_by_user_id`, `returned_by_user_id`, `status`, `request_notes`, `pending_physical_condition`, `pending_battery_level`, `pending_observations`, `approval_notes`, `rejection_reason`, `start_date`, `expected_return_date`, `delivered_at`, `returned_at`, `active`, `created_at`, `updated_at`) VALUES (6, 5, NULL, NULL, NULL, NULL, 'rejected', NULL, NULL, NULL, NULL, NULL, 'Rechazado por revisión administrativa', '2026-04-18 04:00:00', '2026-04-25 04:00:00', NULL, NULL, 1, '2026-04-28 14:56:14', '2026-04-28 15:03:51');
INSERT INTO `equipment_loans` (`id`, `requester_user_id`, `target_incident_area_id`, `approved_by_user_id`, `delivered_by_user_id`, `returned_by_user_id`, `status`, `request_notes`, `pending_physical_condition`, `pending_battery_level`, `pending_observations`, `approval_notes`, `rejection_reason`, `start_date`, `expected_return_date`, `delivered_at`, `returned_at`, `active`, `created_at`, `updated_at`) VALUES (27, 5, 4, NULL, NULL, NULL, 'rejected', NULL, NULL, NULL, NULL, NULL, 'Rechazado por revisión administrativa', '2026-04-30 04:00:00', '2026-05-09 04:00:00', NULL, NULL, 1, '2026-04-28 15:22:01', '2026-04-28 15:22:09');
INSERT INTO `equipment_loans` (`id`, `requester_user_id`, `target_incident_area_id`, `approved_by_user_id`, `delivered_by_user_id`, `returned_by_user_id`, `status`, `request_notes`, `pending_physical_condition`, `pending_battery_level`, `pending_observations`, `approval_notes`, `rejection_reason`, `start_date`, `expected_return_date`, `delivered_at`, `returned_at`, `active`, `created_at`, `updated_at`) VALUES (28, 5, 18, NULL, NULL, NULL, 'rejected', NULL, NULL, NULL, NULL, NULL, 'Rechazado por revisión administrativa', '2026-04-18 04:00:00', '2026-05-09 04:00:00', NULL, NULL, 1, '2026-04-28 15:22:23', '2026-04-28 15:24:04');
INSERT INTO `equipment_loans` (`id`, `requester_user_id`, `target_incident_area_id`, `approved_by_user_id`, `delivered_by_user_id`, `returned_by_user_id`, `status`, `request_notes`, `pending_physical_condition`, `pending_battery_level`, `pending_observations`, `approval_notes`, `rejection_reason`, `start_date`, `expected_return_date`, `delivered_at`, `returned_at`, `active`, `created_at`, `updated_at`) VALUES (29, 5, 8, NULL, NULL, NULL, 'rejected', NULL, NULL, NULL, NULL, NULL, 'Rechazado por revisión administrativa', '2026-04-30 04:00:00', '2026-05-09 04:00:00', NULL, NULL, 1, '2026-04-28 15:24:34', '2026-04-28 15:24:42');
INSERT INTO `equipment_loans` (`id`, `requester_user_id`, `target_incident_area_id`, `approved_by_user_id`, `delivered_by_user_id`, `returned_by_user_id`, `status`, `request_notes`, `pending_physical_condition`, `pending_battery_level`, `pending_observations`, `approval_notes`, `rejection_reason`, `start_date`, `expected_return_date`, `delivered_at`, `returned_at`, `active`, `created_at`, `updated_at`) VALUES (30, 12, 18, NULL, NULL, NULL, 'cancelled', NULL, 'good', 85, NULL, NULL, NULL, '2026-04-30 04:00:00', '2026-05-08 04:00:00', NULL, NULL, 1, '2026-04-28 15:29:30', '2026-04-28 15:34:02');
INSERT INTO `equipment_loans` (`id`, `requester_user_id`, `target_incident_area_id`, `approved_by_user_id`, `delivered_by_user_id`, `returned_by_user_id`, `status`, `request_notes`, `pending_physical_condition`, `pending_battery_level`, `pending_observations`, `approval_notes`, `rejection_reason`, `start_date`, `expected_return_date`, `delivered_at`, `returned_at`, `active`, `created_at`, `updated_at`) VALUES (31, 12, 18, NULL, NULL, NULL, 'rejected', 'onbording', NULL, NULL, NULL, NULL, 'no procede no se justifica', '2026-04-30 04:00:00', '2026-05-09 04:00:00', NULL, NULL, 1, '2026-04-28 15:35:54', '2026-04-28 15:38:31');
INSERT INTO `equipment_loans` (`id`, `requester_user_id`, `target_incident_area_id`, `approved_by_user_id`, `delivered_by_user_id`, `returned_by_user_id`, `status`, `request_notes`, `pending_physical_condition`, `pending_battery_level`, `pending_observations`, `approval_notes`, `rejection_reason`, `start_date`, `expected_return_date`, `delivered_at`, `returned_at`, `active`, `created_at`, `updated_at`) VALUES (32, 10, 10, NULL, NULL, NULL, 'pending', NULL, 'good', 85, 'oka', NULL, NULL, '2026-04-29 04:00:00', '2026-05-02 04:00:00', NULL, NULL, 1, '2026-04-28 15:55:37', '2026-04-28 15:56:46');


-- --------------------------------------------------------
-- Estructura de tabla para `equipment_pools`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `equipment_pools`;
CREATE TABLE `equipment_pools` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(120) NOT NULL,
  `description` text DEFAULT NULL,
  `total_stock` int(11) NOT NULL DEFAULT 0,
  `available_stock` int(11) NOT NULL DEFAULT 0,
  `minimum_stock` int(11) NOT NULL DEFAULT 0,
  `active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  KEY `idx_equipment_pools_active` (`active`),
  KEY `idx_equipment_pools_name` (`name`),
  CONSTRAINT `chk_equipment_pools_stock_non_negative` CHECK (`total_stock` >= 0),
  CONSTRAINT `chk_equipment_pools_available_non_negative` CHECK (`available_stock` >= 0),
  CONSTRAINT `chk_equipment_pools_available_not_greater_total` CHECK (`available_stock` <= `total_stock`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;


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

INSERT INTO `equipment_types` (`id`, `name`, `description`, `active`, `created_at`, `updated_at`) VALUES (1, 'dron', NULL, 1, '2026-02-25 00:57:43', '2026-02-25 00:57:43');
INSERT INTO `equipment_types` (`id`, `name`, `description`, `active`, `created_at`, `updated_at`) VALUES (2, 'Laptop', 'Computadora portátil', 1, '2026-02-25 01:13:30', '2026-02-25 01:13:30');
INSERT INTO `equipment_types` (`id`, `name`, `description`, `active`, `created_at`, `updated_at`) VALUES (3, 'Desktop', 'Computadora de escritorio', 1, '2026-02-25 01:13:30', '2026-02-25 01:13:30');
INSERT INTO `equipment_types` (`id`, `name`, `description`, `active`, `created_at`, `updated_at`) VALUES (4, 'Monitor', 'Monitor de computadora', 1, '2026-02-25 01:13:30', '2026-02-25 01:13:30');
INSERT INTO `equipment_types` (`id`, `name`, `description`, `active`, `created_at`, `updated_at`) VALUES (5, 'Teclado', 'Teclado de computadora', 1, '2026-02-25 01:13:30', '2026-02-25 01:13:30');
INSERT INTO `equipment_types` (`id`, `name`, `description`, `active`, `created_at`, `updated_at`) VALUES (6, 'Mouse', 'Mouse o ratón', 1, '2026-02-25 01:13:30', '2026-02-25 01:13:30');
INSERT INTO `equipment_types` (`id`, `name`, `description`, `active`, `created_at`, `updated_at`) VALUES (7, 'Impresora', 'Impresora', 1, '2026-02-25 01:13:30', '2026-02-25 01:13:30');
INSERT INTO `equipment_types` (`id`, `name`, `description`, `active`, `created_at`, `updated_at`) VALUES (8, 'Router', 'Router o enrutador de red', 1, '2026-02-25 01:13:30', '2026-02-25 01:13:30');
INSERT INTO `equipment_types` (`id`, `name`, `description`, `active`, `created_at`, `updated_at`) VALUES (9, 'Switch', 'Switch de red', 1, '2026-02-25 01:13:30', '2026-02-25 01:13:30');
INSERT INTO `equipment_types` (`id`, `name`, `description`, `active`, `created_at`, `updated_at`) VALUES (10, 'Tablet', 'Tablet o tableta', 1, '2026-02-25 01:13:30', '2026-02-25 01:13:30');
INSERT INTO `equipment_types` (`id`, `name`, `description`, `active`, `created_at`, `updated_at`) VALUES (11, 'Smartphone', 'Teléfono inteligente', 1, '2026-02-25 01:13:30', '2026-02-25 01:13:30');
INSERT INTO `equipment_types` (`id`, `name`, `description`, `active`, `created_at`, `updated_at`) VALUES (12, 'Otro', 'Otro tipo de equipo', 1, '2026-02-25 01:13:30', '2026-02-25 01:13:30');


-- --------------------------------------------------------
-- Estructura de tabla para `frequent_issues`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `frequent_issues`;
CREATE TABLE `frequent_issues` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `symptoms` text DEFAULT NULL,
  `possible_solution` text NOT NULL,
  `category_id` int(11) DEFAULT NULL,
  `active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_frequent_issues_title` (`title`),
  KEY `idx_frequent_issues_active` (`active`),
  KEY `idx_frequent_issues_category_id` (`category_id`),
  CONSTRAINT `fk_frequent_issues_category` FOREIGN KEY (`category_id`) REFERENCES `ticket_categories` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- --------------------------------------------------------
-- Datos de la tabla `frequent_issues`
-- --------------------------------------------------------

INSERT INTO `frequent_issues` (`id`, `title`, `symptoms`, `possible_solution`, `category_id`, `active`, `created_at`, `updated_at`) VALUES (1, 'No enciende el equipo', 'El equipo no responde al botón de encendido o no muestra señales de energía.', 'Verificar conexión de energía, probar otro tomacorriente, revisar cable/power supply y validar estado de batería.', NULL, 1, '2026-03-26 18:54:56', '2026-03-26 18:54:56');
INSERT INTO `frequent_issues` (`id`, `title`, `symptoms`, `possible_solution`, `category_id`, `active`, `created_at`, `updated_at`) VALUES (2, 'Sin conexión a internet', 'El usuario no puede navegar o pierde conexión de forma intermitente.', 'Reiniciar router/switch, validar cableado o Wi-Fi, ejecutar diagnóstico de red y renovar IP.', NULL, 1, '2026-03-26 18:54:56', '2026-03-26 18:54:56');
INSERT INTO `frequent_issues` (`id`, `title`, `symptoms`, `possible_solution`, `category_id`, `active`, `created_at`, `updated_at`) VALUES (3, 'Impresora no imprime', 'La impresora aparece en línea pero no procesa trabajos. ok', 'Validar cola de impresión, reiniciar servicio de impresión, revisar papel/tóner y reconectar la impresora.', NULL, 0, '2026-03-26 18:54:56', '2026-04-19 16:24:42');
INSERT INTO `frequent_issues` (`id`, `title`, `symptoms`, `possible_solution`, `category_id`, `active`, `created_at`, `updated_at`) VALUES (4, 'Correo saturado', 'no se reciben nuevos correos en el email.', 'Borrar correos antiguos', 7, 1, '2026-04-19 16:26:58', '2026-04-19 16:26:58');


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

INSERT INTO `incident_areas` (`id`, `name`, `description`, `active`, `created_at`, `updated_at`) VALUES (1, 'Dirección de Informática', 'Área de sistemas y tecnología', 1, '2026-02-21 18:19:40', '2026-02-21 18:19:40');
INSERT INTO `incident_areas` (`id`, `name`, `description`, `active`, `created_at`, `updated_at`) VALUES (2, 'Dirección de Administración siuuu', 'Área administrativa', 0, '2026-02-21 18:19:40', '2026-02-21 19:34:47');
INSERT INTO `incident_areas` (`id`, `name`, `description`, `active`, `created_at`, `updated_at`) VALUES (4, 'Dirección de Talento Humano', 'Área de recursos humanos', 1, '2026-02-21 18:19:40', '2026-02-21 18:19:40');
INSERT INTO `incident_areas` (`id`, `name`, `description`, `active`, `created_at`, `updated_at`) VALUES (5, 'Sala de Reuniones', 'Salas de reuniones y espacios comunes', 1, '2026-02-21 18:19:40', '2026-02-21 18:19:40');
INSERT INTO `incident_areas` (`id`, `name`, `description`, `active`, `created_at`, `updated_at`) VALUES (6, 'Oficina 201', 'Oficina administrativa', 1, '2026-02-21 18:19:40', '2026-02-21 18:19:40');
INSERT INTO `incident_areas` (`id`, `name`, `description`, `active`, `created_at`, `updated_at`) VALUES (7, 'Oficina 202', 'Oficina administrativa', 1, '2026-02-21 18:19:40', '2026-02-21 18:19:40');
INSERT INTO `incident_areas` (`id`, `name`, `description`, `active`, `created_at`, `updated_at`) VALUES (8, 'Oficina 203', 'Oficina administrativa', 1, '2026-02-21 18:19:40', '2026-02-21 18:19:40');
INSERT INTO `incident_areas` (`id`, `name`, `description`, `active`, `created_at`, `updated_at`) VALUES (9, 'Sale de reuniones', 'Migrated from tickets: Sale de reuniones', 1, '2026-02-21 18:19:40', '2026-02-21 18:19:40');
INSERT INTO `incident_areas` (`id`, `name`, `description`, `active`, `created_at`, `updated_at`) VALUES (10, 'Oficina 2', 'Migrated from tickets: Oficina 2', 1, '2026-02-21 18:19:40', '2026-02-21 18:19:40');
INSERT INTO `incident_areas` (`id`, `name`, `description`, `active`, `created_at`, `updated_at`) VALUES (18, 'Dirección de presupuesto', NULL, 1, '2026-02-21 19:22:16', '2026-02-21 19:22:16');


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

INSERT INTO `roles` (`id`, `name`, `description`, `created_at`, `updated_at`) VALUES (1, 'administrator', 'Administrador del sistema con acceso completo', '2026-01-25 23:48:33', '2026-01-25 23:48:33');
INSERT INTO `roles` (`id`, `name`, `description`, `created_at`, `updated_at`) VALUES (2, 'technician', 'Técnico de soporte con permisos para gestionar incidencias', '2026-01-25 23:48:33', '2026-01-25 23:48:33');
INSERT INTO `roles` (`id`, `name`, `description`, `created_at`, `updated_at`) VALUES (3, 'end_user', 'Usuario final que puede reportar incidencias', '2026-01-25 23:48:33', '2026-01-25 23:48:33');


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
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- --------------------------------------------------------
-- Datos de la tabla `ticket_categories`
-- --------------------------------------------------------

INSERT INTO `ticket_categories` (`id`, `name`, `description`, `active`, `created_at`, `updated_at`) VALUES (1, 'Hardware', 'Problemas relacionados con equipos físicos', 1, '2026-02-17 18:22:39', '2026-02-17 18:22:39');
INSERT INTO `ticket_categories` (`id`, `name`, `description`, `active`, `created_at`, `updated_at`) VALUES (2, 'Software', 'Problemas relacionados con aplicaciones y programas', 1, '2026-02-17 18:22:39', '2026-02-17 18:22:39');
INSERT INTO `ticket_categories` (`id`, `name`, `description`, `active`, `created_at`, `updated_at`) VALUES (3, 'Red', 'Problemas relacionados con conectividad y red', 1, '2026-02-17 18:22:39', '2026-02-17 18:22:39');
INSERT INTO `ticket_categories` (`id`, `name`, `description`, `active`, `created_at`, `updated_at`) VALUES (4, 'Otro', 'Otras incidencias no categorizadas', 1, '2026-02-17 18:22:39', '2026-02-17 18:22:39');
INSERT INTO `ticket_categories` (`id`, `name`, `description`, `active`, `created_at`, `updated_at`) VALUES (7, 'Categoria nueva', 'Una nueva categoria fghgffdj', 1, '2026-02-21 19:20:33', '2026-02-21 19:20:33');


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

INSERT INTO `ticket_comments` (`id`, `ticket_id`, `user_id`, `content`, `created_at`) VALUES (1, '39bcac38-d276-4910-ada6-dc2c4e1d32a0', 5, 'Se debe mejorar tal cosa', '2026-02-20 14:55:08');
INSERT INTO `ticket_comments` (`id`, `ticket_id`, `user_id`, `content`, `created_at`) VALUES (2, '39bcac38-d276-4910-ada6-dc2c4e1d32a0', 5, 'Ya me encargo.', '2026-02-20 15:55:51');
INSERT INTO `ticket_comments` (`id`, `ticket_id`, `user_id`, `content`, `created_at`) VALUES (3, '39bcac38-d276-4910-ada6-dc2c4e1d32a0', 5, 'Listo', '2026-02-20 15:56:27');
INSERT INTO `ticket_comments` (`id`, `ticket_id`, `user_id`, `content`, `created_at`) VALUES (4, '39bcac38-d276-4910-ada6-dc2c4e1d32a0', 5, 'Faltó un comentario', '2026-02-20 19:59:45');
INSERT INTO `ticket_comments` (`id`, `ticket_id`, `user_id`, `content`, `created_at`) VALUES (10, '79c1de31-1cc7-4be0-b487-60139b4329fe', 12, '1 Comentario', '2026-02-21 22:50:09');
INSERT INTO `ticket_comments` (`id`, `ticket_id`, `user_id`, `content`, `created_at`) VALUES (11, '79c1de31-1cc7-4be0-b487-60139b4329fe', 5, 'Un comentario de un administrador', '2026-02-21 22:53:55');
INSERT INTO `ticket_comments` (`id`, `ticket_id`, `user_id`, `content`, `created_at`) VALUES (12, '79c1de31-1cc7-4be0-b487-60139b4329fe', 12, 'Yo de nuevo', '2026-02-21 23:04:41');
INSERT INTO `ticket_comments` (`id`, `ticket_id`, `user_id`, `content`, `created_at`) VALUES (13, '91e5307a-c686-4cbc-a66c-4d31a15e2c93', 10, 'Diagnóstico sugerido: Sin conexión a internet\nPosible solución: Reiniciar router/switch, validar cableado o Wi-Fi, ejecutar diagnóstico de red y renovar IP.', '2026-04-19 20:48:13');


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
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- --------------------------------------------------------
-- Datos de la tabla `ticket_equipment`
-- --------------------------------------------------------

INSERT INTO `ticket_equipment` (`id`, `ticket_id`, `equipment_id`, `created_at`) VALUES (2, '3ffaaf09-0af4-4cbb-aff5-396d6779d334', 3, '2026-02-25 22:02:39');
INSERT INTO `ticket_equipment` (`id`, `ticket_id`, `equipment_id`, `created_at`) VALUES (3, '7db5ecbc-8b49-49ac-bf5c-94a192dea047', 3, '2026-04-19 16:39:02');
INSERT INTO `ticket_equipment` (`id`, `ticket_id`, `equipment_id`, `created_at`) VALUES (5, '91e5307a-c686-4cbc-a66c-4d31a15e2c93', 3, '2026-04-19 16:42:53');


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
) ENGINE=InnoDB AUTO_INCREMENT=39 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- --------------------------------------------------------
-- Datos de la tabla `ticket_history`
-- --------------------------------------------------------

INSERT INTO `ticket_history` (`id`, `ticket_id`, `user_id`, `change_type`, `previous_field`, `new_field`, `description`, `changed_at`) VALUES (1, '5fd6b520-fcc0-44e6-8892-a5a3cfb6f14e', 5, 'CREACION', NULL, NULL, 'Ticket creado', '2026-02-17 18:50:46');
INSERT INTO `ticket_history` (`id`, `ticket_id`, `user_id`, `change_type`, `previous_field`, `new_field`, `description`, `changed_at`) VALUES (2, '7f9b37ae-d459-41e2-a23f-d12d24c69987', 5, 'CREACION', NULL, NULL, 'Ticket creado', '2026-02-17 19:03:54');
INSERT INTO `ticket_history` (`id`, `ticket_id`, `user_id`, `change_type`, `previous_field`, `new_field`, `description`, `changed_at`) VALUES (3, '39bcac38-d276-4910-ada6-dc2c4e1d32a0', 5, 'CREACION', NULL, NULL, 'Ticket creado', '2026-02-17 19:09:20');
INSERT INTO `ticket_history` (`id`, `ticket_id`, `user_id`, `change_type`, `previous_field`, `new_field`, `description`, `changed_at`) VALUES (4, '39bcac38-d276-4910-ada6-dc2c4e1d32a0', 5, 'ACTUALIZACION', 'La red se cayó de nuevo.', 'La red se cayó de nuevo. aja', 'descripcion cambiado de \"La red se cayó de nuevo.\" a \"La red se cayó de nuevo. aja\"', '2026-02-17 19:38:40');
INSERT INTO `ticket_history` (`id`, `ticket_id`, `user_id`, `change_type`, `previous_field`, `new_field`, `description`, `changed_at`) VALUES (5, '39bcac38-d276-4910-ada6-dc2c4e1d32a0', 5, 'ACTUALIZACION', 'Sin asignar', 'Maria  Briceño R', 'tecnico_asignado cambiado de \"Sin asignar\" a \"Maria  Briceño R\"', '2026-02-17 19:38:40');
INSERT INTO `ticket_history` (`id`, `ticket_id`, `user_id`, `change_type`, `previous_field`, `new_field`, `description`, `changed_at`) VALUES (6, '39bcac38-d276-4910-ada6-dc2c4e1d32a0', 5, 'COMENTARIO', NULL, NULL, 'Comentario agregado', '2026-02-20 14:55:08');
INSERT INTO `ticket_history` (`id`, `ticket_id`, `user_id`, `change_type`, `previous_field`, `new_field`, `description`, `changed_at`) VALUES (7, '39bcac38-d276-4910-ada6-dc2c4e1d32a0', 5, 'ACTUALIZACION', 'La red se cayó de nuevo. aja', 'La red se cayó de nuevo. ajax', 'descripcion cambiado de \"La red se cayó de nuevo. aja\" a \"La red se cayó de nuevo. ajax\"', '2026-02-20 15:21:53');
INSERT INTO `ticket_history` (`id`, `ticket_id`, `user_id`, `change_type`, `previous_field`, `new_field`, `description`, `changed_at`) VALUES (9, '39bcac38-d276-4910-ada6-dc2c4e1d32a0', 5, 'ACTUALIZACION', 'La red se cayó de nuevo. ajax', 'La red se cayó de nuevo', 'descripcion cambiado de \"La red se cayó de nuevo. ajax\" a \"La red se cayó de nuevo\"', '2026-02-20 15:31:24');
INSERT INTO `ticket_history` (`id`, `ticket_id`, `user_id`, `change_type`, `previous_field`, `new_field`, `description`, `changed_at`) VALUES (10, '39bcac38-d276-4910-ada6-dc2c4e1d32a0', 5, 'COMENTARIO', NULL, NULL, 'Comentario agregado', '2026-02-20 15:55:51');
INSERT INTO `ticket_history` (`id`, `ticket_id`, `user_id`, `change_type`, `previous_field`, `new_field`, `description`, `changed_at`) VALUES (11, '39bcac38-d276-4910-ada6-dc2c4e1d32a0', 5, 'COMENTARIO', NULL, NULL, 'Comentario agregado', '2026-02-20 15:56:27');
INSERT INTO `ticket_history` (`id`, `ticket_id`, `user_id`, `change_type`, `previous_field`, `new_field`, `description`, `changed_at`) VALUES (12, '39bcac38-d276-4910-ada6-dc2c4e1d32a0', 5, 'COMENTARIO', NULL, NULL, 'Comentario agregado', '2026-02-20 19:59:45');
INSERT INTO `ticket_history` (`id`, `ticket_id`, `user_id`, `change_type`, `previous_field`, `new_field`, `description`, `changed_at`) VALUES (13, '39bcac38-d276-4910-ada6-dc2c4e1d32a0', 5, 'ACTUALIZACION', 'Abierto', 'En Proceso', 'estado cambiado de \"Abierto\" a \"En Proceso\"', '2026-02-20 16:04:07');
INSERT INTO `ticket_history` (`id`, `ticket_id`, `user_id`, `change_type`, `previous_field`, `new_field`, `description`, `changed_at`) VALUES (14, '39bcac38-d276-4910-ada6-dc2c4e1d32a0', 5, 'ACTUALIZACION', 'En Proceso', 'Resuelto', 'Estado cambiado de \"En Proceso\" a \"Resuelto\"', '2026-02-20 16:06:43');
INSERT INTO `ticket_history` (`id`, `ticket_id`, `user_id`, `change_type`, `previous_field`, `new_field`, `description`, `changed_at`) VALUES (21, '79c1de31-1cc7-4be0-b487-60139b4329fe', 12, 'CREATION', NULL, NULL, 'Ticket creado', '2026-02-21 18:45:52');
INSERT INTO `ticket_history` (`id`, `ticket_id`, `user_id`, `change_type`, `previous_field`, `new_field`, `description`, `changed_at`) VALUES (22, '79c1de31-1cc7-4be0-b487-60139b4329fe', 5, 'UPDATE', 'Sin asignar', 'Maria IT two', 'assigned_technician cambiado de \"Sin asignar\" a \"Maria IT two\"', '2026-02-21 19:03:14');
INSERT INTO `ticket_history` (`id`, `ticket_id`, `user_id`, `change_type`, `previous_field`, `new_field`, `description`, `changed_at`) VALUES (23, '79c1de31-1cc7-4be0-b487-60139b4329fe', 5, 'UPDATE', 'Abierto', 'Asignado', 'state cambiado de \"Abierto\" a \"Asignado\"', '2026-02-21 19:03:14');
INSERT INTO `ticket_history` (`id`, `ticket_id`, `user_id`, `change_type`, `previous_field`, `new_field`, `description`, `changed_at`) VALUES (24, '79c1de31-1cc7-4be0-b487-60139b4329fe', 10, 'UPDATE', 'Asignado', 'En Proceso', 'state cambiado de \"Asignado\" a \"En Proceso\"', '2026-02-21 19:18:56');
INSERT INTO `ticket_history` (`id`, `ticket_id`, `user_id`, `change_type`, `previous_field`, `new_field`, `description`, `changed_at`) VALUES (25, '79c1de31-1cc7-4be0-b487-60139b4329fe', 10, 'UPDATE', 'En Proceso', 'Resuelto', 'Estado cambiado de \"En Proceso\" a \"Resuelto\"', '2026-02-21 19:29:30');
INSERT INTO `ticket_history` (`id`, `ticket_id`, `user_id`, `change_type`, `previous_field`, `new_field`, `description`, `changed_at`) VALUES (26, '3ffaaf09-0af4-4cbb-aff5-396d6779d334', 12, 'CREATION', NULL, NULL, 'Ticket creado', '2026-02-21 19:49:05');
INSERT INTO `ticket_history` (`id`, `ticket_id`, `user_id`, `change_type`, `previous_field`, `new_field`, `description`, `changed_at`) VALUES (27, '3ffaaf09-0af4-4cbb-aff5-396d6779d334', 5, 'UPDATE', 'Sin asignar', 'Maria IT two', 'assigned_technician cambiado de \"Sin asignar\" a \"Maria IT two\"', '2026-02-21 19:58:29');
INSERT INTO `ticket_history` (`id`, `ticket_id`, `user_id`, `change_type`, `previous_field`, `new_field`, `description`, `changed_at`) VALUES (28, '3ffaaf09-0af4-4cbb-aff5-396d6779d334', 5, 'UPDATE', 'Abierto', 'Asignado', 'state cambiado de \"Abierto\" a \"Asignado\"', '2026-02-21 19:58:29');
INSERT INTO `ticket_history` (`id`, `ticket_id`, `user_id`, `change_type`, `previous_field`, `new_field`, `description`, `changed_at`) VALUES (29, '3ffaaf09-0af4-4cbb-aff5-396d6779d334', 10, 'UPDATE', 'Asignado', 'Cerrado', 'state cambiado de \"Asignado\" a \"Cerrado\"', '2026-02-21 20:00:56');
INSERT INTO `ticket_history` (`id`, `ticket_id`, `user_id`, `change_type`, `previous_field`, `new_field`, `description`, `changed_at`) VALUES (30, '3ffaaf09-0af4-4cbb-aff5-396d6779d334', 5, 'UPDATE', 'Ninguno', 'Laptop-DEV-01', 'Equipos asociados cambiados de \"Ninguno\" a \"Laptop-DEV-01\"', '2026-02-25 22:02:39');
INSERT INTO `ticket_history` (`id`, `ticket_id`, `user_id`, `change_type`, `previous_field`, `new_field`, `description`, `changed_at`) VALUES (31, '7dccd5a2-1e46-45f3-bc24-a3409ca49769', 12, 'CREATION', NULL, NULL, 'Ticket creado', '2026-03-26 19:05:31');
INSERT INTO `ticket_history` (`id`, `ticket_id`, `user_id`, `change_type`, `previous_field`, `new_field`, `description`, `changed_at`) VALUES (32, '717d7838-5176-4221-934e-ff593b98cc79', 12, 'CREATION', NULL, NULL, 'Ticket creado', '2026-04-19 16:05:57');
INSERT INTO `ticket_history` (`id`, `ticket_id`, `user_id`, `change_type`, `previous_field`, `new_field`, `description`, `changed_at`) VALUES (33, '7db5ecbc-8b49-49ac-bf5c-94a192dea047', 12, 'CREATION', NULL, NULL, 'Ticket creado', '2026-04-19 16:39:02');
INSERT INTO `ticket_history` (`id`, `ticket_id`, `user_id`, `change_type`, `previous_field`, `new_field`, `description`, `changed_at`) VALUES (34, '91e5307a-c686-4cbc-a66c-4d31a15e2c93', 12, 'CREATION', NULL, NULL, 'Ticket creado', '2026-04-19 16:41:11');
INSERT INTO `ticket_history` (`id`, `ticket_id`, `user_id`, `change_type`, `previous_field`, `new_field`, `description`, `changed_at`) VALUES (35, '91e5307a-c686-4cbc-a66c-4d31a15e2c93', 5, 'UPDATE', 'Sin asignar', 'Maria IT two', 'Cambio de asignación a Maria IT two', '2026-04-19 16:42:53');
INSERT INTO `ticket_history` (`id`, `ticket_id`, `user_id`, `change_type`, `previous_field`, `new_field`, `description`, `changed_at`) VALUES (36, '91e5307a-c686-4cbc-a66c-4d31a15e2c93', 5, 'UPDATE', 'Abierto', 'Asignado', 'Estado cambiado de \"Abierto\" a \"Asignado\"', '2026-04-19 16:42:53');
INSERT INTO `ticket_history` (`id`, `ticket_id`, `user_id`, `change_type`, `previous_field`, `new_field`, `description`, `changed_at`) VALUES (37, '91e5307a-c686-4cbc-a66c-4d31a15e2c93', 10, 'UPDATE', 'Asignado', 'En Proceso', 'Estado cambiado de \"Asignado\" a \"En Proceso\"', '2026-04-19 16:44:19');
INSERT INTO `ticket_history` (`id`, `ticket_id`, `user_id`, `change_type`, `previous_field`, `new_field`, `description`, `changed_at`) VALUES (38, '91e5307a-c686-4cbc-a66c-4d31a15e2c93', 10, 'UPDATE', 'En Proceso', 'Resuelto', 'Estado cambiado de \"En Proceso\" a \"Resuelto\"', '2026-04-19 16:50:22');


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

INSERT INTO `ticket_priorities` (`id`, `name`, `level`, `color`, `description`, `active`, `created_at`, `updated_at`) VALUES (2, 'Media', 2, 'bg-yellow-100', 'Prioridad media, atención normal', 1, '2026-02-17 18:22:39', '2026-02-17 18:22:39');
INSERT INTO `ticket_priorities` (`id`, `name`, `level`, `color`, `description`, `active`, `created_at`, `updated_at`) VALUES (3, 'Alta', 3, 'bg-orange-100', 'Prioridad alta, requiere atención pronta', 1, '2026-02-17 18:22:39', '2026-02-17 18:22:39');
INSERT INTO `ticket_priorities` (`id`, `name`, `level`, `color`, `description`, `active`, `created_at`, `updated_at`) VALUES (4, 'Urgente', 4, 'bg-red-100', 'Prioridad urgente, requiere atención inmediata', 1, '2026-02-17 18:22:39', '2026-02-17 18:22:39');
INSERT INTO `ticket_priorities` (`id`, `name`, `level`, `color`, `description`, `active`, `created_at`, `updated_at`) VALUES (11, 'Baja', 1, 'bg-green-100', NULL, 1, '2026-02-17 18:42:38', '2026-02-17 18:42:38');


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

INSERT INTO `ticket_states` (`id`, `name`, `description`, `color`, `order`, `active`, `created_at`, `updated_at`) VALUES (1, 'Abierto', 'Ticket creado y pendiente de asignación', 'bg-green-400', 1, 1, '2026-02-17 18:22:39', '2026-02-17 19:27:48');
INSERT INTO `ticket_states` (`id`, `name`, `description`, `color`, `order`, `active`, `created_at`, `updated_at`) VALUES (2, 'Asignado', 'Ticket asignado a un técnico', 'bg-yellow-200', 2, 1, '2026-02-17 18:22:39', '2026-02-17 19:27:48');
INSERT INTO `ticket_states` (`id`, `name`, `description`, `color`, `order`, `active`, `created_at`, `updated_at`) VALUES (3, 'En Proceso', 'Técnico trabajando en la resolución', 'bg-orange-300', 3, 1, '2026-02-17 18:22:39', '2026-02-17 19:27:48');
INSERT INTO `ticket_states` (`id`, `name`, `description`, `color`, `order`, `active`, `created_at`, `updated_at`) VALUES (4, 'Resuelto', 'Ticket resuelto, pendiente de confirmación', 'bg-blue-100', 4, 1, '2026-02-17 18:22:39', '2026-02-17 19:27:48');
INSERT INTO `ticket_states` (`id`, `name`, `description`, `color`, `order`, `active`, `created_at`, `updated_at`) VALUES (5, 'Cerrado', 'Ticket cerrado definitivamente', 'bg-gray-100', 5, 1, '2026-02-17 18:22:39', '2026-02-17 18:22:39');


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

INSERT INTO `tickets` (`id`, `title`, `description`, `incident_area_id`, `category_id`, `priority_id`, `state_id`, `created_by_user_id`, `assigned_technician_id`, `image_url`, `created_at`, `updated_at`, `closed_at`) VALUES ('39bcac38-d276-4910-ada6-dc2c4e1d32a0', 'Falla de red', 'La red se cayó de nuevo', 9, 3, 4, 4, 5, 5, '[\"/uploads/tickets/ticket-1771355360506-582526171.PNG\",\"/uploads/tickets/ticket-1771355360509-543711500.PNG\"]', '2026-02-17 19:09:20', '2026-02-21 18:19:40', NULL);
INSERT INTO `tickets` (`id`, `title`, `description`, `incident_area_id`, `category_id`, `priority_id`, `state_id`, `created_by_user_id`, `assigned_technician_id`, `image_url`, `created_at`, `updated_at`, `closed_at`) VALUES ('3ffaaf09-0af4-4cbb-aff5-396d6779d334', 'Falla de Hardware 2', 'Se metió un bug en el ordenador', 1, 7, 11, 5, 12, 10, '[\"/uploads/tickets/ticket-1771703345714-932043046.jpg\"]', '2026-02-21 19:49:05', '2026-02-25 22:02:39', '2026-02-25 22:02:39');
INSERT INTO `tickets` (`id`, `title`, `description`, `incident_area_id`, `category_id`, `priority_id`, `state_id`, `created_by_user_id`, `assigned_technician_id`, `image_url`, `created_at`, `updated_at`, `closed_at`) VALUES ('5fd6b520-fcc0-44e6-8892-a5a3cfb6f14e', 'Falla de sistema', 'Ha fallado de manera estrepitosa.', 9, 2, 4, 1, 5, NULL, '/uploads/tickets/ticket-1771354246010-234137976.PNG', '2026-02-17 18:50:46', '2026-02-21 18:19:40', NULL);
INSERT INTO `tickets` (`id`, `title`, `description`, `incident_area_id`, `category_id`, `priority_id`, `state_id`, `created_by_user_id`, `assigned_technician_id`, `image_url`, `created_at`, `updated_at`, `closed_at`) VALUES ('717d7838-5176-4221-934e-ff593b98cc79', 'No enciende el equipo', 'El equipo no responde al botón de encendido o no muestra señales de energía.\r\n\r\nPosible solución sugerida:\r\nVerificar conexión de energía, probar otro tomacorriente, revisar cable/power supply y validar estado de batería.', 18, 1, 2, 1, 12, NULL, '[\"/uploads/tickets/ticket-1776614757295-693608524.png\"]', '2026-04-19 16:05:57', '2026-04-19 16:05:57', NULL);
INSERT INTO `tickets` (`id`, `title`, `description`, `incident_area_id`, `category_id`, `priority_id`, `state_id`, `created_by_user_id`, `assigned_technician_id`, `image_url`, `created_at`, `updated_at`, `closed_at`) VALUES ('79c1de31-1cc7-4be0-b487-60139b4329fe', 'Falla de red 3', 'Otra falla de red 3 otra', 2, 3, 4, 4, 12, 10, '[\"/uploads/tickets/ticket-1771699552163-284470268.jpg\",\"/uploads/tickets/ticket-1771699552165-567105812.jpg\"]', '2026-02-21 18:45:52', '2026-02-21 19:29:30', NULL);
INSERT INTO `tickets` (`id`, `title`, `description`, `incident_area_id`, `category_id`, `priority_id`, `state_id`, `created_by_user_id`, `assigned_technician_id`, `image_url`, `created_at`, `updated_at`, `closed_at`) VALUES ('7db5ecbc-8b49-49ac-bf5c-94a192dea047', 'Sin conexión a internet', 'El usuario no puede navegar o pierde conexión de forma intermitente.', 18, 3, 3, 1, 12, NULL, '[\"/uploads/tickets/ticket-1776616742002-274903833.png\"]', '2026-04-19 16:39:02', '2026-04-19 16:39:02', NULL);
INSERT INTO `tickets` (`id`, `title`, `description`, `incident_area_id`, `category_id`, `priority_id`, `state_id`, `created_by_user_id`, `assigned_technician_id`, `image_url`, `created_at`, `updated_at`, `closed_at`) VALUES ('7dccd5a2-1e46-45f3-bc24-a3409ca49769', 'No enciende el equipo', 'El equipo no responde al botón de encendido o no muestra señales de energía.\r\n\r\nPosible solución sugerida:\r\nVerificar conexión de energía, probar otro tomacorriente, revisar cable/power supply y validar estado de batería.', 18, 1, 3, 1, 12, NULL, '[\"/uploads/tickets/ticket-1774551931940-21416443.png\"]', '2026-03-26 19:05:31', '2026-03-26 19:05:31', NULL);
INSERT INTO `tickets` (`id`, `title`, `description`, `incident_area_id`, `category_id`, `priority_id`, `state_id`, `created_by_user_id`, `assigned_technician_id`, `image_url`, `created_at`, `updated_at`, `closed_at`) VALUES ('7f9b37ae-d459-41e2-a23f-d12d24c69987', 'Falla de Hardware', 'La pc no quiere encender.', 10, 1, 2, 1, 5, NULL, '/uploads/tickets/ticket-1771355034025-376685395.PNG', '2026-02-17 19:03:54', '2026-02-21 18:19:40', NULL);
INSERT INTO `tickets` (`id`, `title`, `description`, `incident_area_id`, `category_id`, `priority_id`, `state_id`, `created_by_user_id`, `assigned_technician_id`, `image_url`, `created_at`, `updated_at`, `closed_at`) VALUES ('91e5307a-c686-4cbc-a66c-4d31a15e2c93', 'Correo saturado', 'no se reciben nuevos correos en el email.', 18, 2, 2, 4, 12, 10, '[\"/uploads/tickets/ticket-1776616871118-68873274.png\"]', '2026-04-19 16:41:11', '2026-04-19 16:50:22', NULL);


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
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- --------------------------------------------------------
-- Datos de la tabla `users`
-- --------------------------------------------------------

INSERT INTO `users` (`id`, `full_name`, `email`, `password`, `phone`, `department`, `incident_area_id`, `role_id`, `email_verified`, `active`, `created_at`, `updated_at`, `security_question_1`, `security_answer_1`, `security_question_2`, `security_answer_2`) VALUES (5, 'Maria  Briceño R', 'mvbridev@gmail.com', '$2a$10$nA4810S5qBPYFE3Auw/tRu.ohfwBIGaRvhqQR1Pxi7vlH2oxZlNna', '4249312548', 'Secretaria', NULL, 1, 1, 1, '2026-02-09 18:12:04', '2026-02-20 16:13:13', NULL, NULL, NULL, NULL);
INSERT INTO `users` (`id`, `full_name`, `email`, `password`, `phone`, `department`, `incident_area_id`, `role_id`, `email_verified`, `active`, `created_at`, `updated_at`, `security_question_1`, `security_answer_1`, `security_question_2`, `security_answer_2`) VALUES (10, 'Maria IT two', 'mvbri10@gmail.com', '$2a$10$x8FsGprsxgEI.wTxIOCYHOGTSp4Wr.YxPgizqWst/Om8QuLSmWYJ2', NULL, 'Oficina 2', 10, 2, 1, 1, '2026-02-12 23:03:20', '2026-04-28 15:55:23', '¿Cuál es mi mascota?', '$2a$10$n5fHDup1vY.pDUggM4pzi.qiu28YQRMzwhOJrIbsYAytfZy8aWLmi', '¿En qué ciudad naciste?', '$2a$10$Q.LOMQYV.aDYKpeePDvpDO7Q36/1Rq1McJBdvhai3oGdZzsprjtge');
INSERT INTO `users` (`id`, `full_name`, `email`, `password`, `phone`, `department`, `incident_area_id`, `role_id`, `email_verified`, `active`, `created_at`, `updated_at`, `security_question_1`, `security_answer_1`, `security_question_2`, `security_answer_2`) VALUES (12, 'Maria Colaboradora', 'mvbri06@gmail.com', '$2a$10$p76V87iY39eZgvRWHvjeQ.3geyktYA19Wz7SiNcGL7m5v3ovgFaD6', '+58 4249312888', 'Dirección de presupuesto', 18, 3, 1, 1, '2026-02-20 16:11:42', '2026-03-26 19:04:36', NULL, NULL, NULL, NULL);
INSERT INTO `users` (`id`, `full_name`, `email`, `password`, `phone`, `department`, `incident_area_id`, `role_id`, `email_verified`, `active`, `created_at`, `updated_at`, `security_question_1`, `security_answer_1`, `security_question_2`, `security_answer_2`) VALUES (13, 'Alias', 'mvbri10+55@gmail.com', '$2a$10$IYIAgJvdclV9iY0U8jEhIuH0T360KDEH84Ioy.bDfjxq0UZdJImuO', NULL, 'IT', NULL, 3, 1, 1, '2026-02-21 20:14:39', '2026-02-23 19:45:08', NULL, NULL, NULL, NULL);
INSERT INTO `users` (`id`, `full_name`, `email`, `password`, `phone`, `department`, `incident_area_id`, `role_id`, `email_verified`, `active`, `created_at`, `updated_at`, `security_question_1`, `security_answer_1`, `security_question_2`, `security_answer_2`) VALUES (14, 'Victoria', 'mvbri10+11@gmail.com', '$2a$10$KKv75/aIyWSLoi4/Wfvf9OLkrgn6FP61lS2Un1k.t5hoZ58yYMgua', NULL, 'Sale de reuniones', 9, 3, 0, 0, '2026-02-25 21:41:00', '2026-02-25 21:56:36', NULL, NULL, NULL, NULL);


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
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- --------------------------------------------------------
-- Datos de la tabla `verification_tokens`
-- --------------------------------------------------------

INSERT INTO `verification_tokens` (`id`, `user_id`, `token`, `type`, `expires_at`, `used`, `created_at`) VALUES (5, 5, '523bdf5710cd2ff3542e937854a5532e3ad21c87c960665fe321c73e31cbcd15', 'email_verification', '2026-02-10 18:12:04', 1, '2026-02-09 18:12:04');
INSERT INTO `verification_tokens` (`id`, `user_id`, `token`, `type`, `expires_at`, `used`, `created_at`) VALUES (17, 5, '9cd9352ad23b0e45af12ed3ba537568a11f83431ade92f633ef29e319cdd0bbc', 'password_recovery', '2026-02-12 23:28:25', 1, '2026-02-12 22:28:25');
INSERT INTO `verification_tokens` (`id`, `user_id`, `token`, `type`, `expires_at`, `used`, `created_at`) VALUES (23, 10, 'b06e1bd42ab1474224619342319cd53668325cee009ff4339f2d7064cfdf8003', 'email_verification', '2026-02-13 23:04:19', 1, '2026-02-12 23:04:19');
INSERT INTO `verification_tokens` (`id`, `user_id`, `token`, `type`, `expires_at`, `used`, `created_at`) VALUES (27, 10, 'a437d535bd34cde3355af1d901af2b05e94e715ddeb3f53eed55ca9b9bb6f3ab', 'password_recovery', '2026-02-17 18:56:45', 1, '2026-02-17 17:56:45');
INSERT INTO `verification_tokens` (`id`, `user_id`, `token`, `type`, `expires_at`, `used`, `created_at`) VALUES (28, 12, 'c7fd7b698d0f2c971bb34b7302d4844486a26855a6b03b6d4cee8e0cba668b74', 'email_verification', '2026-02-21 16:11:42', 1, '2026-02-20 16:11:42');
INSERT INTO `verification_tokens` (`id`, `user_id`, `token`, `type`, `expires_at`, `used`, `created_at`) VALUES (29, 13, '9364da7fd725c0cea6b39c66778a48421ebe2ff14eb8b8464e24b79bcaf1a021', 'email_verification', '2026-02-22 20:14:39', 1, '2026-02-21 20:14:39');
INSERT INTO `verification_tokens` (`id`, `user_id`, `token`, `type`, `expires_at`, `used`, `created_at`) VALUES (30, 14, 'c4c6e84dde0718fd82a9ba840296901568b373d9dfc5ded7ae78ac1d3d5e92e9', 'email_verification', '2026-02-26 21:41:00', 0, '2026-02-25 21:41:00');

SET FOREIGN_KEY_CHECKS = 1;
