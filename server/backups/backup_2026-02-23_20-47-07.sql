/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19-12.1.2-MariaDB, for Win64 (AMD64)
--
-- Host: localhost    Database: sistema_soporte
-- ------------------------------------------------------
-- Server version	12.1.2-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*M!100616 SET @OLD_NOTE_VERBOSITY=@@NOTE_VERBOSITY, NOTE_VERBOSITY=0 */;

--
-- Table structure for table `incident_areas`
--

DROP TABLE IF EXISTS `incident_areas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `incident_areas`
--

LOCK TABLES `incident_areas` WRITE;
/*!40000 ALTER TABLE `incident_areas` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `incident_areas` VALUES
(1,'Dirección de Informática','Área de sistemas y tecnología',1,'2026-02-21 18:19:40','2026-02-21 18:19:40'),
(2,'Dirección de Administración siuuu','Área administrativa',0,'2026-02-21 18:19:40','2026-02-21 19:34:47'),
(4,'Dirección de Talento Humano','Área de recursos humanos',1,'2026-02-21 18:19:40','2026-02-21 18:19:40'),
(5,'Sala de Reuniones','Salas de reuniones y espacios comunes',1,'2026-02-21 18:19:40','2026-02-21 18:19:40'),
(6,'Oficina 201','Oficina administrativa',1,'2026-02-21 18:19:40','2026-02-21 18:19:40'),
(7,'Oficina 202','Oficina administrativa',1,'2026-02-21 18:19:40','2026-02-21 18:19:40'),
(8,'Oficina 203','Oficina administrativa',1,'2026-02-21 18:19:40','2026-02-21 18:19:40'),
(9,'Sale de reuniones','Migrated from tickets: Sale de reuniones',1,'2026-02-21 18:19:40','2026-02-21 18:19:40'),
(10,'Oficina 2','Migrated from tickets: Oficina 2',1,'2026-02-21 18:19:40','2026-02-21 18:19:40'),
(18,'Dirección de presupuesto',NULL,1,'2026-02-21 19:22:16','2026-02-21 19:22:16');
/*!40000 ALTER TABLE `incident_areas` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `roles` VALUES
(1,'administrator','Administrador del sistema con acceso completo','2026-01-25 23:48:33','2026-01-25 23:48:33'),
(2,'technician','Técnico de soporte con permisos para gestionar incidencias','2026-01-25 23:48:33','2026-01-25 23:48:33'),
(3,'end_user','Usuario final que puede reportar incidencias','2026-01-25 23:48:33','2026-01-25 23:48:33');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `ticket_categories`
--

DROP TABLE IF EXISTS `ticket_categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ticket_categories`
--

LOCK TABLES `ticket_categories` WRITE;
/*!40000 ALTER TABLE `ticket_categories` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `ticket_categories` VALUES
(1,'Hardware','Problemas relacionados con equipos físicos',1,'2026-02-17 18:22:39','2026-02-17 18:22:39'),
(2,'Software','Problemas relacionados con aplicaciones y programas',1,'2026-02-17 18:22:39','2026-02-17 18:22:39'),
(3,'Red','Problemas relacionados con conectividad y red',1,'2026-02-17 18:22:39','2026-02-17 18:22:39'),
(4,'Otro','Otras incidencias no categorizadas',1,'2026-02-17 18:22:39','2026-02-17 18:22:39'),
(7,'Categoria nueva','Una nueva categoria fghgffdj',1,'2026-02-21 19:20:33','2026-02-21 19:20:33');
/*!40000 ALTER TABLE `ticket_categories` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `ticket_comments`
--

DROP TABLE IF EXISTS `ticket_comments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
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
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ticket_comments`
--

LOCK TABLES `ticket_comments` WRITE;
/*!40000 ALTER TABLE `ticket_comments` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `ticket_comments` VALUES
(1,'39bcac38-d276-4910-ada6-dc2c4e1d32a0',5,'Se debe mejorar tal cosa','2026-02-20 14:55:08'),
(2,'39bcac38-d276-4910-ada6-dc2c4e1d32a0',5,'Ya me encargo.','2026-02-20 15:55:51'),
(3,'39bcac38-d276-4910-ada6-dc2c4e1d32a0',5,'Listo','2026-02-20 15:56:27'),
(4,'39bcac38-d276-4910-ada6-dc2c4e1d32a0',5,'Faltó un comentario','2026-02-20 19:59:45'),
(10,'79c1de31-1cc7-4be0-b487-60139b4329fe',12,'1 Comentario','2026-02-21 22:50:09'),
(11,'79c1de31-1cc7-4be0-b487-60139b4329fe',5,'Un comentario de un administrador','2026-02-21 22:53:55'),
(12,'79c1de31-1cc7-4be0-b487-60139b4329fe',12,'Yo de nuevo','2026-02-21 23:04:41');
/*!40000 ALTER TABLE `ticket_comments` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `ticket_history`
--

DROP TABLE IF EXISTS `ticket_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
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
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ticket_history`
--

LOCK TABLES `ticket_history` WRITE;
/*!40000 ALTER TABLE `ticket_history` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `ticket_history` VALUES
(1,'5fd6b520-fcc0-44e6-8892-a5a3cfb6f14e',5,'CREACION',NULL,NULL,'Ticket creado','2026-02-17 18:50:46'),
(2,'7f9b37ae-d459-41e2-a23f-d12d24c69987',5,'CREACION',NULL,NULL,'Ticket creado','2026-02-17 19:03:54'),
(3,'39bcac38-d276-4910-ada6-dc2c4e1d32a0',5,'CREACION',NULL,NULL,'Ticket creado','2026-02-17 19:09:20'),
(4,'39bcac38-d276-4910-ada6-dc2c4e1d32a0',5,'ACTUALIZACION','La red se cayó de nuevo.','La red se cayó de nuevo. aja','descripcion cambiado de \"La red se cayó de nuevo.\" a \"La red se cayó de nuevo. aja\"','2026-02-17 19:38:40'),
(5,'39bcac38-d276-4910-ada6-dc2c4e1d32a0',5,'ACTUALIZACION','Sin asignar','Maria  Briceño R','tecnico_asignado cambiado de \"Sin asignar\" a \"Maria  Briceño R\"','2026-02-17 19:38:40'),
(6,'39bcac38-d276-4910-ada6-dc2c4e1d32a0',5,'COMENTARIO',NULL,NULL,'Comentario agregado','2026-02-20 14:55:08'),
(7,'39bcac38-d276-4910-ada6-dc2c4e1d32a0',5,'ACTUALIZACION','La red se cayó de nuevo. aja','La red se cayó de nuevo. ajax','descripcion cambiado de \"La red se cayó de nuevo. aja\" a \"La red se cayó de nuevo. ajax\"','2026-02-20 15:21:53'),
(9,'39bcac38-d276-4910-ada6-dc2c4e1d32a0',5,'ACTUALIZACION','La red se cayó de nuevo. ajax','La red se cayó de nuevo','descripcion cambiado de \"La red se cayó de nuevo. ajax\" a \"La red se cayó de nuevo\"','2026-02-20 15:31:24'),
(10,'39bcac38-d276-4910-ada6-dc2c4e1d32a0',5,'COMENTARIO',NULL,NULL,'Comentario agregado','2026-02-20 15:55:51'),
(11,'39bcac38-d276-4910-ada6-dc2c4e1d32a0',5,'COMENTARIO',NULL,NULL,'Comentario agregado','2026-02-20 15:56:27'),
(12,'39bcac38-d276-4910-ada6-dc2c4e1d32a0',5,'COMENTARIO',NULL,NULL,'Comentario agregado','2026-02-20 19:59:45'),
(13,'39bcac38-d276-4910-ada6-dc2c4e1d32a0',5,'ACTUALIZACION','Abierto','En Proceso','estado cambiado de \"Abierto\" a \"En Proceso\"','2026-02-20 16:04:07'),
(14,'39bcac38-d276-4910-ada6-dc2c4e1d32a0',5,'ACTUALIZACION','En Proceso','Resuelto','Estado cambiado de \"En Proceso\" a \"Resuelto\"','2026-02-20 16:06:43'),
(21,'79c1de31-1cc7-4be0-b487-60139b4329fe',12,'CREATION',NULL,NULL,'Ticket creado','2026-02-21 18:45:52'),
(22,'79c1de31-1cc7-4be0-b487-60139b4329fe',5,'UPDATE','Sin asignar','Maria IT two','assigned_technician cambiado de \"Sin asignar\" a \"Maria IT two\"','2026-02-21 19:03:14'),
(23,'79c1de31-1cc7-4be0-b487-60139b4329fe',5,'UPDATE','Abierto','Asignado','state cambiado de \"Abierto\" a \"Asignado\"','2026-02-21 19:03:14'),
(24,'79c1de31-1cc7-4be0-b487-60139b4329fe',10,'UPDATE','Asignado','En Proceso','state cambiado de \"Asignado\" a \"En Proceso\"','2026-02-21 19:18:56'),
(25,'79c1de31-1cc7-4be0-b487-60139b4329fe',10,'UPDATE','En Proceso','Resuelto','Estado cambiado de \"En Proceso\" a \"Resuelto\"','2026-02-21 19:29:30'),
(26,'3ffaaf09-0af4-4cbb-aff5-396d6779d334',12,'CREATION',NULL,NULL,'Ticket creado','2026-02-21 19:49:05'),
(27,'3ffaaf09-0af4-4cbb-aff5-396d6779d334',5,'UPDATE','Sin asignar','Maria IT two','assigned_technician cambiado de \"Sin asignar\" a \"Maria IT two\"','2026-02-21 19:58:29'),
(28,'3ffaaf09-0af4-4cbb-aff5-396d6779d334',5,'UPDATE','Abierto','Asignado','state cambiado de \"Abierto\" a \"Asignado\"','2026-02-21 19:58:29'),
(29,'3ffaaf09-0af4-4cbb-aff5-396d6779d334',10,'UPDATE','Asignado','Cerrado','state cambiado de \"Asignado\" a \"Cerrado\"','2026-02-21 20:00:56');
/*!40000 ALTER TABLE `ticket_history` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `ticket_priorities`
--

DROP TABLE IF EXISTS `ticket_priorities`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ticket_priorities`
--

LOCK TABLES `ticket_priorities` WRITE;
/*!40000 ALTER TABLE `ticket_priorities` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `ticket_priorities` VALUES
(2,'Media',2,'bg-yellow-100','Prioridad media, atención normal',1,'2026-02-17 18:22:39','2026-02-17 18:22:39'),
(3,'Alta',3,'bg-orange-100','Prioridad alta, requiere atención pronta',1,'2026-02-17 18:22:39','2026-02-17 18:22:39'),
(4,'Urgente',4,'bg-red-100','Prioridad urgente, requiere atención inmediata',1,'2026-02-17 18:22:39','2026-02-17 18:22:39'),
(11,'Baja',1,'bg-green-100',NULL,1,'2026-02-17 18:42:38','2026-02-17 18:42:38');
/*!40000 ALTER TABLE `ticket_priorities` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `ticket_states`
--

DROP TABLE IF EXISTS `ticket_states`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ticket_states`
--

LOCK TABLES `ticket_states` WRITE;
/*!40000 ALTER TABLE `ticket_states` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `ticket_states` VALUES
(1,'Abierto','Ticket creado y pendiente de asignación','bg-green-400',1,1,'2026-02-17 18:22:39','2026-02-17 19:27:48'),
(2,'Asignado','Ticket asignado a un técnico','bg-yellow-200',2,1,'2026-02-17 18:22:39','2026-02-17 19:27:48'),
(3,'En Proceso','Técnico trabajando en la resolución','bg-orange-300',3,1,'2026-02-17 18:22:39','2026-02-17 19:27:48'),
(4,'Resuelto','Ticket resuelto, pendiente de confirmación','bg-blue-100',4,1,'2026-02-17 18:22:39','2026-02-17 19:27:48'),
(5,'Cerrado','Ticket cerrado definitivamente','bg-gray-100',5,1,'2026-02-17 18:22:39','2026-02-17 18:22:39');
/*!40000 ALTER TABLE `ticket_states` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `tickets`
--

DROP TABLE IF EXISTS `tickets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tickets`
--

LOCK TABLES `tickets` WRITE;
/*!40000 ALTER TABLE `tickets` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `tickets` VALUES
('39bcac38-d276-4910-ada6-dc2c4e1d32a0','Falla de red','La red se cayó de nuevo',9,3,4,4,5,5,'[\"/uploads/tickets/ticket-1771355360506-582526171.PNG\",\"/uploads/tickets/ticket-1771355360509-543711500.PNG\"]','2026-02-17 19:09:20','2026-02-21 18:19:40',NULL),
('3ffaaf09-0af4-4cbb-aff5-396d6779d334','Falla de Hardware 2','Se metió un bug en el ordenador',1,7,11,5,12,10,'[\"/uploads/tickets/ticket-1771703345714-932043046.jpg\"]','2026-02-21 19:49:05','2026-02-21 20:00:56','2026-02-21 20:00:56'),
('5fd6b520-fcc0-44e6-8892-a5a3cfb6f14e','Falla de sistema','Ha fallado de manera estrepitosa.',9,2,4,1,5,NULL,'/uploads/tickets/ticket-1771354246010-234137976.PNG','2026-02-17 18:50:46','2026-02-21 18:19:40',NULL),
('79c1de31-1cc7-4be0-b487-60139b4329fe','Falla de red 3','Otra falla de red 3 otra',2,3,4,4,12,10,'[\"/uploads/tickets/ticket-1771699552163-284470268.jpg\",\"/uploads/tickets/ticket-1771699552165-567105812.jpg\"]','2026-02-21 18:45:52','2026-02-21 19:29:30',NULL),
('7f9b37ae-d459-41e2-a23f-d12d24c69987','Falla de Hardware','La pc no quiere encender.',10,1,2,1,5,NULL,'/uploads/tickets/ticket-1771355034025-376685395.PNG','2026-02-17 19:03:54','2026-02-21 18:19:40',NULL);
/*!40000 ALTER TABLE `tickets` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `full_name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `department` varchar(100) DEFAULT NULL,
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
  CONSTRAINT `1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `users` VALUES
(5,'Maria  Briceño R','mvbridev@gmail.com','$2a$10$nA4810S5qBPYFE3Auw/tRu.ohfwBIGaRvhqQR1Pxi7vlH2oxZlNna','4249312548','Secretaria',1,1,1,'2026-02-09 18:12:04','2026-02-20 16:13:13',NULL,NULL,NULL,NULL),
(10,'Maria IT two','mvbri10@gmail.com','$2a$10$x8FsGprsxgEI.wTxIOCYHOGTSp4Wr.YxPgizqWst/Om8QuLSmWYJ2',NULL,'IT',2,1,1,'2026-02-12 23:03:20','2026-02-20 16:13:03','¿Cuál es mi mascota?','$2a$10$n5fHDup1vY.pDUggM4pzi.qiu28YQRMzwhOJrIbsYAytfZy8aWLmi','¿En qué ciudad naciste?','$2a$10$Q.LOMQYV.aDYKpeePDvpDO7Q36/1Rq1McJBdvhai3oGdZzsprjtge'),
(12,'Maria Colaboradora','mvbri06@gmail.com','$2a$10$p76V87iY39eZgvRWHvjeQ.3geyktYA19Wz7SiNcGL7m5v3ovgFaD6','+58 4249312888','otro',3,1,1,'2026-02-20 16:11:42','2026-02-21 19:28:19',NULL,NULL,NULL,NULL),
(13,'Alias','mvbri10+55@gmail.com','$2a$10$IYIAgJvdclV9iY0U8jEhIuH0T360KDEH84Ioy.bDfjxq0UZdJImuO',NULL,'IT',3,1,1,'2026-02-21 20:14:39','2026-02-23 19:45:08',NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `verification_tokens`
--

DROP TABLE IF EXISTS `verification_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
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
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `verification_tokens`
--

LOCK TABLES `verification_tokens` WRITE;
/*!40000 ALTER TABLE `verification_tokens` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `verification_tokens` VALUES
(5,5,'523bdf5710cd2ff3542e937854a5532e3ad21c87c960665fe321c73e31cbcd15','email_verification','2026-02-10 18:12:04',1,'2026-02-09 18:12:04'),
(17,5,'9cd9352ad23b0e45af12ed3ba537568a11f83431ade92f633ef29e319cdd0bbc','password_recovery','2026-02-12 23:28:25',1,'2026-02-12 22:28:25'),
(23,10,'b06e1bd42ab1474224619342319cd53668325cee009ff4339f2d7064cfdf8003','email_verification','2026-02-13 23:04:19',1,'2026-02-12 23:04:19'),
(27,10,'a437d535bd34cde3355af1d901af2b05e94e715ddeb3f53eed55ca9b9bb6f3ab','password_recovery','2026-02-17 18:56:45',1,'2026-02-17 17:56:45'),
(28,12,'c7fd7b698d0f2c971bb34b7302d4844486a26855a6b03b6d4cee8e0cba668b74','email_verification','2026-02-21 16:11:42',1,'2026-02-20 16:11:42'),
(29,13,'9364da7fd725c0cea6b39c66778a48421ebe2ff14eb8b8464e24b79bcaf1a021','email_verification','2026-02-22 20:14:39',1,'2026-02-21 20:14:39');
/*!40000 ALTER TABLE `verification_tokens` ENABLE KEYS */;
UNLOCK TABLES;
commit;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*M!100616 SET NOTE_VERBOSITY=@OLD_NOTE_VERBOSITY */;

-- Dump completed on 2026-02-23 16:47:07
