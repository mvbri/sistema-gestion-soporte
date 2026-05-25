# Scripts de diagnóstico de base de datos

Herramientas para detectar cuando la BD local no coincide con lo que esperan los formularios (error 1054, columnas desconocidas, etc.).

## Diagnóstico (todos los formularios)

```bash
cd server
node scripts/check-db-schema.js
```

Solo un formulario:

```bash
node scripts/check-db-schema.js create-material-request
node scripts/check-db-schema.js create-loan
node scripts/check-db-schema.js --list
```

Salida ejemplo:

- `[OK]` — tablas y columnas alineadas con el código
- `[PROBLEMAS]` — falta tabla/columna o quedó nombre viejo (`request_area`, `addressed_to`)
- Al final lista migraciones `.sql` sugeridas en `server/database/`

## Reparación automática (parcial)

```bash
node scripts/apply-pending-schema-fixes.js
```

Corrige sin ejecutar a mano:

- `material_requests`: renombrar `request_area`, quitar `addressed_to`
- `material_request_items`: columnas de ítems manuales
- `equipment_loans`: `target_incident_area_id`, checklist `pending_*`
- `users`: columnas de preguntas de seguridad

Si falta una **tabla completa** (p. ej. `equipment_loans`), debes ejecutar la migración SQL indicada; este script no la crea.

## Formularios cubiertos

| id | Pantalla |
|----|----------|
| `register` | Registro |
| `security-questions` | Preguntas de seguridad |
| `create-ticket` | Nuevo ticket |
| `create-material-request` | Solicitud de materiales |
| `create-loan` | Solicitud de préstamo |
| `loan-handover` | Entrega/devolución préstamo |
| `create-equipment` | Nuevo equipo |
| `create-consumable` | Nuevo consumible |
| `create-tool` | Nueva herramienta |
| `frequent-issues` | Fallas frecuentes (admin) |

Definición en `lib/schema-manifest.js` (ampliar al añadir formularios).

## Scripts antiguos

- `check-material-requests-schema.js` → usa `check-db-schema.js create-material-request`
- `apply-material-request-migrations.js` → usa `apply-pending-schema-fixes.js`
