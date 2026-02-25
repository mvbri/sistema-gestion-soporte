# 📋 Orden de Ejecución de Migraciones

## Migraciones Ordenadas por Fecha (Más Reciente Primero)

### ✅ Migraciones Más Recientes (24/02/2026)

1. **`migration_fix_equipment_type_id_simple.sql`** - 24/2/2026 9:14:45 PM
   - **Propósito:** Corrige el error "Unknown column 'type_id'" en la tabla equipment
   - **Acción:** Agrega la columna `type_id` a la tabla `equipment` si no existe
   - **Estado:** ⚠️ **EJECUTAR PRIMERO** (corrige error actual)

2. **`migration_fix_equipment_type_id.sql`** - 24/2/2026 9:12:29 PM
   - **Propósito:** Versión alternativa de la migración anterior (usar la simple)
   - **Acción:** Similar a la anterior pero con sintaxis más compleja
   - **Estado:** ⚠️ **NO EJECUTAR** (usar la versión simple en su lugar)

3. **`migration_add_ticket_equipment.sql`** - 24/2/2026 9:10:00 PM
   - **Propósito:** Crea la relación entre tickets y equipos
   - **Acción:** Crea la tabla `ticket_equipment` para asociar equipos a tickets
   - **Estado:** ⚠️ **EJECUTAR SEGUNDO** (necesaria para asociar equipos)

4. **`migration_add_equipment.sql`** - 24/2/2026 8:38:56 PM
   - **Propósito:** Crea la tabla de equipos (inventario)
   - **Acción:** Crea la tabla `equipment` con todos sus campos
   - **Estado:** ✅ Ya ejecutada (pero falta la columna type_id)

5. **`migration_add_equipment_types.sql`** - 24/2/2026 8:38:56 PM
   - **Propósito:** Crea la tabla de tipos de equipos
   - **Acción:** Crea la tabla `equipment_types` con tipos por defecto
   - **Estado:** ✅ Ya ejecutada

### Migraciones Anteriores (21/02/2026)

6. **`migration_add_user_incident_area.sql`** - 24/2/2026 6:22:55 PM
   - **Propósito:** Agrega campo `incident_area_id` a usuarios
   - **Estado:** ✅ Ya ejecutada

7. **`migration_add_incident_areas.sql`** - 21/2/2026 2:19:23 PM
   - **Propósito:** Crea tabla de áreas de incidentes
   - **Estado:** ✅ Ya ejecutada

8. **`migration_verify_all_columns_english.sql`** - 21/2/2026 2:14:41 PM
   - **Propósito:** Verifica que todas las columnas estén en inglés
   - **Estado:** ✅ Ya ejecutada

9. **`migration_fix_tickets_columns.sql`** - 21/2/2026 2:05:37 PM
   - **Propósito:** Corrige nombres de columnas en tickets
   - **Estado:** ✅ Ya ejecutada

10. **`migration_rename_columns_to_english.sql`** - 21/2/2026 2:05:35 PM
    - **Propósito:** Renombra columnas a inglés
    - **Estado:** ✅ Ya ejecutada

11. **`migration_rename_tables_to_english.sql`** - 21/2/2026 1:29:20 PM
    - **Propósito:** Renombra tablas a inglés
    - **Estado:** ✅ Ya ejecutada

12. **`migration_security_questions_fixed.sql`** - 21/2/2026 1:06:59 PM
    - **Propósito:** Corrige preguntas de seguridad
    - **Estado:** ✅ Ya ejecutada

13. **`migration_security_questions.sql`** - 21/2/2026 1:06:59 PM
    - **Propósito:** Crea tabla de preguntas de seguridad
    - **Estado:** ✅ Ya ejecutada

---

## 🚀 Orden de Ejecución Recomendado

### Si tienes errores actuales:

1. **PRIMERO:** `migration_fix_equipment_type_id_simple.sql`
   - Corrige el error "Unknown column 'type_id'"
   - Ejecutar: ✅ **URGENTE**

2. **SEGUNDO:** `migration_add_ticket_equipment.sql`
   - Habilita la asociación de equipos a tickets
   - Ejecutar: ✅ **NECESARIO**

### Si todo está funcionando:

Las migraciones anteriores ya deberían estar ejecutadas. Solo necesitas las dos más recientes.

---

## 📝 Notas Importantes

- ⚠️ **NO ejecutes** `migration_fix_equipment_type_id.sql` si ya ejecutaste la versión `simple`
- ✅ Las migraciones son **idempotentes** (puedes ejecutarlas varias veces sin problemas)
- 🔄 Si una migración falla, revisa el error y corrige antes de continuar

---

## 🔍 Verificación

Para verificar qué migraciones ya están aplicadas, revisa:
- Si la tabla `equipment` tiene la columna `type_id` → migración #1 aplicada
- Si existe la tabla `ticket_equipment` → migración #3 aplicada
