-- Migration: Fix role_ids in users table
-- Corrige los role_id incorrectos y asegura que los roles tengan IDs correctos (1, 2, 3)

USE sistema_soporte;

-- Paso 1: Asegurar que existan los roles con los nombres correctos
INSERT IGNORE INTO roles (id, name, description) VALUES
(1, 'administrator', 'Administrador del sistema con acceso completo'),
(2, 'technician', 'Técnico de soporte con permisos para gestionar incidencias'),
(3, 'end_user', 'Usuario final que puede reportar incidencias');

-- Paso 2: Obtener los IDs actuales de los roles (pueden no ser 1, 2, 3)
SET @admin_old_id = (SELECT id FROM roles WHERE name = 'administrator' ORDER BY id LIMIT 1);
SET @tech_old_id = (SELECT id FROM roles WHERE name = 'technician' ORDER BY id LIMIT 1);
SET @user_old_id = (SELECT id FROM roles WHERE name = 'end_user' ORDER BY id LIMIT 1);

-- Paso 3: Actualizar usuarios para usar los IDs correctos basándose en el nombre del rol
-- Si el role_id apunta a un rol con nombre 'administrator', cambiar a ID 1
UPDATE users u
INNER JOIN roles r ON u.role_id = r.id
SET u.role_id = 1
WHERE r.name = 'administrator' AND u.role_id != 1;

-- Si el role_id apunta a un rol con nombre 'technician', cambiar a ID 2
UPDATE users u
INNER JOIN roles r ON u.role_id = r.id
SET u.role_id = 2
WHERE r.name = 'technician' AND u.role_id != 2;

-- Si el role_id apunta a un rol con nombre 'end_user', cambiar a ID 3
UPDATE users u
INNER JOIN roles r ON u.role_id = r.id
SET u.role_id = 3
WHERE r.name = 'end_user' AND u.role_id != 3;

-- Paso 4: Corregir usuarios con role_id NULL o que no apunta a ningún rol válido
-- Asignar role_id = 3 (end_user) por defecto
UPDATE users 
SET role_id = 3 
WHERE role_id IS NULL 
   OR role_id NOT IN (SELECT id FROM roles WHERE name IN ('administrator', 'technician', 'end_user'));

-- Paso 5: Asegurar que los roles con IDs 1, 2, 3 tengan los nombres correctos
UPDATE roles SET name = 'administrator', description = 'Administrador del sistema con acceso completo' WHERE id = 1;
UPDATE roles SET name = 'technician', description = 'Técnico de soporte con permisos para gestionar incidencias' WHERE id = 2;
UPDATE roles SET name = 'end_user', description = 'Usuario final que puede reportar incidencias' WHERE id = 3;

-- Paso 6: Eliminar roles duplicados o con IDs incorrectos (solo si no tienen usuarios asignados)
-- Primero, eliminar foreign key constraint temporalmente si es necesario
-- Nota: Esto puede fallar si hay foreign keys, pero es necesario para limpiar
DELETE r FROM roles r
LEFT JOIN users u ON r.id = u.role_id
WHERE r.id NOT IN (1, 2, 3) 
AND u.id IS NULL;

-- Paso 7: Verificación final - asegurar que todos los role_id sean 1, 2 o 3
UPDATE users 
SET role_id = 3 
WHERE role_id NOT IN (1, 2, 3);
