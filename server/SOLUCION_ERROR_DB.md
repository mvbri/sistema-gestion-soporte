# Solución: Error de Conexión a Base de Datos

## Error: "Client does not support authentication protocol 'auth_gssapi_client'"

Este error indica un problema con el método de autenticación de MariaDB/MySQL.

### Solución 1: Cambiar el método de autenticación del usuario

**IMPORTANTE:** Ejecuta estos comandos SQL en MariaDB (HeidiSQL, DBeaver, o línea de comandos), NO en JavaScript.

1. Conéctate a MariaDB usando HeidiSQL, DBeaver, o desde la línea de comandos:
```bash
mysql -u root -p
```

2. Una vez conectado, ejecuta estos comandos SQL (reemplaza `'tu_contraseña'` con tu contraseña real):

```sql
-- Si el usuario root existe, cámbialo
ALTER USER 'root'@'localhost' IDENTIFIED BY 'tu_contraseña';

-- Para MariaDB 10.4+, usa este comando:
ALTER USER 'root'@'localhost' IDENTIFIED VIA mysql_native_password USING PASSWORD('tu_contraseña');

-- O si estás usando MySQL en lugar de MariaDB:
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'tu_contraseña';

FLUSH PRIVILEGES;
```

**Ejemplo con contraseña "mipassword123":**
```sql
ALTER USER 'root'@'localhost' IDENTIFIED BY 'mipassword123';
ALTER USER 'root'@'localhost' IDENTIFIED VIA mysql_native_password USING PASSWORD('mipassword123');
FLUSH PRIVILEGES;
```

### Solución 2: Verificar configuración en .env

Asegúrate de que tu `server/.env` tenga:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=tu_contraseña_real
DB_NAME=sistema_soporte
```

### Solución 3: Verificar que MariaDB esté corriendo

**Windows:**
- Abre "Servicios" (services.msc)
- Busca "MariaDB" o "MySQL"
- Asegúrate de que esté "En ejecución"

**O desde PowerShell:**
```powershell
Get-Service | Where-Object {$_.Name -like "*mariadb*" -or $_.Name -like "*mysql*"}
```

### Solución 4: Probar conexión manual

Crea un archivo `server/test-connection.js`:

```javascript
import mariadb from 'mariadb';
import dotenv from 'dotenv';

dotenv.config();

async function test() {
    let conn;
    try {
        conn = await mariadb.createConnection({
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT) || 3306,
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'sistema_soporte',
            allowPublicKeyRetrieval: true
        });
        console.log('✅ Conexión exitosa!');
        const result = await conn.query('SELECT 1 as test');
        console.log('✅ Query exitosa:', result);
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        if (conn) conn.end();
        process.exit();
    }
}

test();
```

Ejecuta: `node server/test-connection.js`

### Solución 5: Verificar que la base de datos existe

```sql
SHOW DATABASES;
```

Si no existe `sistema_soporte`, créala:
```sql
CREATE DATABASE sistema_soporte;
```

Luego ejecuta el script `server/database/schema.sql`

## Error: "pool timeout"

Este error indica que no se puede establecer conexión con la base de datos después de 30 segundos.

### Diagnóstico Rápido

**Paso 1: Probar conexión con script de prueba**

```bash
cd server
node test-connection.js
```

Este script te dirá exactamente cuál es el problema.

### Causas Comunes y Soluciones

#### 1. MariaDB no está corriendo

**Windows:**
```powershell
# Verificar si está corriendo
Get-Service | Where-Object {$_.Name -like "*mariadb*" -or $_.Name -like "*mysql*"}

# Iniciar MariaDB (si está detenido)
Start-Service -Name "MariaDB"
# O el nombre puede ser "MySQL" dependiendo de tu instalación
```

**O desde Servicios:**
- Presiona `Win + R`, escribe `services.msc`
- Busca "MariaDB" o "MySQL"
- Haz clic derecho → Iniciar

#### 2. Credenciales incorrectas en `.env`

Verifica que `server/.env` tenga:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=tu_contraseña_real
DB_NAME=sistema_soporte
```

**Importante:** 
- No uses comillas en los valores
- No dejes espacios alrededor del `=`
- Verifica que la contraseña sea correcta

#### 3. La base de datos no existe

Conéctate a MariaDB y verifica:
```sql
SHOW DATABASES;
```

Si no existe `sistema_soporte`, créala:
```sql
CREATE DATABASE sistema_soporte;
```

Luego ejecuta el schema:
```bash
# Desde HeidiSQL, DBeaver, o línea de comandos
# Ejecuta el contenido de: server/database/schema.sql
```

#### 4. Puerto incorrecto

Verifica que MariaDB esté escuchando en el puerto 3306:
```sql
SHOW VARIABLES LIKE 'port';
```

Si usa otro puerto, actualiza `DB_PORT` en `.env`

#### 5. Verificar conexión manual

```bash
# Probar desde línea de comandos
mysql -u root -p -h localhost
```

Si esto funciona, el problema está en la configuración del código.
Si no funciona, el problema está en MariaDB o las credenciales.

#### 6. Firewall bloqueando

En Windows, verifica que el puerto 3306 no esté bloqueado:
```powershell
# Ver reglas de firewall
Get-NetFirewallRule | Where-Object {$_.DisplayName -like "*mysql*" -or $_.DisplayName -like "*mariadb*"}
```

