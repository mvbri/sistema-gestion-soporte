# Pendientes y dudas — Módulo de Tickets

> Documento de diseño y decisiones pendientes.  
> Última revisión: 2026-06-09

---

## 1. Flujo y ciclo de vida de los tickets

### Estado actual en el sistema

| ID | Estado      | Descripción actual en BD                          |
|----|-------------|-----------------------------------------------------|
| 1  | Abierto     | Ticket creado, pendiente de asignación              |
| 2  | Asignado    | Ticket asignado a un técnico                        |
| 3  | En Proceso  | Técnico trabajando en la resolución                 |
| 4  | Resuelto    | Ticket resuelto, pendiente de confirmación          |
| 5  | Cerrado     | Ticket cerrado definitivamente                      |

**Endpoints existentes:**
- `PATCH /tickets/:id/iniciar-progreso` — Asignado → En Proceso (técnico asignado)
- `PATCH /tickets/:id/marcar-resuelto` — → Resuelto (técnico, admin o usuario creador)
- `PUT /tickets/:id` — Cambio de estado (admin: cualquier campo; técnico: solo estado)

**Historial:** tabla `ticket_history` (`change_type`, `previous_field`, `new_field`, `description`, `changed_at`).

**Cierre:** al pasar a estado 5 (Cerrado), se setea `closed_at = NOW()` en `Ticket.update()`.
### Idea: ventana de reapertura en "Resuelto"

- [ ] **Pendiente:** Definir ventana de reapertura (48 h, 72 h u otro valor configurable).
- [ ] **Pendiente:** Si el usuario comenta o usa "¿No se ha solucionado?" dentro de esa ventana → reabrir automáticamente.
- [ ] **Duda:** ¿La reapertura va a **En Proceso** (id 3) o a un estado explícito **Reabierto**?
  - Propuesta: internamente **En Proceso**; en UI mostrar badge **"Reabierto"** (sin nuevo `state_id`).


## 2. Control de acceso por rol

### Propuesta deseada

| Rol            | Acción                                      |
|----------------|---------------------------------------------|
| Técnico        | Marcar como **Resuelto**                    |
| Administrador  | **Reabrir** o **Cerrar** definitivamente  |
| Usuario        | Botón **"¿No se ha solucionado?"** si está Resuelto |

### Estado actual

| Rol        | Marcar resuelto | Cambiar estado | Cerrar (→ 5) |
|------------|-----------------|----------------|--------------|
| Técnico    | Sí (asignado, En Proceso) | Sí (solo estado) | Vía `updateTicket` sin restricción explícita de transición |
| Admin      | Sí              | Sí (todo)      | Sí (`closed_at` se setea) |
| Usuario    | Sí (creador, Asignado o En Proceso) | No | No directo |

### Pendientes

- [ ] Restringir quién puede pasar a **Cerrado** (solo admin).
- [ ] Restringir quién puede **reabrir** (admin explícito; usuario vía botón en ventana).
- [ ] Impedir que técnico cierre definitivamente sin clasificación de cierre.
- [ ] Endpoint dedicado `PATCH /tickets/:id/reabrir` con validación de rol y ventana temporal.
- [ ] Endpoint dedicado `PATCH /tickets/:id/cerrar` con motivo obligatorio.

---

## 3. Motivo / clasificación de cierre

### Idea

Al cerrar, obligar a clasificar:
- Solucionado
- Cancelado
- Duplicado
- (otros según negocio)

### Pendientes de diseño

- [ ] **Campo en BD:** `closure_reason` o tabla `ticket_closure_reasons` (catálogo).
- [ ] **Duda:** ¿El motivo aplica solo al pasar a **Cerrado** o también al marcar **Resuelto**?
- [ ] **Duda:** ¿Valores fijos (enum) o catálogo configurable por admin (como categorías)?
- [ ] UI: modal obligatorio al cerrar; no permitir submit sin selección.

**Convención del proyecto:** nombres en inglés en BD (`closure_reason`, `final_status`, etc.).

---

## 4. Reapertura sin cambiar ID

### Regla acordada

- No crear ticket nuevo; conservar el mismo `id`.
- Cambiar estado: Resuelto → En Proceso (o Reabierto visual).
- Registrar en historial y/o comentario:
  > "El ticket fue reabierto por [Usuario] debido a: [Motivo]"

### Implementación propuesta (eficiente)

1. **Transacción:**
   - `UPDATE tickets SET state_id = 3, reopened = TRUE, reopened_at = NOW() WHERE id = ?`
   - `INSERT INTO ticket_history (..., change_type = 'REOPEN', description = '...')`
   - Opcional: `INSERT INTO ticket_comments` con el motivo visible para el usuario.

2. **Campos opcionales en `tickets`:**
   - `reopened` BOOLEAN DEFAULT FALSE
   - `reopened_at` TIMESTAMP NULL
   - `resolved_at` TIMESTAMP NULL (para calcular ventana de reapertura)
   - `reopen_window_hours` INT — ¿global en config o por ticket?

3. **Reapertura automática por comentario:**
   - En `addComment`: si `state_id = 4` y `NOW() - resolved_at < ventana` y rol = `end_user` (creador) → disparar reapertura.
   - **Duda:** ¿Todo comentario del usuario reabre o solo el botón "¿No se ha solucionado?"?

4. **Job/cron opcional:** tickets en Resuelto sin respuesta tras X horas → Cerrado automático (Solucionado).

### Historial — extensión sugerida

Opción A: reutilizar `ticket_history` con `change_type = 'REOPEN'`.  
Opción B: tabla `ticket_actions` (`ticket_id`, `user_id`, `action`, `comment`, `created_at`).

- [ ] **Duda:** ¿`ticket_history` basta o conviene tabla de acciones semánticas?

---

## 5. Dashboard y UI

- [ ] Badge **"Reabierto"** cuando `reopened = true` y `state_id = 3` (aunque el estado diga "En Proceso").
- [ ] En listado: indicar si está en ventana de reapertura (Resuelto + tiempo restante).
- [ ] Botón usuario: **"¿No se ha solucionado?"** solo si Resuelto y dentro de ventana.
- [ ] Ocultar "Marcar resuelto" si ya está Resuelto o Cerrado (parcialmente implementado).
- [ ] Métricas: distinguir cierre definitivo (`closed_at`) vs. resolución temporal (`resolved_at`).

---

## 6. Dudas abiertas (resumen)

| # | Pregunta | Opciones |
|---|----------|----------|
| 1 | ¿Duración de ventana de reapertura? | 48 h / 72 h / configurable en admin |
| 2 | ¿Estado "Pendiente" en el flujo? | Nuevo estado / usar comentarios / no implementar |
| 3 | ¿Reapertura automática al comentar o solo con botón? | Botón explícito (recomendado) / ambos |
| 4 | ¿Estado interno Reabierto vs. badge sobre En Proceso? | Badge (recomendado) / nuevo `state_id` |
| 5 | ¿Motivo de cierre obligatorio también en Resuelto? | Solo Cerrado / ambos |
| 6 | ¿Cierre automático tras ventana sin respuesta? | Sí / No / solo notificación |
| 7 | ¿Usuario puede marcar Resuelto o solo técnico? | Actual: ambos — ¿mantener? |
| 8 | ¿`resolved_at` al marcar resuelto? | Necesario para ventana — **pendiente de implementar** |

---

## 7. Checklist de implementación (orden sugerido)

1. [ ] Migración: `resolved_at`, `reopened`, `reopened_at`, `closure_reason`
2. [ ] Setear `resolved_at` en `markAsResolved`
3. [ ] Endpoint `reabrir` con permisos y motivo
4. [ ] Endpoint `cerrar` con motivo obligatorio (solo admin)
5. [ ] Validar transiciones de estado (máquina de estados)
6. [ ] UI: botones por rol y badge Reabierto
7. [ ] Cron opcional: auto-cierre tras ventana
8. [ ] Tests de flujo: Resuelto → comentario/botón → En Proceso → Cerrado

---

## 8. Referencias en el código actual

- Estados por defecto: `server/database/schema.sql`
- Tabla tickets: `server/database/migration_2026-02-25_22-07-00_create_tickets.sql`
- Historial: `server/database/migration_2026-02-25_22-09-00_create_ticket_history.sql`
- Controlador: `server/src/controllers/ticketController.js` (`markAsResolved`, `updateTicket`, `addComment`)
- Modelo (`closed_at`): `server/src/models/Ticket.js`
- UI detalle: `client/src/pages/TicketDetail.tsx`
- Rutas: `server/src/routes/ticketRoutes.js`

---

## 9. Ideas relacionadas

- [Unificar panel de control con tickets (técnico y administrador)](IDEA_UNIFICAR_PANEL_TICKETS.md) — **implementado** (Opción B: pestañas en `/tickets`) 