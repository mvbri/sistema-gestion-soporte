# Cómo Reiniciar el Servidor de Node.js

## Si el servidor está corriendo

### Opción 1: Detener y Reiniciar (Recomendado)

1. **Detener el servidor:**
   - Ve a la terminal donde está corriendo
   - Presiona `Ctrl + C` (Windows/Linux) o `Cmd + C` (Mac)
   - Espera a que se detenga completamente

2. **Reiniciar el servidor:**
   ```bash
   npm run dev:server
   ```

### Opción 2: Reinicio Rápido (Si usas nodemon)

Si tienes `nodemon` instalado (ya está en las dependencias), el servidor se reinicia automáticamente cuando detecta cambios en los archivos.

Si no se reinicia automáticamente:
```bash
# Detener con Ctrl+C y luego:
npm run dev:server
```

## Comandos Disponibles

### Solo Backend
```bash
npm run dev:server
```
O desde la carpeta server:
```bash
cd server
npm run dev
```

### Frontend y Backend juntos
```bash
npm run dev
```

### Solo Frontend
```bash
npm run dev:client
```

## Verificar que el Servidor Está Corriendo

Después de reiniciar, deberías ver en la consola:
```
Servidor corriendo en puerto 5000
Ambiente: development
Servidor de email listo para enviar mensajes
```

Si ves errores, revisa:
- Que MariaDB esté corriendo
- Que el archivo `.env` esté configurado correctamente
- Que la base de datos `sistema_soporte` exista

## Solución de Problemas

### El servidor no se detiene con Ctrl+C

1. Cierra la terminal completamente
2. Abre una nueva terminal
3. Reinicia el servidor

### Puerto 5000 ya está en uso

```bash
# Windows - Encontrar proceso usando el puerto
netstat -ano | findstr :5000

# Matar el proceso (reemplaza PID con el número que aparezca)
taskkill /PID <PID> /F
```

Luego reinicia el servidor.

