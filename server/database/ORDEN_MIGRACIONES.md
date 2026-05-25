## 📋 Orden de Ejecución de Migraciones (para replicar en otra PC)

> Este documento refleja **solo** las migraciones que actualmente existen en `server/database/`
> y en el **orden correcto de dependencias** para levantar una base vacía en otra máquina.

---

## ✅ Orden recomendado desde una base vacía

Ejecutar estas migraciones **en este orden**:

1. **`migration_2026-02-25_22-00-00_create_roles.sql`**
   - Crea la base de datos `sistema_soporte` y la tabla `roles`.

2. **`migration_2026-02-25_22-01-00_create_incident_areas.sql`**
   - Crea la tabla `incident_areas`.

3. **`migration_2026-02-25_22-02-00_create_users.sql`**
   - Crea la tabla `users` con `role_id` y `incident_area_id`.

4. **`migration_2026-02-25_17-39-53_add_incident_area_id_to_users.sql`**
   - Asegura columna, índice y foreign key `incident_area_id` en `users` (seguro aunque ya exista).

5. **`migration_2026-02-25_17-19-57_add_security_questions_columns.sql`**
   - Agrega las columnas de preguntas/respuestas de seguridad a `users` si no existen.

6. **`migration_2026-02-25_22-03-00_create_verification_tokens.sql`**
   - Crea la tabla `verification_tokens` (FK a `users`).

7. **`migration_2026-02-25_22-04-00_create_ticket_states.sql`**
   - Crea la tabla `ticket_states`.

8. **`migration_2026-02-25_22-05-00_create_ticket_categories.sql`**
   - Crea la tabla `ticket_categories`.

9. **`migration_2026-02-25_22-06-00_create_ticket_priorities.sql`**
   - Crea la tabla `ticket_priorities`.

10. **`migration_2026-02-25_22-07-00_create_tickets.sql`**
    - Crea la tabla `tickets` con sus foreign keys a `users`, `incident_areas`, `ticket_*`.

11. **`migration_2026-02-25_22-08-00_create_ticket_comments.sql`**
    - Crea la tabla `ticket_comments` (FK a `tickets` y `users`).

12. **`migration_2026-02-25_22-09-00_create_ticket_history.sql`**
    - Crea la tabla `ticket_history` (FK a `tickets` y `users`).

13. **`migration_2026-02-24_20-38-56_add_equipment_types.sql`**
    - Crea la tabla `equipment_types` y carga tipos por defecto.

14. **`migration_2026-02-24_20-38-56_add_equipment.sql`**
    - Crea la tabla `equipment` (FK a `equipment_types` y `users`).

15. **`migration_2026-02-25_21-00-00_add_consumables.sql`**
    - Crea `consumable_types` y `consumables`.

16. **`migration_2026-02-25_21-20-00_add_tools.sql`**
    - Crea `tool_types` y `tools` (FK opcional a `users`).

17. **`migration_2026-02-24_21-10-00_add_ticket_equipment.sql`**
    - Crea la tabla `ticket_equipment` (FK a `tickets` y `equipment`).

18. **`migration_2026-02-25_22-10-00_seed_initial_data.sql`**
    - Inserta datos iniciales en `roles`, `ticket_states`, `ticket_categories`,
      `ticket_priorities` e `incident_areas` usando `INSERT IGNORE`.

19. **`migration_2026-04-29_14-02-00_create_material_requests.sql`**
    - Crea `material_requests`, `material_request_items`, `material_request_history` y `material_request_comments`.

20. **`migration_2026-04-29_15-35-00_allow_manual_material_items.sql`**
    - Permite ítems manuales en solicitudes de materiales (`source_mode`, nombres personalizados).

21. **`migration_2026-04-29_16-30-00_add_material_request_addressed_to_and_area.sql`**
    - Agrega `addressed_to` y `request_area` a `material_requests`.

22. **`migration_2026-04-29_18-00-00_remove_quantity_not_applicable_from_material_items.sql`**
    - Ajusta restricciones de cantidad en ítems de solicitud.

23. **`migration_2026-04-29_19-15-00_add_addressee_name_and_title.sql`**
    - Agrega `addressee_name` y `addressee_title`, migra datos desde `addressed_to` y elimina esa columna.

24. **`migration_2026-04-29_20-30-00_rename_request_area_to_addressee_addressing_text.sql`**
    - Renombra `request_area` → `addressee_addressing_text` (TEXT). **Requerida** para crear solicitudes con el código actual.

---

## 🧪 Cómo ejecutar todo en otra PC

Desde una terminal MySQL, por ejemplo:

```sql
SOURCE server/database/migration_2026-02-25_22-00-00_create_roles.sql;
SOURCE server/database/migration_2026-02-25_22-01-00_create_incident_areas.sql;
SOURCE server/database/migration_2026-02-25_22-02-00_create_users.sql;
SOURCE server/database/migration_2026-02-25_17-39-53_add_incident_area_id_to_users.sql;
SOURCE server/database/migration_2026-02-25_17-19-57_add_security_questions_columns.sql;
SOURCE server/database/migration_2026-02-25_22-03-00_create_verification_tokens.sql;
SOURCE server/database/migration_2026-02-25_22-04-00_create_ticket_states.sql;
SOURCE server/database/migration_2026-02-25_22-05-00_create_ticket_categories.sql;
SOURCE server/database/migration_2026-02-25_22-06-00_create_ticket_priorities.sql;
SOURCE server/database/migration_2026-02-25_22-07-00_create_tickets.sql;
SOURCE server/database/migration_2026-02-25_22-08-00_create_ticket_comments.sql;
SOURCE server/database/migration_2026-02-25_22-09-00_create_ticket_history.sql;
SOURCE server/database/migration_2026-02-24_20-38-56_add_equipment_types.sql;
SOURCE server/database/migration_2026-02-24_20-38-56_add_equipment.sql;
SOURCE server/database/migration_2026-02-25_21-00-00_add_consumables.sql;
SOURCE server/database/migration_2026-02-25_21-20-00_add_tools.sql;
SOURCE server/database/migration_2026-02-24_21-10-00_add_ticket_equipment.sql;
SOURCE server/database/migration_2026-02-25_22-10-00_seed_initial_data.sql;
SOURCE server/database/migration_2026-04-29_14-02-00_create_material_requests.sql;
SOURCE server/database/migration_2026-04-29_15-35-00_allow_manual_material_items.sql;
SOURCE server/database/migration_2026-04-29_16-30-00_add_material_request_addressed_to_and_area.sql;
SOURCE server/database/migration_2026-04-29_18-00-00_remove_quantity_not_applicable_from_material_items.sql;
SOURCE server/database/migration_2026-04-29_19-15-00_add_addressee_name_and_title.sql;
SOURCE server/database/migration_2026-04-29_20-30-00_rename_request_area_to_addressee_addressing_text.sql;
```

Puedes adaptar las rutas según dónde ejecutes MySQL (por ejemplo, usando rutas absolutas).

### Diagnóstico rápido (formularios ↔ esquema BD)

Desde `server/`:

```bash
node scripts/check-db-schema.js
node scripts/apply-pending-schema-fixes.js
```

Ver `server/scripts/README.md` para un formulario concreto (`create-ticket`, `create-loan`, etc.).

---

## ℹ️ Notas

- **`schema.sql`** y **`schema_tickets.sql`** son scripts antiguos de esquema completo y **no son necesarios** para una instalación nueva si ejecutas todas las migraciones anteriores.
- Todas las migraciones están escritas para ser **seguras de re-ejecutar** (`CREATE TABLE IF NOT EXISTS`, chequear columnas, `INSERT IGNORE`, etc.).
- Si alguna migración falla en otra PC, revisa el mensaje de error y ejecuta de nuevo a partir de esa migración una vez corregido el problema.
