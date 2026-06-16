# Idea: Unificar panel de control con tickets (técnico y administrador)

> Documento de diseño — panel de trabajo unificado.  
> Última revisión: 2026-06-16  
> **Estado: implementado (Opción B)** — 2026-06-16

---

**Objetivo:** Un solo panel de trabajo de tickets compartido por **técnico** y **administrador**, en lugar de vistas separadas y rutas duplicadas. Misma UX, mismas acciones y mismos filtros; el contenido se adapta al rol y a si el usuario tiene tickets asignados.

## Implementación (Opción B)

- **`/tickets?tab=assigned|created|all`** — panel unificado con pestañas por URL.
- Componentes extraídos: `TicketsTabBar`, `TicketAssignedStats`, `TicketsFiltersPanel`, `TicketListItem`.
- Helpers: `client/src/utils/ticketListTabs.ts`.
- **`/tecnico/dashboard`** redirige a `/tickets?tab=assigned`.
- Menú lateral: un ítem **Panel de tickets** (técnico/admin); eliminado "Panel del Técnico".
- Dashboard cards actualizadas (`TechnicianDashboardActions`, `AdministratorDashboard`).
- Backend: `scope=created_by_me` soportado también para administrador.

**Decisiones resueltas:**

| Duda | Decisión |
|------|----------|
| ¿Reemplaza `/tickets` para técnicos? | Sí — un solo hub en `/tickets` con pestañas. |
| ¿Admin ve pestaña "Todos"? | Sí — pestaña `all` dentro de `/tickets`; `/analytics` se mantiene para gráficos. |

**Pendientes (completados):**

- [x] Extraer lógica del antiguo panel a componentes reutilizables.
- [x] Redirigir `/tecnico/dashboard` → `/tickets?tab=assigned`.
- [x] Actualizar `SidebarMenu.tsx`: enlace compartido técnico + admin.
- [x] Actualizar dashboards para apuntar al panel unificado.
- [x] Renombrar componente de dashboard a `TechnicianDashboardActions`.

---

## Referencia — problema original

| Vista / ruta | Rol | Qué hacía antes |
|--------------|-----|-----------------|
| `/dashboard` | Técnico | Tarjetas de acceso → panel y listado separados |
| `/tecnico/dashboard` | Solo técnico | Panel operativo (stats, acciones) |
| `/tickets` | Todos | Listado genérico fragmentado |

**Archivos principales:**

- `client/src/pages/TicketsList.tsx`
- `client/src/components/tickets/TicketsTabBar.tsx`
- `client/src/components/tickets/TicketAssignedStats.tsx`
- `client/src/components/tickets/TicketsFiltersPanel.tsx`
- `client/src/components/tickets/TicketListItem.tsx`
- `client/src/utils/ticketListTabs.ts`
- `client/src/components/dashboard/TechnicianDashboard.tsx` (`TechnicianDashboardActions`)
- `client/src/components/navbar/SidebarMenu.tsx`
- `client/src/App.tsx`
- `server/src/controllers/ticketController.js`

---

[← Volver a pendientes de tickets](PENDIENTES_TICKETS.md)
