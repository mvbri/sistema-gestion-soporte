## 📋 Orden de Ejecución de Migraciones (para replicar en otra PC)

> Este documento refleja **las 35 migraciones** que existen en `server/database/`
> y el **orden correcto de dependencias** para levantar una base vacía en otra máquina.

---

## ✅ Orden recomendado desde una base vacía

Ejecutar estas migraciones **en este orden** (1–35):

### Núcleo: roles, usuarios y tickets

1. **`migration_2026-02-25_22-00-00_create_roles.sql`**
   - Crea la base de datos `sistema_soporte` y la tabla `roles`.

2. **`migration_2026-02-25_22-01-00_create_incident_areas.sql`**
   - Crea la tabla `incident_areas`.

3. **`migration_2026-02-25_22-02-00_create_users.sql`**
   - Crea la tabla `users` con `role_id`, `incident_area_id` y columnas de preguntas de seguridad.

4. **`migration_2026-02-25_17-39-53_add_incident_area_id_to_users.sql`**
   - Asegura columna, índice y foreign key `incident_area_id` en `users` (idempotente si ya existe en el paso 3).

5. **`migration_2026-02-25_17-19-57_add_security_questions_columns.sql`**
   - Agrega columnas de preguntas/respuestas de seguridad si no existen (idempotente si ya existen en el paso 3).

6. **`migration_2026-02-25_22-03-00_create_verification_tokens.sql`**
   - Crea la tabla `verification_tokens` (FK a `users`).

7. **`migration_2026-02-25_22-04-00_create_ticket_states.sql`**
   - Crea la tabla `ticket_states`.

8. **`migration_2026-02-25_22-05-00_create_ticket_categories.sql`**
   - Crea la tabla `ticket_categories`.

9. **`migration_2026-02-25_22-06-00_create_ticket_priorities.sql`**
   - Crea la tabla `ticket_priorities`.

10. **`migration_2026-02-25_22-07-00_create_tickets.sql`**
    - Crea la tabla `tickets` con FK a `users`, `incident_areas`, `ticket_*`.

11. **`migration_2026-02-25_22-08-00_create_ticket_comments.sql`**
    - Crea `ticket_comments` (FK a `tickets` y `users`).

12. **`migration_2026-02-25_22-09-00_create_ticket_history.sql`**
    - Crea `ticket_history` (FK a `tickets` y `users`).

### Inventario y relación ticket–equipo

13. **`migration_2026-02-24_20-38-56_add_equipment_types.sql`**
    - Crea `equipment_types` y carga tipos por defecto.

14. **`migration_2026-02-24_20-38-56_add_equipment.sql`**
    - Crea `equipment` (FK a `equipment_types` y `users`).

15. **`migration_2026-02-25_21-00-00_add_consumables.sql`**
    - Crea `consumable_types` y `consumables`.

16. **`migration_2026-02-25_21-20-00_add_tools.sql`**
    - Crea `tool_types` y `tools` (FK opcional a `users`).

17. **`migration_2026-02-24_21-10-00_add_ticket_equipment.sql`**
    - Crea `ticket_equipment` (FK a `tickets` y `equipment`).

### Datos iniciales y ajustes post-seed

18. **`migration_2026-02-25_22-10-00_seed_initial_data.sql`**
    - Inserta datos iniciales en `roles`, `ticket_states`, `ticket_categories`,
      `ticket_priorities` e `incident_areas` (`INSERT IGNORE`).

19. **`migration_2026-02-26_19-13-56_fix_role_ids.sql`**
    - Normaliza IDs de roles (1=administrator, 2=technician, 3=end_user) y corrige `users.role_id`.

20. **`migration_2026-03-26_12-00-00_add_frequent_issues.sql`**
    - Crea `frequent_issues` (FK opcional a `ticket_categories`) y datos de ejemplo.

21. **`migration_2026-04-29_21-15-00_priority_alta_red_badge.sql`**
    - Actualiza color de la prioridad «Alta» en `ticket_priorities` (requiere filas del seed).

### Préstamos de equipos

22. **`migration_2026-04-28_09-45-00_create_equipment_loans.sql`**
    - Crea `equipment_pools`, `equipment_loans`, `equipment_loan_items`, checklists, incidents e history.

23. **`migration_2026-05-27_00-16-00_fix_equipment_loans_target_incident_area_tibd.sql`**
    - Agrega `target_incident_area_id` a `equipment_loans` (FK a `incident_areas`) en pasos compatibles con TiDB.

24. **`migration_2026-05-27_00-22-00_fix_equipment_loans_pending_checklist_tidb.sql`**
    - Agrega columnas `pending_physical_condition`, `pending_battery_level`, `pending_observations` (pasos compatibles con TiDB).

25. **`migration_2026-04-29_20-30-00_equipment_loan_comments.sql`**
    - Crea `equipment_loan_comments` (FK a `equipment_loans` y `users`).

### Solicitudes de materiales

26. **`migration_2026-04-29_14-02-00_create_material_requests.sql`**
    - Crea `material_requests`, `material_request_items`, `material_request_history` y `material_request_comments`.

27. **`migration_2026-05-27_00-28-00_fix_material_request_items_manual_tidb.sql`**
    - Permite ítems manuales (`source_mode`, `custom_material_name`, etc.) en pasos compatibles con TiDB.

28. **`migration_2026-04-29_16-30-00_add_material_request_addressed_to_and_area.sql`**
    - Agrega `addressed_to` y `request_area` a `material_requests`.

29. **`migration_2026-04-29_18-00-00_remove_quantity_not_applicable_from_material_items.sql`**
    - Elimina `quantity_not_applicable` si existía en `material_request_items`.

30. **`migration_2026-04-29_19-15-00_add_addressee_name_and_title.sql`**
    - Agrega `addressee_name` y `addressee_title`, migra desde `addressed_to` y elimina esa columna.

31. **`migration_2026-04-29_20-30-00_rename_request_area_to_addressee_addressing_text.sql`**
    - Renombra `request_area` → `addressee_addressing_text` (TEXT). **Requerida** para el código actual de solicitudes.

32. **`migration_2026-05-24_12-00-00_create_schema_migrations.sql`**
    - Crea `schema_migrations` (registro de migraciones aplicadas por `npm run migrate`).

33. **`migration_2026-06-16_14-00-00_add_ticket_reopen_window_settings.sql`**
    - Crea `system_settings` con `ticket_reopen_window_hours` (default 48 h).
    - Agrega `resolved_at` en `tickets` para calcular la ventana de reapertura.

34. **`migration_2026-06-16_16-00-00_add_ticket_reopen_columns.sql`**
    - Agrega `reopened` y `reopened_at` en `tickets` (badge Reabierto sobre En Proceso).

35. **`migration_2026-06-24_12-00-00_add_ticket_closure_reason.sql`**
    - Agrega `closure_reason` (texto libre) en `tickets` para el cierre definitivo por admin.

> **Nota:** Los pasos 25 y 31 comparten timestamp `2026-04-29_20-30-00` pero afectan tablas distintas; el orden entre ellos es interchangeable.

---

## Flujo recomendado (Node)

```bash
cd server
npm run migrate          # aplica pendientes y registra en schema_migrations
npm run dev              # verifica migraciones + columnas de modelos antes de arrancar
```

BD ya migrada a mano (sin historial en `schema_migrations`):

```bash
npm run migrate:baseline
npm run dev
```

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
SOURCE server/database/migration_2026-02-26_19-13-56_fix_role_ids.sql;
SOURCE server/database/migration_2026-03-26_12-00-00_add_frequent_issues.sql;
SOURCE server/database/migration_2026-04-29_21-15-00_priority_alta_red_badge.sql;
SOURCE server/database/migration_2026-04-28_09-45-00_create_equipment_loans.sql;
SOURCE server/database/migration_2026-05-27_00-16-00_fix_equipment_loans_target_incident_area_tibd.sql;
SOURCE server/database/migration_2026-05-27_00-22-00_fix_equipment_loans_pending_checklist_tidb.sql;
SOURCE server/database/migration_2026-04-29_20-30-00_equipment_loan_comments.sql;
SOURCE server/database/migration_2026-04-29_14-02-00_create_material_requests.sql;
SOURCE server/database/migration_2026-05-27_00-28-00_fix_material_request_items_manual_tidb.sql;
SOURCE server/database/migration_2026-04-29_16-30-00_add_material_request_addressed_to_and_area.sql;
SOURCE server/database/migration_2026-04-29_18-00-00_remove_quantity_not_applicable_from_material_items.sql;
SOURCE server/database/migration_2026-04-29_19-15-00_add_addressee_name_and_title.sql;
SOURCE server/database/migration_2026-04-29_20-30-00_rename_request_area_to_addressee_addressing_text.sql;
SOURCE server/database/migration_2026-05-24_12-00-00_create_schema_migrations.sql;
SOURCE server/database/migration_2026-06-16_14-00-00_add_ticket_reopen_window_settings.sql;
SOURCE server/database/migration_2026-06-16_16-00-00_add_ticket_reopen_columns.sql;
SOURCE server/database/migration_2026-06-24_12-00-00_add_ticket_closure_reason.sql;
```

Puedes adaptar las rutas según dónde ejecutes MySQL (por ejemplo, rutas absolutas), o usar `npm run migrate` en lugar de `SOURCE` manual.

### Diagnóstico de esquema

```bash
cd server
npm run schema:check
```

Ver [`server/scripts/README.md`](../scripts/README.md).

---

## ℹ️ Notas

- **`schema.sql`** y **`schema_tickets.sql`** son scripts antiguos de esquema completo y **no son necesarios** para una instalación nueva si ejecutas las **33** migraciones anteriores (o `npm run migrate`).
- Los pasos **4–5** son idempotentes: en instalaciones nuevas `create_users` (3) ya incluye esas columnas.
- La cadena **28 → 30 → 31** de solicitudes de materiales debe respetarse (columnas intermedias `addressed_to` / `request_area` antes del renombrado final).
- La cadena **22 → 23 → 24** de préstamos debe respetarse (tabla base antes de columnas adicionales).
- Si alguna migración falla, corrige el error y reanuda **desde esa migración** (no repitas las anteriores salvo que sean idempotentes y lo necesites).
