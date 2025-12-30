-- Script SQL para corregir el método de autenticación
-- Ejecuta este script en MariaDB (HeidiSQL, DBeaver, etc.)
-- NO lo ejecutes en JavaScript

-- Reemplaza 'tu_contraseña' con tu contraseña real de MariaDB
-- Ejemplo: si tu contraseña es "mipassword123", cambia la línea de abajo

-- Para MariaDB 10.4+
ALTER USER 'root'@'localhost' IDENTIFIED BY '123457';
ALTER USER 'root'@'localhost' IDENTIFIED VIA mysql_native_password USING PASSWORD('tu_contraseña');

-- Si estás usando MySQL (no MariaDB), usa esto en su lugar:
-- ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'tu_contraseña';

FLUSH PRIVILEGES;

-- Verificar que funcionó
SELECT user, host, plugin FROM mysql.user WHERE user = 'root';

